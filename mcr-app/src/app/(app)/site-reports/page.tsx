import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmtDate, today } from "@/lib/dates";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Grid, PageHeader } from "@/components/ui";
import { createReport } from "./actions";

export const metadata = { title: "Site diary" };

export default async function SiteReportsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await requireUser();
  const { project } = await searchParams;
  const [projects, reports] = await Promise.all([
    db.project.findMany({ where: { status: { in: ["ACTIVE", "ON_HOLD"] } }, orderBy: { code: "asc" } }),
    db.dailyReport.findMany({
      where: project ? { projectId: project } : {},
      include: { project: true, author: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
  ]);
  return (
    <>
      <PageHeader title="Site diary" sub="Daily record of work done and problems on each site." />
      {can.siteOps(user.role) && projects.length > 0 && (
        <Card title="New daily report" className="mb-4">
          <ActionForm action={createReport} submit="Save report">
            <Grid cols={4}>
              <Field label="Site"><select name="projectId" defaultValue={project}>{projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</select></Field>
              <Field label="Date"><input type="date" name="date" defaultValue={today()} required /></Field>
              <Field label="Weather"><input name="weather" placeholder="Hot, dry" /></Field>
              <Field label="Workers on site"><input type="number" name="workersCount" min="0" /></Field>
            </Grid>
            <Field label="Work done"><textarea name="workDone" rows={3} required /></Field>
            <Field label="Issues / delays / safety incidents"><textarea name="issues" rows={2} /></Field>
          </ActionForm>
        </Card>
      )}
      <div className="space-y-3">
        {reports.length === 0 && <Card><p className="text-sm text-muted">No reports yet.</p></Card>}
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="text-xs text-muted">{fmtDate(r.date)} · <span className="font-medium text-ink">{r.project.code}</span> · {r.author.name} · {r.workersCount} workers{r.weather && ` · ${r.weather}`}</div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{r.workDone}</p>
            {r.issues && <p className="mt-1 whitespace-pre-wrap text-sm text-bad">Issue: {r.issues}</p>}
          </Card>
        ))}
      </div>
    </>
  );
}
