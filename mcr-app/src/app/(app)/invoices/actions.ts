"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";
import { parseDate } from "@/lib/dates";
import { PAYMENT_METHODS, oneOf } from "@/lib/labels";

function refresh(id?: string) {
  revalidatePath("/invoices");
  revalidatePath("/");
  if (id) revalidatePath(`/invoices/${id}`);
}

async function nextNumber(year: number) {
  const prefix = `INV-${year}-`;
  const last = await db.invoice.findFirst({ where: { number: { startsWith: prefix } }, orderBy: { number: "desc" } });
  const n = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export const createInvoice = safe(async (fd) => {
  await requirePermission(can.manageInvoices);
  const projectId = str(fd, "projectId");
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId } });
  const amount = toCents(fd.get("amount"));
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  const issueDate = parseDate(fd.get("issueDate"));
  const dueDate = parseDate(fd.get("dueDate"));
  if (dueDate < issueDate) throw new Error("Due date is before issue date");

  const billed = await db.invoice.aggregate({ where: { projectId, status: "ISSUED" }, _sum: { amount: true } });
  if ((billed._sum.amount ?? 0) + amount > project.contractValue && fd.get("allowOverbill") !== "on") {
    throw new Error("This would bill more than the contract value. Tick 'variation / over-bill' to proceed.");
  }

  const invoice = await db.invoice.create({
    data: {
      number: await nextNumber(issueDate.getUTCFullYear()),
      projectId,
      description: str(fd, "description"),
      amount,
      retention: Math.round((amount * project.retentionPct) / 100),
      issueDate,
      dueDate,
    },
  });
  refresh();
  redirect(`/invoices/${invoice.id}`);
});

export const recordPayment = safe(async (fd) => {
  await requirePermission(can.manageInvoices);
  const invoiceId = str(fd, "invoiceId");
  const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: true } });
  if (inv.status !== "ISSUED") throw new Error("Payments can only be recorded on issued invoices");
  const amount = toCents(fd.get("amount"));
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  const received = inv.payments.reduce((s, p) => s + p.amount, 0);
  // Retention is normally released at handover, so allow paying up to the full gross amount.
  if (received + amount > inv.amount) throw new Error(`Payment exceeds the invoice balance of ${((inv.amount - received) / 100).toFixed(2)}`);
  await db.payment.create({
    data: {
      invoiceId,
      amount,
      date: parseDate(fd.get("date")),
      method: oneOf(PAYMENT_METHODS, fd.get("method")),
      reference: optStr(fd, "reference"),
    },
  });
  refresh(invoiceId);
  return "Payment recorded";
});

export const cancelInvoice = safe(async (fd) => {
  await requirePermission(can.manageInvoices);
  const id = str(fd, "id");
  const count = await db.payment.count({ where: { invoiceId: id } });
  if (count) throw new Error("Invoice has payments recorded and cannot be cancelled");
  await db.invoice.update({ where: { id }, data: { status: "CANCELLED" } });
  refresh(id);
  return "Invoice cancelled";
});
