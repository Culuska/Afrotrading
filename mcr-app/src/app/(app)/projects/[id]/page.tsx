import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { projectFinancials } from "@/lib/finance";
import { centsToInput, fmt, pct } from "@/lib/money";
import { fmtDate } from "@/lib/dates";
import { COST_CATEGORIES, EXPENSE_STATUSES, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Bar, Card, Grid, LinkButton, PageHeader, Stat, Table, statusTone } from "@/components/ui";
import { saveBudget, updateProgress } from "../actions";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      client: true,
      manager: true,
      expenses: { orderBy: { date: "desc" }, take: 10, include: { supplier: true } },
      invoices: { orderBy: { issueDate: "desc" }, include: { payments: true } },
      workers: { where: { active: true }, orderBy: { name: "asc" } },
      equipment: true,
      dailyReports: { orderBy: { date: "desc" }, take: 5, include: { author: true } },
    },
  });
  if (!project) notFound();
  const f = (await projectFinancials([id])).get(id)!;

  const stock = await db.stockMovement.groupBy({
    by: ["materialId", "type"],
    where: { projectId: id },
    _sum: { quantity: true },
  });
  const materials = await db.material.findMany({ where: { id: { in: [...new Set(stock.map((s) => s.materialId))] } } });
  const onSite = materials.map((m) => {
    const inQ = stock.find((s) => s.materialId === m.id && s.type === "IN")?._sum.quantity ?? 0;
    const outQ = stock.find((s) => s.materialId === m.id && s.type === "OUT")?._sum.quantity ?? 0;
    return { ...m, qty: inQ - outQ, used: outQ };
  });

  const costPct = pct(f.actualCost, f.budget);
  const projectedMargin = project.contractValue - f.budget;
  // Simple earned-value check: spending should roughly track physical progress.
  const overrun = f.budget > 0 && costPct > project.progressPct + 10;

  return (
    <>
      <PageHeader title={`${project.code} — ${project.name}`} sub={`${project.client.name} · ${PROJECT_TYPES[project.type]} · ${project.location} · ${fmtDate(project.startDate)} → ${fmtDate(project.endDate)}`}>
        <Badge tone={statusTone(project.status)}>{PROJECT_STATUSES[project.status]}</Badge>
        {can.manageProjects(user.role) && <LinkButton href={`/projects/${id}/edit`} variant="secondary">Edit</LinkButton>}
        <LinkButton href={`/reports/project/${id}`} variant="secondary">Cost report</LinkButton>
      </PageHeader>

      {overrun && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-bad">
          Cost warning: {costPct}% of budget spent but work is only {project.progressPct}% complete. At this rate the
          project will finish around {fmt(Math.round(f.actualCost / Math.max(project.progressPct, 1) * 100))} against a
          budget of {fmt(f.budget)}.
        </div>
      )}

      <Grid cols={4}>
        <Stat label="Contract value" value={fmt(project.contractValue)} hint={`Projected margin ${fmt(projectedMargin)} (${pct(projectedMargin, project.contractValue)}%)`} tone={projectedMargin < 0 ? "bad" : undefined} />
        <Stat label="Actual cost" value={fmt(f.actualCost)} hint={`${costPct}% of ${fmt(f.budget)} budget · ${fmt(f.pendingCost)} pending`} tone={overrun ? "bad" : undefined} />
        <Stat label="Invoiced" value={fmt(f.invoiced)} hint={`${pct(f.invoiced, project.contractValue)}% of contract · retention ${fmt(f.retention)}`} />
        <Stat label="Receivable" value={fmt(f.receivable)} hint={`Received ${fmt(f.received)}`} tone={f.receivable > 0 ? "warn" : undefined} />
      </Grid>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Budget vs actual" className="lg:col-span-2">
          {can.editBudgets(user.role) ? (
            <ActionForm action={saveBudget} submit="Save budget" reset={false}>
              <input type="hidden" name="projectId" value={id} />
              <BudgetTable rows={f.byCategory} editable />
            </ActionForm>
          ) : (
            <BudgetTable rows={f.byCategory} />
          )}
        </Card>

        <Card title="Progress">
          <div className="num text-3xl font-semibold">{project.progressPct}%</div>
          <div className="my-2"><Bar value={project.progressPct} max={100} /></div>
          <p className="text-xs text-muted">Manager: {project.manager?.name ?? "Unassigned"}</p>
          {f.unpaidLabour > 0 && <p className="mt-2 text-xs text-warn">Unpaid labour on this site: {fmt(f.unpaidLabour)}</p>}
          {can.siteOps(user.role) && (
            <div className="mt-4">
              <ActionForm action={updateProgress} submit="Update" reset={false} inline>
                <input type="hidden" name="id" value={id} />
                <input name="progressPct" type="number" min="0" max="100" defaultValue={project.progressPct} className="w-20" />
              </ActionForm>
            </div>
          )}
          {project.notes && <p className="mt-4 whitespace-pre-wrap text-sm">{project.notes}</p>}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Recent expenses" actions={<Link className="text-xs text-brand" href={`/expenses?project=${id}`}>All →</Link>}>
          <Table head={["Date", "Description", "Amount", "Status"]} empty={!project.expenses.length}>
            {project.expenses.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{fmtDate(e.date)}</td>
                <td>{e.description}<div className="text-xs text-muted">{COST_CATEGORIES[e.category]}{e.supplier && ` · ${e.supplier.name}`}</div></td>
                <td className="num">{fmt(e.amount)}</td>
                <td><Badge tone={statusTone(e.status)}>{EXPENSE_STATUSES[e.status]}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Invoices" actions={<Link className="text-xs text-brand" href={`/invoices?project=${id}`}>All →</Link>}>
          <Table head={["No.", "Milestone", "Amount", "Received"]} empty={!project.invoices.length}>
            {project.invoices.map((i) => (
              <tr key={i.id}>
                <td><Link className="text-brand hover:underline" href={`/invoices/${i.id}`}>{i.number}</Link></td>
                <td>{i.description}{i.status === "CANCELLED" && <> <Badge tone="bad">Cancelled</Badge></>}</td>
                <td className="num">{fmt(i.amount)}</td>
                <td className="num">{fmt(i.payments.reduce((s, p) => s + p.amount, 0))}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title={`Materials on site (${onSite.length})`}>
          <Table head={["Material", "On site", "Used"]} empty={!onSite.length}>
            {onSite.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className="num">{m.qty.toLocaleString()} {m.unit}</td>
                <td className="num">{m.used.toLocaleString()} {m.unit}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title={`Workers & equipment on site`}>
          <p className="mb-2 text-sm">{project.workers.length} active worker(s){project.workers.length > 0 && ": "}
            <span className="text-muted">{project.workers.map((w) => `${w.name} (${w.trade})`).join(", ")}</span>
          </p>
          <p className="text-sm">{project.equipment.length} equipment item(s){project.equipment.length > 0 && ": "}
            <span className="text-muted">{project.equipment.map((e) => e.name).join(", ")}</span>
          </p>
        </Card>

        <Card title="Site diary" className="lg:col-span-2" actions={<Link className="text-xs text-brand" href={`/site-reports?project=${id}`}>All →</Link>}>
          {project.dailyReports.length === 0 && <p className="text-sm text-muted">No site reports yet.</p>}
          <ul className="space-y-3">
            {project.dailyReports.map((r) => (
              <li key={r.id} className="text-sm">
                <div className="text-xs text-muted">{fmtDate(r.date)} · {r.author.name} · {r.workersCount} workers{r.weather && ` · ${r.weather}`}</div>
                <div>{r.workDone}</div>
                {r.issues && <div className="text-bad">Issue: {r.issues}</div>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function BudgetTable({ rows, editable }: { rows: { category: string; label: string; budget: number; actual: number }[]; editable?: boolean }) {
  const tb = rows.reduce((s, r) => s + r.budget, 0);
  const ta = rows.reduce((s, r) => s + r.actual, 0);
  return (
    <Table head={["Category", "Budget", "Actual", "Remaining", ""]}>
      {rows.map((r) => (
        <tr key={r.category}>
          <td>{r.label}</td>
          <td className="num w-36">
            {editable ? <input name={`b_${r.category}`} type="number" step="0.01" min="0" defaultValue={centsToInput(r.budget)} /> : fmt(r.budget)}
          </td>
          <td className="num">{fmt(r.actual)}</td>
          <td className={`num ${r.budget - r.actual < 0 ? "text-bad" : ""}`}>{fmt(r.budget - r.actual)}</td>
          <td className="w-28"><Bar value={r.actual} max={r.budget} danger={r.budget === 0 && r.actual > 0} /></td>
        </tr>
      ))}
      <tr className="font-semibold">
        <td>Total</td>
        <td className="num">{fmt(tb)}</td>
        <td className="num">{fmt(ta)}</td>
        <td className={`num ${tb - ta < 0 ? "text-bad" : ""}`}>{fmt(tb - ta)}</td>
        <td />
      </tr>
    </Table>
  );
}
