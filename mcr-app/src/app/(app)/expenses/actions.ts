"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";
import { parseDate } from "@/lib/dates";
import { COST_CATEGORIES, PAYMENT_METHODS, oneOf } from "@/lib/labels";

function refresh() {
  revalidatePath("/expenses");
  revalidatePath("/");
}

export const createExpense = safe(async (fd) => {
  const user = await requirePermission(can.submitExpense);
  const amount = toCents(fd.get("amount"));
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  await db.expense.create({
    data: {
      projectId: optStr(fd, "projectId"),
      supplierId: optStr(fd, "supplierId"),
      category: oneOf(COST_CATEGORIES, fd.get("category")),
      description: str(fd, "description"),
      amount,
      date: parseDate(fd.get("date")),
      method: oneOf(PAYMENT_METHODS, fd.get("method")),
      reference: optStr(fd, "reference"),
      createdById: user.id,
    },
  });
  refresh();
  return "Expense submitted for approval";
});

// Approval rules: only Finance/Admin approve; nobody but an Admin approves their own submission.
export const reviewExpense = safe(async (fd) => {
  const user = await requirePermission(can.approveExpense);
  const id = str(fd, "id");
  const decision = str(fd, "decision");
  const e = await db.expense.findUniqueOrThrow({ where: { id } });

  if (decision === "approve" || decision === "reject") {
    if (e.status !== "PENDING") throw new Error("Only pending expenses can be reviewed");
    if (e.createdById === user.id && user.role !== "ADMIN") throw new Error("You cannot approve your own expense");
    await db.expense.update({
      where: { id },
      data: { status: decision === "approve" ? "APPROVED" : "REJECTED", approvedById: user.id },
    });
  } else if (decision === "pay") {
    if (e.status !== "APPROVED") throw new Error("Only approved expenses can be marked paid");
    await db.expense.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
  } else {
    throw new Error("Unknown decision");
  }
  refresh();
  return decision === "pay" ? "Marked paid" : decision === "approve" ? "Approved" : "Rejected";
});

export const deleteExpense = safe(async (fd) => {
  const user = await requirePermission(can.submitExpense);
  const id = str(fd, "id");
  const e = await db.expense.findUniqueOrThrow({ where: { id }, include: { labourEntries: { select: { id: true } } } });
  if (e.status === "PAID" || e.status === "APPROVED") throw new Error("Approved or paid expenses cannot be deleted");
  if (e.createdById !== user.id && user.role !== "ADMIN") throw new Error("Only the submitter or an admin can delete this");
  if (e.labourEntries.length) throw new Error("This expense pays labour; it cannot be deleted");
  await db.$transaction([
    db.stockMovement.updateMany({ where: { expenseId: id }, data: { expenseId: null } }),
    db.expense.delete({ where: { id } }),
  ]);
  refresh();
  return "Deleted";
});
