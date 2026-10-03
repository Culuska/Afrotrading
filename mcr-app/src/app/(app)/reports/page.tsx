import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { companyCash, monthlyCashflow, projectFinancials } from "@/lib/finance";
import { fmt, pct } from "@/lib/money";
import { PROJECT_STATUSES } from "@/lib/labels";
import { Card, Grid, PageHeader, Stat, Table } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireUser();
  const [projects, cash, flow, overhead, invoices] = await Promise.all([
    db.project.findMany({ where: { status: { not: "TENDER" } }, include: { client: true }, orderBy: { code: "asc" } }),
    companyCash(),
    monthlyCashflow(12),
    db.expense.aggregate({ where: { projectId: null, status: { in: ["APPROVED", "PAID"] } }, _sum: { amount: true } }),
    db.invoice.findMany({ where: { status: "ISSUED" }, include: { payments: true, project: { include: { client: true } } } }),
  ]);
  const fin = await projectFinancials(projects.map((p) => p.id));
  const rows = projects.map((p) => ({ p, f: fin.get(p.id)! }));
  const tot = rows.reduce(
    (a, { f }) => ({ invoiced: a.invoiced + f.invoiced, cost: a.cost + f.actualCost, labour: a.labour + f.unpaidLabour }),
    { invoiced: 0, cost: 0, labour: 0 },
  );
  const overheadCost = overhead._sum.amount ?? 0;
  const net = tot.invoiced - tot.cost - overheadCost;

  // Receivables ageing by days past due date (net of retention).
  const now = Date.now();
  const buckets = [
    { label: "Not yet due", min: -Infinity, max: 0, amt: 0 },
    { label: "1–30 days", min: 0, max: 30, amt: 0 },
    { label: "31–60 days", min: 30, max: 60, amt: 0 },
    { label: "61–90 days", min: 60, max: 90, amt: 0 },
    { label: "90+ days", min: 90, max: Infinity, amt: 0 },
  ];
  const byClient = new Map<string, number>();
  for (const i of invoices) {
    const due = i.amount - i.retention - i.payments.reduce((s, p) => s + p.amount, 0);
    if (due <= 0) continue;
    const late = (now - i.dueDate.getTime()) / 864e5;
    buckets.find((b) => late > b.min && late <= b.max)!.amt += due;
    byClient.set(i.project.client.name, (byClient.get(i.project.client.name) ?? 0) + due);
  }
  const maxFlow = Math.max(1, ...flow.map((m) => Math.max(m.inflow, m.outflow)));

  return (
    <>
      <PageHeader title="Reports" sub="Accrual figures use approved + paid costs; cash figures use only money actually received/paid.">
        <PrintButton />
      </PageHeader>
      <Grid cols={4}>
        <Stat label="Revenue invoiced" value={fmt(tot.invoiced)} />
        <Stat label="Project costs" value={fmt(tot.cost)} hint={`+ ${fmt(tot.labour)} unpaid wages not yet booked`} />
        <Stat label="Company overhead" value={fmt(overheadCost)} />
        <Stat label="Net profit (accrual)" value={fmt(net)} hint={`${pct(net, tot.invoiced)}% margin`} tone={net < 0 ? "bad" : "ok"} />
      </Grid>

      <Card title="Profit & loss by project" className="mt-4">
        <Table head={["Project", "Status", "Contract", "Invoiced", "Cost", "Gross profit", "Margin", ""]} empty={!rows.length}>
          {rows.map(({ p, f }) => {
            const gp = f.invoiced - f.actualCost;
            return (
              <tr key={p.id}>
                <td><span className="font-medium">{p.code}</span><div className="text-xs text-muted">{p.client.name}</div></td>
                <td>{PROJECT_STATUSES[p.status]}</td>
                <td className="num">{fmt(p.contractValue)}</td>
                <td className="num">{fmt(f.invoiced)}</td>
                <td className="num">{fmt(f.actualCost)}</td>
                <td className={`num ${gp < 0 ? "text-bad" : ""}`}>{fmt(gp)}</td>
                <td className="num">{pct(gp, f.invoiced)}%</td>
                <td className="no-print"><Link className="text-xs text-brand" href={`/reports/project/${p.id}`}>Detail →</Link></td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={`Cash flow — last 12 months (net ${fmt(cash.net)} all-time)`}>
          <div className="space-y-2">
            {flow.map((m) => (
              <div key={m.key} className="grid grid-cols-[3.5rem_1fr_6rem] items-center gap-2 text-xs">
                <span className="text-muted">{m.label}</span>
                <div className="space-y-0.5">
                  <div className="h-2 rounded bg-ok" style={{ width: `${(m.inflow / maxFlow) * 100}%` }} title={`In ${fmt(m.inflow)}`} />
                  <div className="h-2 rounded bg-bad" style={{ width: `${(m.outflow / maxFlow) * 100}%` }} title={`Out ${fmt(m.outflow)}`} />
                </div>
                <span className={`num text-right ${m.inflow - m.outflow < 0 ? "text-bad" : ""}`}>{fmt(m.inflow - m.outflow)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted"><span className="text-ok">■</span> received from clients · <span className="text-bad">■</span> paid out</p>
        </Card>
        <Card title="Receivables ageing">
          <Table head={["Days overdue", "Amount"]}>
            {buckets.map((b) => (
              <tr key={b.label}><td>{b.label}</td><td className={`num ${b.min >= 60 && b.amt ? "text-bad" : ""}`}>{fmt(b.amt)}</td></tr>
            ))}
          </Table>
          <h3 className="mt-4 mb-1 text-xs font-semibold uppercase text-muted">By client</h3>
          <Table head={["Client", "Owed"]} empty={!byClient.size}>
            {[...byClient.entries()].sort((a, b) => b[1] - a[1]).map(([c, a]) => <tr key={c}><td>{c}</td><td className="num">{fmt(a)}</td></tr>)}
          </Table>
        </Card>
      </div>
    </>
  );
}
