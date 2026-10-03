import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ROLES } from "@/lib/labels";
import { ActionForm } from "@/components/ActionForm";
import { Card, Field, Grid, Options, PageHeader, Table } from "@/components/ui";
import { createUser, updateUser } from "./actions";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireUser();
  if (!can.manageUsers(me.role)) notFound();
  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="Users" sub="Admin: everything · Finance: approve/pay, invoices, payroll · Site manager: submit expenses, attendance, stock, diary · Viewer: read-only" />
      <Card title="Add user" className="mb-4">
        <ActionForm action={createUser} submit="Create user">
          <Grid cols={4}>
            <Field label="Name"><input name="name" required /></Field>
            <Field label="Email"><input name="email" type="email" required /></Field>
            <Field label="Role"><select name="role" defaultValue="SITE_MANAGER"><Options map={ROLES} /></select></Field>
            <Field label="Temporary password"><input name="password" type="text" minLength={10} required /></Field>
          </Grid>
        </ActionForm>
      </Card>
      <Card>
        <Table head={["Name", "Email", "Role / access / reset password"]}>
          {users.map((u) => (
            <tr key={u.id} className={u.active ? "" : "opacity-50"}>
              <td className="font-medium">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <ActionForm action={updateUser} submit="Save" inline reset={false}>
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="w-36"><Options map={ROLES} /></select>
                  <label className="mb-0 flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={u.active} className="w-auto" /> Active</label>
                  <input name="password" type="text" placeholder="New password" minLength={10} className="w-36" />
                </ActionForm>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
