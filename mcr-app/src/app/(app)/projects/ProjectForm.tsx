import type { Project } from "@prisma/client";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { Field, Grid, Options } from "@/components/ui";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/labels";
import { centsToInput } from "@/lib/money";
import { isoDay } from "@/lib/dates";
import { createProject, updateProject } from "./actions";

export async function ProjectForm({ project }: { project?: Project }) {
  const [clients, managers] = await Promise.all([
    db.client.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true, role: { in: ["ADMIN", "SITE_MANAGER"] } }, orderBy: { name: "asc" } }),
  ]);
  if (!clients.length) {
    return <p className="text-sm text-muted">Add a client first under <a className="text-brand underline" href="/clients">Clients</a>.</p>;
  }
  return (
    <ActionForm action={project ? updateProject : createProject} submit={project ? "Save changes" : "Create project"} reset={false}>
      {project && <input type="hidden" name="id" value={project.id} />}
      <Grid>
        <Field label="Project code"><input name="code" required defaultValue={project?.code} placeholder="MCR-2026-001" /></Field>
        <Field label="Project name" className="sm:col-span-2"><input name="name" required defaultValue={project?.name} /></Field>
        <Field label="Client">
          <select name="clientId" required defaultValue={project?.clientId}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Location (district)"><input name="location" required defaultValue={project?.location} placeholder="Hodan, Mogadishu" /></Field>
        <Field label="Project manager">
          <select name="managerId" defaultValue={project?.managerId ?? ""}>
            <option value="">— Unassigned —</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Type"><select name="type" defaultValue={project?.type ?? "NEW_BUILD"}><Options map={PROJECT_TYPES} /></select></Field>
        <Field label="Status"><select name="status" defaultValue={project?.status ?? "ACTIVE"}><Options map={PROJECT_STATUSES} /></select></Field>
        <Field label="Contract value (USD)"><input name="contractValue" type="number" step="0.01" min="0" required defaultValue={project ? centsToInput(project.contractValue) : ""} /></Field>
        <Field label="Retention %"><input name="retentionPct" type="number" step="0.5" min="0" max="20" defaultValue={project?.retentionPct ?? 5} /></Field>
        <Field label="Progress %"><input name="progressPct" type="number" min="0" max="100" defaultValue={project?.progressPct ?? 0} /></Field>
        <Field label="Start date"><input name="startDate" type="date" defaultValue={isoDay(project?.startDate)} /></Field>
        <Field label="End date"><input name="endDate" type="date" defaultValue={isoDay(project?.endDate)} /></Field>
      </Grid>
      <Field label="Notes"><textarea name="notes" rows={3} defaultValue={project?.notes ?? ""} /></Field>
    </ActionForm>
  );
}
