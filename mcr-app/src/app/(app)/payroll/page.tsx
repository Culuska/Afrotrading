import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { fmtDate, today } from "@/lib/dates";
import { PAYMENT_METHODS } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Options, PageHeader, Stat, Table } from "@/components/ui";
import { runPayroll } from "../labour/actions";

export const metadata = { title: "Payroll" };

export default async function PayrollPage() {
  const user = await requireUser();
  const [unpaid, recent] = await Promise.all([
    db.labourEntry.findMany({ where: { expenseId: null }, include: { worker: true, project: true }, orderBy: { date: "asc" } }),
    db.expense.findMany({ where: { category: "LABOUR", labourEntries: { some: {} } }, orderBy: { createdAt: "desc" }, take: 10, include: { project: true } }),
  ]);

  type Row = { name: string; phone: string | null; days: number; amount: number };
  const byProject = new Map<string, { code: string; name: string; from: Date; to: Date; total: number; workers: Map<string, Row> }>();
  for (const e of unpaid) {
    const g = byProject.get(e.projectId) ?? { code: e.project.code, name: e.project.name, from: e.date, to: e.date, total: 0, workers: new Map() };
    const amt = Math.round(e.days * e.rate);
    g.total += amt;
    if (e.date > g.to) g.to = e.date;
    const w = g.workers.get(e.workerId) ?? { name: e.worker.name, phone: e.worker.phone, days: 0, amount: 0 };
    w.days += e.days;
    w.amount += amt;
    g.workers.set(e.workerId, w);
    byProject.set(e.projectId, g);
  }
  const owed = [...byProject.values()].reduce((s, g) => s + g.total, 0);

  return (
    <>
      <PageHeader title="Payroll" sub="Unpaid attendance by site. Paying creates a LABOUR expense on that project." />
      <div className="mb-4 max-w-xs"><Stat label="Total wages owed" value={fmt(owed)} tone={owed ? "warn" : undefined} /></div>
      {byProject.size === 0 && <Card><p className="text-sm text-muted">No unpaid attendance.</p></Card>}
      <div className="space-y-4">
        {[...byProject.entries()].map(([projectId, g]) => (
          <Card key={projectId} title={`${g.code} — ${g.name} · ${fmtDate(g.from)} → ${fmtDate(g.to)} · ${fmt(g.total)}`}>
            <Table head={["Worker", "Phone", "Days", "Amount"]}>
              {[...g.workers.values()].map((w) => (
                <tr key={w.name}>
                  <td>{w.name}</td>
                  <td>{w.phone ?? "—"}</td>
                  <td className="num">{w.days}</td>
                  <td className="num">{fmt(w.amount)}</td>
                </tr>
              ))}
            </Table>
            {can.payroll(user.role) && (
              <div className="mt-4 border-t border-line pt-4">
                <ActionForm action={runPayroll} submit="Pay wages" inline confirm="Mark these wages as paid? This creates a paid labour expense.">
                  <input type="hidden" name="projectId" value={projectId} />
                  <Field label="Up to"><input type="date" name="upTo" defaultValue={today()} required /></Field>
                  <Field label="Method"><select name="method" defaultValue="EVC_PLUS"><Options map={PAYMENT_METHODS} /></select></Field>
                  <Field label="Reference"><input name="reference" /></Field>
                </ActionForm>
              </div>
            )}
          </Card>
        ))}
      </div>
      {recent.length > 0 && (
        <Card title="Recent payroll runs" className="mt-4">
          <Table head={["Date", "Site", "Description", "Amount"]}>
            {recent.map((e) => (
              <tr key={e.id}><td>{fmtDate(e.date)}</td><td>{e.project?.code}</td><td>{e.description}</td><td className="num">{fmt(e.amount)}</td></tr>
            ))}
          </Table>
        </Card>
      )}
    </>
  );
}
