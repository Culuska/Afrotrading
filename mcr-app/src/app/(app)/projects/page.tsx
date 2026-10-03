import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { projectFinancials } from "@/lib/finance";
import { fmt, pct } from "@/lib/money";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/labels";
import { Badge, Bar, Card, LinkButton, PageHeader, Table, statusTone } from "@/components/ui";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status } = await searchParams;
  const where = status && status in PROJECT_STATUSES ? { status: status as ProjectStatus } : {};
  const projects = await db.project.findMany({ where, include: { client: true }, orderBy: { createdAt: "desc" } });
  const fin = await projectFinancials(projects.map((p) => p.id));
  return (
    <>
      <PageHeader title="Projects" sub={`${projects.length} project(s)`}>
        {can.manageProjects(user.role) && <LinkButton href="/projects/new">New project</LinkButton>}
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/projects" className={!status ? "font-semibold text-brand" : "text-muted"}>All</Link>
        {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
          <Link key={k} href={`/projects?status=${k}`} className={status === k ? "font-semibold text-brand" : "text-muted"}>{v}</Link>
        ))}
      </div>
      <Card>
        <Table head={["Project", "Client", "Status", "Contract", "Budget used", "Margin to date", "Progress"]} empty={!projects.length}>
          {projects.map((p) => {
            const f = fin.get(p.id)!;
            const margin = f.invoiced - f.actualCost;
            return (
              <tr key={p.id}>
                <td>
                  <Link href={`/projects/${p.id}`} className="font-medium text-brand hover:underline">{p.code}</Link>
                  <div className="text-xs text-muted">{p.name} · {PROJECT_TYPES[p.type]} · {p.location}</div>
                </td>
                <td>{p.client.name}</td>
                <td><Badge tone={statusTone(p.status)}>{PROJECT_STATUSES[p.status]}</Badge></td>
                <td className="num">{fmt(p.contractValue)}</td>
                <td className="w-40">
                  <Bar value={f.actualCost} max={f.budget} />
                  <div className="num mt-1 text-xs text-muted">{fmt(f.actualCost)} / {fmt(f.budget)} ({pct(f.actualCost, f.budget)}%)</div>
                </td>
                <td className={`num ${margin < 0 ? "text-bad" : ""}`}>{fmt(margin)}</td>
                <td className="num">{p.progressPct}%</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
