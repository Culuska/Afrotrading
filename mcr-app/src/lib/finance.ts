import "server-only";
import type { CostCategory } from "@prisma/client";
import { db } from "./db";
import { COST_CATEGORIES } from "./labels";

// Accounting rules used everywhere in the app:
// - "Actual cost" = expenses that are APPROVED or PAID. PENDING are shown separately, REJECTED ignored.
// - "Invoiced"    = gross amount of ISSUED invoices. Retention is withheld by the client until handover.
// - "Receivable"  = invoiced - retention - received.
// - "Unpaid labour" = attendance logged but not yet paid out (a liability not yet in expenses).

export type ProjectFinancials = {
  projectId: string;
  contractValue: number;
  budget: number;
  actualCost: number;
  pendingCost: number;
  paidCost: number;
  invoiced: number;
  retention: number;
  received: number;
  receivable: number;
  unpaidLabour: number;
  byCategory: { category: CostCategory; label: string; budget: number; actual: number }[];
};

export async function projectFinancials(projectIds?: string[]): Promise<Map<string, ProjectFinancials>> {
  const projectWhere = projectIds ? { id: { in: projectIds } } : {};
  const idFilter = projectIds ? { projectId: { in: projectIds } } : { projectId: { not: null } };

  const [projects, budgets, costs, invoices, payments, labour] = await Promise.all([
    db.project.findMany({ where: projectWhere, select: { id: true, contractValue: true } }),
    db.budgetLine.findMany({ where: projectIds ? { projectId: { in: projectIds } } : {} }),
    db.expense.groupBy({
      by: ["projectId", "category", "status"],
      where: { ...idFilter, status: { in: ["PENDING", "APPROVED", "PAID"] } },
      _sum: { amount: true },
    }),
    db.invoice.groupBy({
      by: ["projectId"],
      where: { status: "ISSUED", ...(projectIds ? { projectId: { in: projectIds } } : {}) },
      _sum: { amount: true, retention: true },
    }),
    db.payment.findMany({
      where: { invoice: { status: "ISSUED", ...(projectIds ? { projectId: { in: projectIds } } : {}) } },
      select: { amount: true, invoice: { select: { projectId: true } } },
    }),
    db.labourEntry.findMany({
      where: { expenseId: null, ...(projectIds ? { projectId: { in: projectIds } } : {}) },
      select: { projectId: true, days: true, rate: true },
    }),
  ]);

  const out = new Map<string, ProjectFinancials>();
  for (const p of projects) {
    out.set(p.id, {
      projectId: p.id,
      contractValue: p.contractValue,
      budget: 0,
      actualCost: 0,
      pendingCost: 0,
      paidCost: 0,
      invoiced: 0,
      retention: 0,
      received: 0,
      receivable: 0,
      unpaidLabour: 0,
      byCategory: (Object.keys(COST_CATEGORIES) as CostCategory[]).map((c) => ({
        category: c,
        label: COST_CATEGORIES[c],
        budget: 0,
        actual: 0,
      })),
    });
  }

  for (const b of budgets) {
    const f = out.get(b.projectId);
    if (!f) continue;
    f.budget += b.amount;
    f.byCategory.find((c) => c.category === b.category)!.budget += b.amount;
  }
  for (const c of costs) {
    const f = c.projectId ? out.get(c.projectId) : undefined;
    if (!f) continue;
    const amt = c._sum.amount ?? 0;
    if (c.status === "PENDING") {
      f.pendingCost += amt;
      continue;
    }
    f.actualCost += amt;
    if (c.status === "PAID") f.paidCost += amt;
    f.byCategory.find((x) => x.category === c.category)!.actual += amt;
  }
  for (const i of invoices) {
    const f = out.get(i.projectId);
    if (!f) continue;
    f.invoiced += i._sum.amount ?? 0;
    f.retention += i._sum.retention ?? 0;
  }
  for (const p of payments) {
    const f = out.get(p.invoice.projectId);
    if (f) f.received += p.amount;
  }
  for (const l of labour) {
    const f = out.get(l.projectId);
    if (f) f.unpaidLabour += Math.round(l.days * l.rate);
  }
  for (const f of out.values()) f.receivable = f.invoiced - f.retention - f.received;

  return out;
}

export async function companyCash() {
  const [received, paid] = await Promise.all([
    db.payment.aggregate({ where: { invoice: { status: "ISSUED" } }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);
  const inflow = received._sum.amount ?? 0;
  const outflow = paid._sum.amount ?? 0;
  return { inflow, outflow, net: inflow - outflow };
}

// Monthly cash in (client payments) vs cash out (paid expenses) for the last `months` months.
export async function monthlyCashflow(months = 6) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
  const [payments, expenses] = await Promise.all([
    db.payment.findMany({
      where: { date: { gte: start }, invoice: { status: "ISSUED" } },
      select: { amount: true, date: true },
    }),
    db.expense.findMany({
      where: { status: "PAID", date: { gte: start } },
      select: { amount: true, date: true },
    }),
  ]);
  const rows: { key: string; label: string; inflow: number; outflow: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    rows.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }),
      inflow: 0,
      outflow: 0,
    });
  }
  const find = (d: Date) => rows.find((r) => r.key === d.toISOString().slice(0, 7));
  for (const p of payments) {
    const r = find(p.date);
    if (r) r.inflow += p.amount;
  }
  for (const e of expenses) {
    const r = find(e.date);
    if (r) r.outflow += e.amount;
  }
  return rows;
}
