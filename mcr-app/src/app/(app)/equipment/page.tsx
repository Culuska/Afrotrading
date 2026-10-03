import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { EQUIPMENT_STATUSES } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, Grid, Options, PageHeader, Table, statusTone } from "@/components/ui";
import { createEquipment, moveEquipment } from "./actions";

export const metadata = { title: "Equipment" };

export default async function EquipmentPage() {
  const user = await requireUser();
  const ops = can.siteOps(user.role);
  const [items, projects] = await Promise.all([
    db.equipment.findMany({ include: { project: true }, orderBy: { name: "asc" } }),
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, orderBy: { code: "asc" } }),
  ]);
  const rentedOnSite = items.filter((i) => !i.owned && i.status === "ON_SITE").reduce((s, i) => s + i.dailyRate, 0);
  return (
    <>
      <PageHeader title="Equipment" sub={`${items.length} item(s) · rented equipment on site costs ${fmt(rentedOnSite)}/day`} />
      {ops && (
        <Card title="Add equipment" className="mb-4">
          <ActionForm action={createEquipment} submit="Add">
            <Grid cols={4}>
              <Field label="Name / plate"><input name="name" required placeholder="Excavator CAT 320 — SL-1234" /></Field>
              <Field label="Kind"><input name="kind" required placeholder="Excavator, mixer, truck, generator…" /></Field>
              <Field label="Ownership"><select name="owned"><option value="owned">Owned</option><option value="rented">Rented</option></select></Field>
              <Field label="Daily rate / cost (USD)"><input name="dailyRate" type="number" step="0.01" min="0" /></Field>
            </Grid>
          </ActionForm>
        </Card>
      )}
      <Card>
        <Table head={["Equipment", "Ownership", "Daily rate", "Status", "Location"]} empty={!items.length}>
          {items.map((i) => (
            <tr key={i.id}>
              <td className="font-medium">{i.name}<div className="text-xs text-muted">{i.kind}</div></td>
              <td>{i.owned ? "Owned" : "Rented"}</td>
              <td className="num">{fmt(i.dailyRate)}</td>
              <td><Badge tone={statusTone(i.status)}>{EQUIPMENT_STATUSES[i.status]}</Badge></td>
              <td>
                {ops ? (
                  <ActionForm action={moveEquipment} submit="Move" inline reset={false}>
                    <input type="hidden" name="id" value={i.id} />
                    <select name="status" defaultValue={i.status} className="w-32"><Options map={EQUIPMENT_STATUSES} /></select>
                    <select name="projectId" defaultValue={i.projectId ?? ""} className="w-28">
                      <option value="">Yard</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
                    </select>
                  </ActionForm>
                ) : (i.project?.code ?? "Yard")}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
