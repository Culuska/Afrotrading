import Link from "next/link";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { fmtDate, today } from "@/lib/dates";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, Grid, PageHeader, Stat, Table } from "@/components/ui";
import { createInvoice } from "./actions";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await requireUser();
  const { project } = await searchParams;
  const [invoices, projects] = await Promise.all([
    db.invoice.findMany({
      where: project ? { projectId: project } : {},
      include: { project: { include: { client: true } }, payments: true },
      orderBy: { issueDate: "desc" },
    }),
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD", "COMPLETED"] } }, orderBy: { code: "asc" } }),
  ]);
  const now = new Date();
  let billed = 0, received = 0, retention = 0, overdue = 0;
  const rows = invoices.map((i) => {
    const paid = i.payments.reduce((s, p) => s + p.amount, 0);
    const due = i.amount - i.retention - paid;
    const isOverdue = i.status === "ISSUED" && due > 0 && i.dueDate < now;
    if (i.status === "ISSUED") {
      billed += i.amount; received += paid; retention += i.retention;
      if (isOverdue) overdue += due;
    }
    return { ...i, paid, due, isOverdue };
  });
  const in30 = new Date(Date.now() + 30 * 864e5);

  return (
    <>
      <PageHeader title="Invoices & receipts" sub="Bill clients by milestone and track what has been collected." />
      <Grid cols={4}>
        <Stat label="Billed" value={fmt(billed)} />
        <Stat label="Received" value={fmt(received)} />
        <Stat label="Overdue" value={fmt(overdue)} tone={overdue ? "bad" : undefined} />
        <Stat label="Retention held by clients" value={fmt(retention)} hint="Released at handover / defects period" />
      </Grid>

      {can.manageInvoices(user.role) && (
        <Card title="New invoice" className="mt-4">
          <ActionForm action={createInvoice} submit="Create invoice">
            <Grid cols={4}>
              <Field label="Project" className="sm:col-span-2">
                <select name="projectId" required defaultValue={project}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
              </Field>
              <Field label="Gross amount (USD)"><input name="amount" type="number" step="0.01" min="0.01" required /></Field>
              <Field label="Issue date"><input name="issueDate" type="date" required defaultValue={today()} /></Field>
              <Field label="Milestone / description" className="sm:col-span-2"><input name="description" required placeholder="Interim payment certificate #2 — slab complete" /></Field>
              <Field label="Due date"><input name="dueDate" type="date" required defaultValue={in30.toISOString().slice(0, 10)} /></Field>
              <div className="flex items-end pb-2 text-sm"><label className="flex items-center gap-2 text-ink"><input type="checkbox" name="allowOverbill" className="w-auto" /> Variation / over-bill</label></div>
            </Grid>
            <p className="text-xs text-muted">Retention is deducted automatically using the project&apos;s retention %.</p>
          </ActionForm>
        </Card>
      )}

      <Card className="mt-4">
        <Table head={["Invoice", "Project / client", "Issued", "Due", "Gross", "Retention", "Received", "Balance", ""]} empty={!rows.length}>
          {rows.map((i) => (
            <tr key={i.id}>
              <td><Link className="font-medium text-brand hover:underline" href={`/invoices/${i.id}`}>{i.number}</Link><div className="text-xs text-muted">{i.description}</div></td>
              <td>{i.project.code}<div className="text-xs text-muted">{i.project.client.name}</div></td>
              <td className="whitespace-nowrap">{fmtDate(i.issueDate)}</td>
              <td className="whitespace-nowrap">{fmtDate(i.dueDate)}</td>
              <td className="num">{fmt(i.amount)}</td>
              <td className="num">{fmt(i.retention)}</td>
              <td className="num">{fmt(i.paid)}</td>
              <td className={`num ${i.isOverdue ? "text-bad" : ""}`}>{fmt(Math.max(i.due, 0))}</td>
              <td>
                {i.status === "CANCELLED" ? <Badge tone="bad">Cancelled</Badge>
                  : i.due <= 0 ? <Badge tone="ok">Paid</Badge>
                  : i.isOverdue ? <Badge tone="bad">Overdue</Badge>
                  : i.paid > 0 ? <Badge tone="info">Part paid</Badge>
                  : <Badge tone="warn">Unpaid</Badge>}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
