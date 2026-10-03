import { notFound } from "next/navigation";
import { can, requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ProjectForm } from "../ProjectForm";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const user = await requireUser();
  if (!can.manageProjects(user.role)) notFound();
  return (
    <>
      <PageHeader title="New project" />
      <Card><ProjectForm /></Card>
    </>
  );
}
