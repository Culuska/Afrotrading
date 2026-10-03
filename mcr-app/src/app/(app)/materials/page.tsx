import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { fmtDate, today } from "@/lib/dates";
import { PAYMENT_METHODS } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, Grid, Options, PageHeader, Table } from "@/components/ui";
import { createMaterial, recordMovement } from "./actions";

export const metadata = { title: "Materials" };

export default async function MaterialsPage() {
  const user = await requireUser();
  const [materials, projects, suppliers, grouped, recent] = await Promise.all([
    db.material.findMany({ orderBy: { name: "asc" } }),
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, orderBy: { code: "asc" } }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.stockMovement.groupBy({ by: ["materialId", "projectId", "type"], _sum: { quantity: true } }),
    db.stockMovement.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 25, include: { material: true, project: true } }),
  ]);
  const codes = new Map(projects.map((p) => [p.id, p.code]));
  const stock = materials.map((m) => {
    const sites = new Map<string, number>();
    for (const g of grouped.filter((g) => g.materialId === m.id)) {
      sites.set(g.projectId, (sites.get(g.projectId) ?? 0) + (g.type === "IN" ? 1 : -1) * (g._sum.quantity ?? 0));
    }
    const total = [...sites.values()].reduce((a, b) => a + b, 0);
    return { ...m, total, sites: [...sites.entries()].filter(([, q]) => q !== 0) };
  });
  const ops = can.siteOps(user.role);

  return (
    <>
      <PageHeader title="Materials & stock" sub="Deliveries in, usage out, per site." />
      {ops && materials.length > 0 && projects.length > 0 && (
        <Card title="Record delivery or usage" className="mb-4">
          <ActionForm action={recordMovement} submit="Record">
            <Grid cols={4}>
              <Field label="Type"><select name="type"><option value="IN">Delivery (in)</option><option value="OUT">Used on site (out)</option></select></Field>
              <Field label="Material"><select name="materialId">{materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}</select></Field>
              <Field label="Site"><select name="projectId">{projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select></Field>
              <Field label="Date"><input type="date" name="date" defaultValue={today()} required /></Field>
              <Field label="Quantity"><input type="number" name="quantity" step="any" min="0" required /></Field>
              <Field label="Unit cost USD (deliveries)"><input type="number" name="unitCost" step="0.01" min="0" /></Field>
              <Field label="Supplier (deliveries)"><select name="supplierId"><option value="">—</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
              <Field label="Payment method"><select name="method"><Options map={PAYMENT_METHODS} /></select></Field>
              <Field label="Note" className="sm:col-span-3"><input name="note" placeholder="Delivery note no., truck plate, where used…" /></Field>
              <div className="flex items-end pb-2 text-sm"><label className="mb-0 flex items-center gap-2 text-ink"><input type="checkbox" name="raiseExpense" defaultChecked className="w-auto" /> Raise expense for delivery</label></div>
            </Grid>
          </ActionForm>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Stock on hand">
          <Table head={["Material", "Total", "By site"]} empty={!stock.length}>
            {stock.map((m) => (
              <tr key={m.id}>
                <td className="font-medium">{m.name} {m.total < m.minStock && <Badge tone="bad">Low</Badge>}</td>
                <td className="num whitespace-nowrap">{m.total.toLocaleString()} {m.unit}</td>
                <td className="text-xs text-muted">{m.sites.map(([p, q]) => `${codes.get(p) ?? "closed site"}: ${q.toLocaleString()}`).join(" · ") || "—"}</td>
              </tr>
            ))}
          </Table>
          {ops && (
            <div className="mt-4 border-t border-line pt-4">
              <ActionForm action={createMaterial} submit="Add material" inline>
                <input name="name" placeholder="Cement 50kg" required />
                <input name="unit" placeholder="bags" required className="w-24" />
                <input name="minStock" type="number" step="any" min="0" placeholder="Min" className="w-20" />
              </ActionForm>
            </div>
          )}
        </Card>
        <Card title="Recent movements">
          <Table head={["Date", "Material", "Site", "Qty", "Value"]} empty={!recent.length}>
            {recent.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">{fmtDate(r.date)}</td>
                <td>{r.material.name}{r.note && <div className="text-xs text-muted">{r.note}</div>}</td>
                <td>{r.project.code}</td>
                <td className={`num whitespace-nowrap ${r.type === "OUT" ? "text-bad" : "text-ok"}`}>{r.type === "OUT" ? "−" : "+"}{r.quantity} {r.material.unit}</td>
                <td className="num">{r.unitCost ? fmt(Math.round(r.quantity * r.unitCost)) : "—"}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
