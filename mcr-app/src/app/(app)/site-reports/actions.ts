"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { parseDate } from "@/lib/dates";

export const createReport = safe(async (fd) => {
  const user = await requirePermission(can.siteOps);
  const projectId = str(fd, "projectId");
  await db.dailyReport.create({
    data: {
      projectId,
      authorId: user.id,
      date: parseDate(fd.get("date")),
      weather: optStr(fd, "weather"),
      workersCount: Math.max(0, Math.round(Number(fd.get("workersCount") || 0))),
      workDone: str(fd, "workDone"),
      issues: optStr(fd, "issues"),
    },
  });
  revalidatePath("/site-reports");
  revalidatePath(`/projects/${projectId}`);
  return "Report saved";
});
