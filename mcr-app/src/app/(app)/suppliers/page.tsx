import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Grid, PageHeader, Table } from "@/components/ui";
import { createSupplier } from "../clients/actions";

export const metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const user = await requireUser();
  const [suppliers, spend] = await Promise.all([
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.expense.groupBy({ by: ["supplierId", "status"], where: { supplierId: { not: null }, status: { in: ["APPROVED", "PAID"] } }, _sum: { amount: true } }),
  ]);
  const total = (id: string, s?: string) => spend.filter((x) => x.supplierId === id && (!s || x.status === s)).reduce((a, x) => a + (x._sum.amount ?? 0), 0);
  return (
    <>
      <PageHeader title="Suppliers" />
      {can.manageDirectory(user.role) && (
        <Card title="Add supplier" className="mb-4">
          <ActionForm action={createSupplier} submit="Add supplier">
            <Grid>
              <Field label="Name"><input name="name" required /></Field>
              <Field label="Supplies"><input name="category" placeholder="Cement, steel, sand, transport…" /></Field>
              <Field label="Phone"><input name="phone" /></Field>
            </Grid>
          </ActionForm>
        </Card>
      )}
      <Card>
        <Table head={["Supplier", "Supplies", "Phone", "Total spend", "Approved but unpaid"]} empty={!suppliers.length}>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td className="font-medium">{s.name}</td>
              <td>{s.category ?? "—"}</td>
              <td>{s.phone ?? "—"}</td>
              <td className="num">{fmt(total(s.id))}</td>
              <td className={`num ${total(s.id, "APPROVED") ? "text-warn" : ""}`}>{fmt(total(s.id, "APPROVED"))}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
