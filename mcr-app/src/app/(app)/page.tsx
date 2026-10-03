import Link from "next/link";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { companyCash, monthlyCashflow, projectFinancials } from "@/lib/finance";
import { fmt, fmtShort, pct } from "@/lib/money";
import { fmtDate, monthStart } from "@/lib/dates";
import { Bar, Card, Grid, PageHeader, Stat, Table } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser();
  const active = await db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, include: { client: true }, orderBy: { code: "asc" } });
  const [fin, cash, flow, pending, thisMonth, overdueInv, unpaidLabour, issues] = await Promise.all([
    projectFinancials(active.map((p) => p.id)),
    companyCash(),
    monthlyCashflow(6),
    db.expense.findMany({ where: { status: "PENDING" }, include: { project: true, createdBy: true }, orderBy: { date: "asc" }, take: 8 }),
    db.expense.aggregate({ where: { status: { in: ["APPROVED", "PAID"] }, date: { gte: monthStart() } }, _sum: { amount: true } }),
    db.invoice.findMany({ where: { status: "ISSUED", dueDate: { lt: new Date() } }, include: { payments: true, project: { include: { client: true } } } }),
    db.labourEntry.findMany({ where: { expenseId: null }, select: { days: true, rate: true } }),
    db.dailyReport.findMany({ where: { issues: { not: null }, date: { gte: new Date(Date.now() - 7 * 864e5) } }, include: { project: true }, orderBy: { date: "desc" }, take: 5 }),
  ]);
  const payables = await db.expense.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true } });

  const all = [...fin.values()];
  const receivable = all.reduce((s, f) => s + f.receivable, 0);
  const wagesOwed = unpaidLabour.reduce((s, e) => s + Math.round(e.days * e.rate), 0);
  const owed = (payables._sum.amount ?? 0) + wagesOwed;
  const overdue = overdueInv
    .map((i) => ({ ...i, due: i.amount - i.retention - i.payments.reduce((s, p) => s + p.amount, 0) }))
    .filter((i) => i.due > 0);
  const atRisk = active.filter((p) => {
    const f = fin.get(p.id)!;
    return f.budget > 0 && pct(f.actualCost, f.budget) > p.progressPct + 10;
  });
  const maxFlow = Math.max(1, ...flow.map((m) => Math.max(m.inflow, m.outflow)));

  return (
    <>
      <PageHeader title={`Salaan, ${user.name.split(" ")[0]}`} sub={`${active.length} active project(s) · ${fmtDate(new Date())}`} />

      <Grid cols={4}>
        <Stat label="Net cash (received − paid)" value={fmt(cash.net)} hint="Since records began; add opening balance manually" tone={cash.net < 0 ? "bad" : undefined} />
        <Stat label="Clients owe us" value={fmt(receivable)} hint={`${fmt(overdue.reduce((s, i) => s + i.due, 0))} overdue`} tone={overdue.length ? "warn" : undefined} />
        <Stat label="We owe" value={fmt(owed)} hint={`Suppliers ${fmt(payables._sum.amount ?? 0)} · wages ${fmt(wagesOwed)}`} tone={owed ? "warn" : undefined} />
        <Stat label="Costs this month" value={fmt(thisMonth._sum.amount ?? 0)} hint="Approved + paid" />
      </Grid>

      {atRisk.length > 0 && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-bad">
          <strong>Cost overrun risk:</strong>{" "}
          {atRisk.map((p, i) => (
            <span key={p.id}>{i > 0 && ", "}<Link className="underline" href={`/projects/${p.id}`}>{p.code}</Link> ({pct(fin.get(p.id)!.actualCost, fin.get(p.id)!.budget)}% spent, {p.progressPct}% done)</span>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Active projects" className="lg:col-span-2" actions={<Link href="/projects" className="text-xs text-brand">All →</Link>}>
          <Table head={["Project", "Progress", "Budget used", "Receivable"]} empty={!active.length}>
            {active.map((p) => {
              const f = fin.get(p.id)!;
              return (
                <tr key={p.id}>
                  <td><Link className="font-medium text-brand hover:underline" href={`/projects/${p.id}`}>{p.code}</Link><div className="text-xs text-muted">{p.name} · {p.client.name}</div></td>
                  <td className="w-28"><Bar value={p.progressPct} max={100} /><div className="num mt-1 text-xs text-muted">{p.progressPct}%</div></td>
                  <td className="w-36"><Bar value={f.actualCost} max={f.budget} /><div className="num mt-1 text-xs text-muted">{fmtShort(f.actualCost)} / {fmtShort(f.budget)}</div></td>
                  <td className="num">{fmt(f.receivable)}</td>
                </tr>
              );
            })}
          </Table>
        </Card>

        <Card title="Cash flow, 6 months">
          <div className="flex h-40 items-end gap-2">
            {flow.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end justify-center gap-0.5">
                  <div className="w-1/2 rounded-t bg-ok" style={{ height: `${(m.inflow / maxFlow) * 100}%` }} title={`In ${fmt(m.inflow)}`} />
                  <div className="w-1/2 rounded-t bg-bad" style={{ height: `${(m.outflow / maxFlow) * 100}%` }} title={`Out ${fmt(m.outflow)}`} />
                </div>
                <span className="text-[10px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted"><span className="text-ok">■</span> in · <span className="text-bad">■</span> out</p>
        </Card>

        <Card title={`Awaiting approval (${pending.length})`} actions={<Link href="/expenses?status=PENDING" className="text-xs text-brand">Review →</Link>}>
          {pending.length === 0 ? <p className="text-sm text-muted">Nothing pending.</p> : (
            <ul className="space-y-2 text-sm">
              {pending.map((e) => (
                <li key={e.id} className="flex justify-between gap-2">
                  <span>{e.description}<span className="block text-xs text-muted">{e.project?.code ?? "Overhead"} · {e.createdBy.name}</span></span>
                  <span className="num whitespace-nowrap">{fmt(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          {can.approveExpense(user.role) && pending.length > 0 && <p className="mt-2 text-xs text-muted">You can approve these.</p>}
        </Card>

        <Card title={`Overdue invoices (${overdue.length})`} actions={<Link href="/invoices" className="text-xs text-brand">All →</Link>}>
          {overdue.length === 0 ? <p className="text-sm text-muted">No overdue invoices.</p> : (
            <ul className="space-y-2 text-sm">
              {overdue.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span><Link className="text-brand hover:underline" href={`/invoices/${i.id}`}>{i.number}</Link><span className="block text-xs text-muted">{i.project.client.name} · due {fmtDate(i.dueDate)}</span></span>
                  <span className="num whitespace-nowrap text-bad">{fmt(i.due)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Site issues, last 7 days" actions={<Link href="/site-reports" className="text-xs text-brand">Diary →</Link>}>
          {issues.length === 0 ? <p className="text-sm text-muted">No issues reported.</p> : (
            <ul className="space-y-2 text-sm">
              {issues.map((r) => (
                <li key={r.id}><span className="text-xs text-muted">{fmtDate(r.date)} · {r.project.code}</span><div>{r.issues}</div></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
