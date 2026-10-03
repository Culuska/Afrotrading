import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { projectFinancials } from "@/lib/finance";
import { fmt, pct } from "@/lib/money";
import { fmtDate } from "@/lib/dates";
import { COST_CATEGORIES, PROJECT_STATUSES } from "@/lib/labels";
import { Card, Grid, PageHeader, Stat, Table } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";

export default async function ProjectCostReport({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { client: true } });
  if (!project) notFound();
  const [f, expenses] = await Promise.all([
    projectFinancials([id]).then((m) => m.get(id)!),
    db.expense.findMany({ where: { projectId: id, status: { in: ["APPROVED", "PAID"] } }, include: { supplier: true }, orderBy: { date: "asc" } }),
  ]);
  const forecast = project.progressPct > 0 ? Math.round((f.actualCost / project.progressPct) * 100) : f.budget;
  return (
    <>
      <PageHeader title={`Cost report — ${project.code}`} sub={`${project.name} · ${project.client.name} · ${PROJECT_STATUSES[project.status]} · ${project.progressPct}% complete`}>
        <PrintButton />
      </PageHeader>
      <Grid cols={4}>
        <Stat label="Contract" value={fmt(project.contractValue)} />
        <Stat label="Budget" value={fmt(f.budget)} />
        <Stat label="Cost to date" value={fmt(f.actualCost)} hint={`${pct(f.actualCost, f.budget)}% of budget`} />
        <Stat label="Forecast final cost" value={fmt(forecast)} hint={`Margin at completion ${fmt(project.contractValue - forecast)}`} tone={forecast > f.budget ? "bad" : "ok"} />
      </Grid>
      <Card title="By category" className="mt-4">
        <Table head={["Category", "Budget", "Actual", "Variance", "% used"]}>
          {f.byCategory.filter((c) => c.budget || c.actual).map((c) => (
            <tr key={c.category}>
              <td>{c.label}</td>
              <td className="num">{fmt(c.budget)}</td>
              <td className="num">{fmt(c.actual)}</td>
              <td className={`num ${c.budget - c.actual < 0 ? "text-bad" : ""}`}>{fmt(c.budget - c.actual)}</td>
              <td className="num">{pct(c.actual, c.budget)}%</td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title={`Cost ledger (${expenses.length})`} className="mt-4">
        <Table head={["Date", "Category", "Description", "Supplier", "Status", "Amount"]} empty={!expenses.length}>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap">{fmtDate(e.date)}</td>
              <td>{COST_CATEGORIES[e.category]}</td>
              <td>{e.description}</td>
              <td>{e.supplier?.name ?? "—"}</td>
              <td>{e.status === "PAID" ? "Paid" : "Owed"}</td>
              <td className="num">{fmt(e.amount)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
