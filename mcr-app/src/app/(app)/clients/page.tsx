import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { CLIENT_TYPES } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Grid, Options, PageHeader, Table } from "@/components/ui";
import { createClient } from "./actions";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await db.client.findMany({ include: { projects: { select: { contractValue: true, status: true } } }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="Clients" />
      {can.manageDirectory(user.role) && (
        <Card title="Add client" className="mb-4">
          <ActionForm action={createClient} submit="Add client">
            <Grid cols={4}>
              <Field label="Name" className="sm:col-span-2"><input name="name" required /></Field>
              <Field label="Type"><select name="type"><Options map={CLIENT_TYPES} /></select></Field>
              <Field label="Contact person"><input name="contact" /></Field>
              <Field label="Phone"><input name="phone" placeholder="+252 61 ..." /></Field>
              <Field label="Email"><input name="email" type="email" /></Field>
            </Grid>
          </ActionForm>
        </Card>
      )}
      <Card>
        <Table head={["Client", "Type", "Contact", "Projects", "Total contract value"]} empty={!clients.length}>
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="font-medium">{c.name}</td>
              <td>{CLIENT_TYPES[c.type]}</td>
              <td>{c.contact}<div className="text-xs text-muted">{[c.phone, c.email].filter(Boolean).join(" · ")}</div></td>
              <td className="num">{c.projects.length}</td>
              <td className="num">{fmt(c.projects.filter((p) => p.status !== "CANCELLED" && p.status !== "TENDER").reduce((s, p) => s + p.contractValue, 0))}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
