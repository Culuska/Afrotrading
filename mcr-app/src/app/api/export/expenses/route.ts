import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isoDay } from "@/lib/dates";
import { COST_CATEGORIES, EXPENSE_STATUSES, PAYMENT_METHODS } from "@/lib/labels";
import { expenseWhere } from "@/app/(app)/expenses/filters";

function cell(v: string | number | null | undefined): string {
  let s = String(v ?? "");
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await db.expense.findMany({
    where: expenseWhere(sp),
    include: { project: true, supplier: true, createdBy: true, approvedBy: true },
    orderBy: { date: "asc" },
  });
  const header = ["Date", "Project", "Category", "Description", "Supplier", "Amount USD", "Method", "Reference", "Status", "Submitted by", "Reviewed by", "Paid at"];
  const lines = rows.map((e) =>
    [
      isoDay(e.date), e.project?.code ?? "OVERHEAD", COST_CATEGORIES[e.category], e.description, e.supplier?.name,
      (e.amount / 100).toFixed(2), PAYMENT_METHODS[e.method], e.reference, EXPENSE_STATUSES[e.status],
      e.createdBy.name, e.approvedBy?.name, isoDay(e.paidAt),
    ].map(cell).join(","),
  );
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expenses-${isoDay(new Date())}.csv"`,
    },
  });
}
