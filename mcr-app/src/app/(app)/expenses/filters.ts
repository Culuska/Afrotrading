import type { CostCategory, ExpenseStatus, Prisma } from "@prisma/client";
import { COST_CATEGORIES, EXPENSE_STATUSES } from "@/lib/labels";

export type ExpenseFilters = { project?: string; status?: string; category?: string; month?: string };

export function expenseWhere(f: ExpenseFilters): Prisma.ExpenseWhereInput {
  const where: Prisma.ExpenseWhereInput = {};
  if (f.project === "overhead") where.projectId = null;
  else if (f.project) where.projectId = f.project;
  if (f.status && f.status in EXPENSE_STATUSES) where.status = f.status as ExpenseStatus;
  if (f.category && f.category in COST_CATEGORIES) where.category = f.category as CostCategory;
  if (f.month && /^\d{4}-\d{2}$/.test(f.month)) {
    const [y, m] = f.month.split("-").map(Number);
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }
  return where;
}
