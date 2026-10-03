"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { safe, str } from "@/lib/action";
import { parseDate } from "@/lib/dates";
import { PAYMENT_METHODS, oneOf } from "@/lib/labels";
import { fmt } from "@/lib/money";

export const saveAttendance = safe(async (fd) => {
  await requirePermission(can.siteOps);
  const projectId = str(fd, "projectId");
  const date = parseDate(fd.get("date"));
  if (date > new Date()) throw new Error("Cannot record attendance for a future date");

  const entries = [...fd.entries()].filter(([k]) => k.startsWith("d_"));
  const workerIds = entries.map(([k]) => k.slice(2));
  const [workers, existing] = await Promise.all([
    db.worker.findMany({ where: { id: { in: workerIds } } }),
    db.labourEntry.findMany({ where: { workerId: { in: workerIds }, date } }),
  ]);

  const ops = [];
  let n = 0;
  for (const [k, v] of entries) {
    const workerId = k.slice(2);
    const days = Number(v);
    if (![0, 0.5, 1].includes(days)) throw new Error("Days must be 0, ½ or 1");
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) continue;
    const prev = existing.find((e) => e.workerId === workerId);
    if (prev?.expenseId) continue; // already paid — locked
    if (prev && prev.projectId !== projectId && days > 0) {
      throw new Error(`${worker.name} is already recorded on another site for this date`);
    }
    if (days === 0) {
      if (prev && prev.projectId === projectId) ops.push(db.labourEntry.delete({ where: { id: prev.id } }));
      continue;
    }
    n++;
    ops.push(
      db.labourEntry.upsert({
        where: { workerId_date: { workerId, date } },
        create: { workerId, projectId, date, days, rate: worker.dailyRate },
        update: { days },
      }),
    );
  }
  await db.$transaction(ops);
  revalidatePath("/labour");
  revalidatePath("/payroll");
  return `Attendance saved (${n} worker(s) present)`;
});

// Pays every unpaid attendance entry on a project up to a cut-off date as one LABOUR expense.
export const runPayroll = safe(async (fd) => {
  const user = await requirePermission(can.payroll);
  const projectId = str(fd, "projectId");
  const upTo = parseDate(fd.get("upTo"));
  const method = oneOf(PAYMENT_METHODS, fd.get("method"));

  return db.$transaction(async (tx) => {
    const entries = await tx.labourEntry.findMany({ where: { projectId, expenseId: null, date: { lte: upTo } } });
    if (!entries.length) throw new Error("Nothing to pay for this site and period");
    const total = entries.reduce((s, e) => s + Math.round(e.days * e.rate), 0);
    const from = entries.reduce((m, e) => (e.date < m ? e.date : m), entries[0].date);
    const workers = new Set(entries.map((e) => e.workerId)).size;
    const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } });
    const expense = await tx.expense.create({
      data: {
        projectId,
        category: "LABOUR",
        description: `Payroll ${project.code}: ${from.toISOString().slice(0, 10)} to ${upTo.toISOString().slice(0, 10)} (${workers} workers)`,
        amount: total,
        date: upTo,
        method,
        reference: String(fd.get("reference") ?? "").trim() || null,
        status: "PAID",
        paidAt: new Date(),
        createdById: user.id,
        approvedById: user.id,
      },
    });
    await tx.labourEntry.updateMany({ where: { id: { in: entries.map((e) => e.id) } }, data: { expenseId: expense.id } });
    revalidatePath("/payroll");
    revalidatePath("/expenses");
    revalidatePath("/");
    return `Paid ${fmt(total)} to ${workers} worker(s)`;
  });
});
