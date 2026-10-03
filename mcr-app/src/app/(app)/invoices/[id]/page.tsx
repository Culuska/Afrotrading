import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { fmtDate, today } from "@/lib/dates";
import { PAYMENT_METHODS } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, Grid, Options, Table } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";
import { cancelInvoice, recordPayment } from "../actions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const inv = await db.invoice.findUnique({
    where: { id: (await params).id },
    include: { project: { include: { client: true } }, payments: { orderBy: { date: "asc" } } },
  });
  if (!inv) notFound();
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  const net = inv.amount - inv.retention;
  const manage = can.manageInvoices(user.role) && inv.status === "ISSUED";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <PrintButton />
        {manage && paid === 0 && (
          <ActionForm action={cancelInvoice} submit="Cancel invoice" variant="secondary" inline reset={false} confirm="Cancel this invoice? This cannot be undone.">
            <input type="hidden" name="id" value={inv.id} />
          </ActionForm>
        )}
      </div>

      <section className="rounded-lg border border-line bg-white p-8">
        <div className="flex justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-brand">MCR</div>
            <div className="text-lg font-semibold">Mogadishu Constructions &amp; Rehabilitation</div>
            <div className="text-sm text-muted">Mogadishu, Somalia</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">INVOICE</div>
            <div className="num text-sm">{inv.number}</div>
            {inv.status === "CANCELLED" && <Badge tone="bad">Cancelled</Badge>}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase text-muted">Bill to</div>
            <div className="font-medium">{inv.project.client.name}</div>
            {inv.project.client.contact && <div>{inv.project.client.contact}</div>}
            {inv.project.client.phone && <div>{inv.project.client.phone}</div>}
            {inv.project.client.email && <div>{inv.project.client.email}</div>}
          </div>
          <div className="text-right">
            <div>Issued: {fmtDate(inv.issueDate)}</div>
            <div>Due: {fmtDate(inv.dueDate)}</div>
            <div className="mt-2">Project: {inv.project.code}</div>
            <div className="text-muted">{inv.project.name}</div>
          </div>
        </div>
        <table className="num mt-8 w-full text-sm">
          <tbody className="[&_td]:py-2">
            <tr className="border-b border-line"><td>{inv.description}</td><td className="text-right">{fmt(inv.amount)}</td></tr>
            <tr><td className="text-muted">Less retention ({inv.project.retentionPct}%)</td><td className="text-right">−{fmt(inv.retention)}</td></tr>
            <tr className="border-t border-line font-semibold"><td>Amount payable</td><td className="text-right">{fmt(net)}</td></tr>
            {paid > 0 && <tr><td className="text-muted">Received to date</td><td className="text-right">−{fmt(paid)}</td></tr>}
            {paid > 0 && <tr className="font-semibold"><td>Balance due</td><td className="text-right">{fmt(Math.max(net - paid, 0))}</td></tr>}
          </tbody>
        </table>
      </section>

      <Card title="Payments received" className="no-print">
        <Table head={["Date", "Method", "Reference", "Amount"]} empty={!inv.payments.length}>
          {inv.payments.map((p) => (
            <tr key={p.id}>
              <td>{fmtDate(p.date)}</td>
              <td>{PAYMENT_METHODS[p.method]}</td>
              <td>{p.reference ?? "—"}</td>
              <td className="num">{fmt(p.amount)}</td>
            </tr>
          ))}
        </Table>
        {manage && paid < inv.amount && (
          <div className="mt-4 border-t border-line pt-4">
            <ActionForm action={recordPayment} submit="Record payment">
              <input type="hidden" name="invoiceId" value={inv.id} />
              <Grid cols={4}>
                <Field label="Date"><input name="date" type="date" required defaultValue={today()} /></Field>
                <Field label="Amount (USD)"><input name="amount" type="number" step="0.01" min="0.01" required defaultValue={((Math.max(net - paid, 0) || inv.amount - paid) / 100).toFixed(2)} /></Field>
                <Field label="Method"><select name="method" defaultValue="BANK"><Options map={PAYMENT_METHODS} /></select></Field>
                <Field label="Reference"><input name="reference" /></Field>
              </Grid>
            </ActionForm>
          </div>
        )}
      </Card>
    </div>
  );
}
