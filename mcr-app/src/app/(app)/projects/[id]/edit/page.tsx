import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ProjectForm } from "../../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!can.manageProjects(user.role)) notFound();
  const project = await db.project.findUnique({ where: { id: (await params).id } });
  if (!project) notFound();
  return (
    <>
      <PageHeader title={`Edit ${project.code}`} sub={project.name} />
      <Card><ProjectForm project={project} /></Card>
    </>
  );
}
