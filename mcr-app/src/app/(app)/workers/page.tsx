import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { centsToInput, fmt } from "@/lib/money";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Grid, PageHeader, Table } from "@/components/ui";
import { createWorker, updateWorker } from "./actions";

export const metadata = { title: "Workers" };

export default async function WorkersPage() {
  const user = await requireUser();
  const edit = can.manageDirectory(user.role);
  const [workers, projects] = await Promise.all([
    db.worker.findMany({ include: { project: true }, orderBy: [{ active: "desc" }, { name: "asc" }] }),
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, orderBy: { code: "asc" } }),
  ]);
  const ProjectSelect = ({ value }: { value?: string | null }) => (
    <select name="projectId" defaultValue={value ?? ""}>
      <option value="">— Not assigned —</option>
      {projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
    </select>
  );
  return (
    <>
      <PageHeader title="Workers" sub={`${workers.filter((w) => w.active).length} active · daily-rate casual and skilled labour`} />
      {edit && (
        <Card title="Add worker" className="mb-4">
          <ActionForm action={createWorker} submit="Add worker">
            <Grid cols={4}>
              <Field label="Full name"><input name="name" required /></Field>
              <Field label="Trade"><input name="trade" required placeholder="Mason, carpenter, labourer…" list="trades" /></Field>
              <Field label="Daily rate (USD)"><input name="dailyRate" type="number" step="0.01" min="0.01" required /></Field>
              <Field label="Phone (for mobile money)"><input name="phone" placeholder="+252 61 ..." /></Field>
              <Field label="Assigned site"><ProjectSelect /></Field>
            </Grid>
            <datalist id="trades">
              {["Labourer", "Mason", "Carpenter", "Steel fixer", "Electrician", "Plumber", "Painter", "Foreman", "Driver", "Guard"].map((t) => <option key={t} value={t} />)}
            </datalist>
          </ActionForm>
        </Card>
      )}
      <Card>
        <Table head={["Name", "Trade", "Phone", "Daily rate", "Site", ""]} empty={!workers.length}>
          {workers.map((w) => (
            <tr key={w.id} className={w.active ? "" : "opacity-50"}>
              <td className="font-medium">{w.name}</td>
              <td>{w.trade}</td>
              <td>{w.phone ?? "—"}</td>
              {edit ? (
                <td colSpan={3}>
                  <ActionForm action={updateWorker} submit="Save" inline reset={false}>
                    <input type="hidden" name="id" value={w.id} />
                    <input name="dailyRate" type="number" step="0.01" min="0.01" defaultValue={centsToInput(w.dailyRate)} className="w-24" />
                    <span className="w-28"><ProjectSelect value={w.projectId} /></span>
                    <label className="mb-0 flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={w.active} className="w-auto" /> Active</label>
                  </ActionForm>
                </td>
              ) : (
                <>
                  <td className="num">{fmt(w.dailyRate)}</td>
                  <td>{w.project?.code ?? "—"}</td>
                  <td />
                </>
              )}
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
