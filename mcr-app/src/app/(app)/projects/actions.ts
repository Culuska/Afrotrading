"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CostCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";
import { parseOptionalDate } from "@/lib/dates";
import { COST_CATEGORIES, PROJECT_STATUSES, PROJECT_TYPES, oneOf } from "@/lib/labels";

function projectData(fd: FormData) {
  const progress = Number(fd.get("progressPct") ?? 0);
  const retention = Number(fd.get("retentionPct") ?? 0);
  if (!(progress >= 0 && progress <= 100)) throw new Error("Progress must be 0–100");
  if (!(retention >= 0 && retention <= 20)) throw new Error("Retention must be 0–20%");
  return {
    code: str(fd, "code").toUpperCase(),
    name: str(fd, "name"),
    clientId: str(fd, "clientId"),
    managerId: optStr(fd, "managerId"),
    location: str(fd, "location"),
    type: oneOf(PROJECT_TYPES, fd.get("type")),
    status: oneOf(PROJECT_STATUSES, fd.get("status")),
    contractValue: toCents(fd.get("contractValue")),
    retentionPct: retention,
    progressPct: Math.round(progress),
    startDate: parseOptionalDate(fd.get("startDate")),
    endDate: parseOptionalDate(fd.get("endDate")),
    notes: optStr(fd, "notes"),
  };
}

export const createProject = safe(async (fd) => {
  await requirePermission(can.manageProjects);
  const p = await db.project.create({ data: projectData(fd) });
  revalidatePath("/projects");
  redirect(`/projects/${p.id}`);
});

export const updateProject = safe(async (fd) => {
  await requirePermission(can.manageProjects);
  const id = str(fd, "id");
  await db.project.update({ where: { id }, data: projectData(fd) });
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
});

// Site managers may update progress on projects without full edit rights.
export const updateProgress = safe(async (fd) => {
  await requirePermission(can.siteOps);
  const id = str(fd, "id");
  const progress = Math.round(Number(fd.get("progressPct")));
  if (!(progress >= 0 && progress <= 100)) throw new Error("Progress must be 0–100");
  await db.project.update({ where: { id }, data: { progressPct: progress } });
  revalidatePath(`/projects/${id}`);
  return "Progress updated";
});

export const saveBudget = safe(async (fd) => {
  await requirePermission(can.editBudgets);
  const projectId = str(fd, "projectId");
  const ops = (Object.keys(COST_CATEGORIES) as CostCategory[]).map((category) => {
    const amount = toCents(fd.get(`b_${category}`) || 0);
    if (amount < 0) throw new Error("Budget amounts cannot be negative");
    return db.budgetLine.upsert({
      where: { projectId_category: { projectId, category } },
      create: { projectId, category, amount },
      update: { amount },
    });
  });
  await db.$transaction(ops);
  revalidatePath(`/projects/${projectId}`);
  return "Budget saved";
});
