import Link from "next/link";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { fmtDate, today } from "@/lib/dates";
import { COST_CATEGORIES, EXPENSE_STATUSES, PAYMENT_METHODS } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, Grid, Options, PageHeader, Stat, Table, statusTone } from "@/components/ui";
import { createExpense, deleteExpense, reviewExpense } from "./actions";
import { expenseWhere, type ExpenseFilters } from "./filters";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<ExpenseFilters> }) {
  const user = await requireUser();
  const filters = await searchParams;
  const where = expenseWhere(filters);
  const [expenses, totals, projects, suppliers] = await Promise.all([
    db.expense.findMany({
      where,
      include: { project: true, supplier: true, createdBy: true, approvedBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 300,
    }),
    db.expense.groupBy({ by: ["status"], where, _sum: { amount: true }, _count: true }),
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD", "TENDER"] } }, orderBy: { code: "asc" } }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);
  const sum = (s: string) => totals.find((t) => t.status === s)?._sum.amount ?? 0;
  const count = (s: string) => totals.find((t) => t.status === s)?._count ?? 0;
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHeader title="Expenses" sub="Every cost goes through submit → approve → pay.">
        <a href={`/api/export/expenses?${qs}`} className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium">Export CSV</a>
      </PageHeader>

      <Grid cols={4}>
        <Stat label="Pending approval" value={fmt(sum("PENDING"))} hint={`${count("PENDING")} item(s)`} tone={count("PENDING") ? "warn" : undefined} />
        <Stat label="Approved, unpaid" value={fmt(sum("APPROVED"))} hint={`${count("APPROVED")} item(s) — money owed`} />
        <Stat label="Paid" value={fmt(sum("PAID"))} hint={`${count("PAID")} item(s)`} />
        <Stat label="Rejected" value={fmt(sum("REJECTED"))} hint={`${count("REJECTED")} item(s)`} />
      </Grid>

      {can.submitExpense(user.role) && (
        <Card title="Record expense" className="mt-4">
          <ActionForm action={createExpense} submit="Submit expense">
            <Grid cols={4}>
              <Field label="Date"><input name="date" type="date" required defaultValue={today()} /></Field>
              <Field label="Project">
                <select name="projectId">
                  <option value="">Company overhead (no project)</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
              </Field>
              <Field label="Category"><select name="category" required><Options map={COST_CATEGORIES} /></select></Field>
              <Field label="Amount (USD)"><input name="amount" type="number" step="0.01" min="0.01" required /></Field>
              <Field label="Description" className="sm:col-span-2"><input name="description" required placeholder="e.g. 200 bags cement, Bakaara market" /></Field>
              <Field label="Supplier">
                <select name="supplierId">
                  <option value="">—</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Payment method"><select name="method"><Options map={PAYMENT_METHODS} /></select></Field>
              <Field label="Reference / receipt no." className="sm:col-span-2"><input name="reference" placeholder="EVC transaction ID, receipt no., cheque no." /></Field>
            </Grid>
          </ActionForm>
        </Card>
      )}

      <Card className="mt-4">
        <form className="no-print mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <select name="project" defaultValue={filters.project ?? ""}>
            <option value="">All projects</option>
            <option value="overhead">Overhead only</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
          <select name="status" defaultValue={filters.status ?? ""}><Options map={EXPENSE_STATUSES} empty="All statuses" /></select>
          <select name="category" defaultValue={filters.category ?? ""}><Options map={COST_CATEGORIES} empty="All categories" /></select>
          <input name="month" type="month" defaultValue={filters.month ?? ""} />
          <div className="flex gap-2">
            <button className="rounded-md bg-ink px-3 py-2 text-sm text-white">Filter</button>
            <Link href="/expenses" className="px-2 py-2 text-sm text-muted">Clear</Link>
          </div>
        </form>
        <Table head={["Date", "Description", "Project", "Amount", "Method", "Status", ""]} empty={!expenses.length}>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap">{fmtDate(e.date)}</td>
              <td>
                {e.description}
                <div className="text-xs text-muted">
                  {COST_CATEGORIES[e.category]}{e.supplier && ` · ${e.supplier.name}`} · by {e.createdBy.name}
                  {e.approvedBy && ` · reviewed by ${e.approvedBy.name}`}
                </div>
              </td>
              <td className="whitespace-nowrap">{e.project ? <Link className="text-brand hover:underline" href={`/projects/${e.project.id}`}>{e.project.code}</Link> : <span className="text-muted">Overhead</span>}</td>
              <td className="num whitespace-nowrap">{fmt(e.amount)}</td>
              <td className="whitespace-nowrap">{PAYMENT_METHODS[e.method]}{e.reference && <div className="text-xs text-muted">{e.reference}</div>}</td>
              <td><Badge tone={statusTone(e.status)}>{EXPENSE_STATUSES[e.status]}</Badge></td>
              <td className="whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {e.status === "PENDING" && can.approveExpense(user.role) && (e.createdById !== user.id || user.role === "ADMIN") && (
                    <>
                      <ActionForm action={reviewExpense} submit="Approve" inline reset={false}>
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="decision" value="approve" />
                      </ActionForm>
                      <ActionForm action={reviewExpense} submit="Reject" inline variant="secondary" reset={false} confirm="Reject this expense?">
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="decision" value="reject" />
                      </ActionForm>
                    </>
                  )}
                  {e.status === "APPROVED" && can.approveExpense(user.role) && (
                    <ActionForm action={reviewExpense} submit="Mark paid" inline reset={false} confirm={`Confirm ${fmt(e.amount)} has been paid?`}>
                      <input type="hidden" name="id" value={e.id} /><input type="hidden" name="decision" value="pay" />
                    </ActionForm>
                  )}
                  {(e.status === "PENDING" || e.status === "REJECTED") && (e.createdById === user.id || user.role === "ADMIN") && (
                    <ActionForm action={deleteExpense} submit="Delete" inline variant="secondary" reset={false} confirm="Delete this expense?">
                      <input type="hidden" name="id" value={e.id} />
                    </ActionForm>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
        {expenses.length === 300 && <p className="mt-2 text-xs text-muted">Showing the latest 300. Use filters or export CSV for the full list.</p>}
      </Card>
    </>
  );
}
