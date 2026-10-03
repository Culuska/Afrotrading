import Link from "next/link";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { isoDay, parseDate, today } from "@/lib/dates";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, PageHeader, Table } from "@/components/ui";
import { saveAttendance } from "./actions";

export const metadata = { title: "Attendance" };

export default async function LabourPage({ searchParams }: { searchParams: Promise<{ project?: string; date?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const projects = await db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, orderBy: { code: "asc" } });
  const projectId = sp.project ?? projects[0]?.id;
  let date: Date;
  try { date = parseDate(sp.date ?? today()); } catch { date = parseDate(today()); }

  const [workers, entries] = projectId
    ? await Promise.all([
        db.worker.findMany({ where: { active: true }, orderBy: [{ name: "asc" }] }),
        db.labourEntry.findMany({ where: { date }, include: { project: true } }),
      ])
    : [[], []];
  // Workers assigned here first, then anyone else (they may be moved for a day).
  const sorted = [...workers].sort((a, b) => Number(b.projectId === projectId) - Number(a.projectId === projectId));
  const here = entries.filter((e) => e.projectId === projectId);
  const dayCost = here.reduce((s, e) => s + Math.round(e.days * e.rate), 0);

  return (
    <>
      <PageHeader title="Daily attendance" sub="Record who worked on which site. Unpaid days flow into Payroll." />
      <Card className="mb-4">
        <form className="flex flex-wrap items-end gap-2">
          <div><label>Site</label>
            <select name="project" defaultValue={projectId}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
          </div>
          <div><label>Date</label><input type="date" name="date" defaultValue={isoDay(date)} max={today()} /></div>
          <button className="rounded-md bg-ink px-4 py-2 text-sm text-white">Load</button>
        </form>
      </Card>
      {!projectId ? (
        <p className="text-sm text-muted">No active projects. <Link className="text-brand underline" href="/projects">Create one</Link>.</p>
      ) : (
        <Card title={`${here.length} present · labour cost ${fmt(dayCost)}`}>
          <ActionForm action={saveAttendance} submit="Save attendance" reset={false}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="date" value={isoDay(date)} />
            <Table head={["Worker", "Trade", "Rate", "Days", ""]} empty={!sorted.length}>
              {sorted.map((w) => {
                const e = entries.find((x) => x.workerId === w.id);
                const elsewhere = e && e.projectId !== projectId;
                const locked = !!e?.expenseId;
                return (
                  <tr key={w.id}>
                    <td className="font-medium">{w.name}{w.projectId !== projectId && <span className="ml-1 text-xs text-muted">(other site)</span>}</td>
                    <td>{w.trade}</td>
                    <td className="num">{fmt(e?.rate ?? w.dailyRate)}</td>
                    <td className="w-32">
                      {elsewhere || locked || !can.siteOps(user.role) ? (
                        <span className="num">{e?.days ?? 0}</span>
                      ) : (
                        <select name={`d_${w.id}`} defaultValue={String(e?.days ?? 0)}>
                          <option value="0">Absent</option>
                          <option value="0.5">½ day</option>
                          <option value="1">Full day</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {elsewhere && <Badge tone="muted">At {e.project.code}</Badge>}
                      {locked && <Badge tone="ok">Paid</Badge>}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </ActionForm>
        </Card>
      )}
    </>
  );
}
