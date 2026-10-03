"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";

export const createWorker = safe(async (fd) => {
  await requirePermission(can.manageDirectory);
  const dailyRate = toCents(fd.get("dailyRate"));
  if (dailyRate <= 0) throw new Error("Daily rate must be greater than zero");
  await db.worker.create({
    data: { name: str(fd, "name"), phone: optStr(fd, "phone"), trade: str(fd, "trade"), dailyRate, projectId: optStr(fd, "projectId") },
  });
  revalidatePath("/workers");
  return "Worker added";
});

// Rate changes apply to attendance logged from now on; past entries keep the rate they were logged at.
export const updateWorker = safe(async (fd) => {
  await requirePermission(can.manageDirectory);
  const id = str(fd, "id");
  const dailyRate = toCents(fd.get("dailyRate"));
  if (dailyRate <= 0) throw new Error("Daily rate must be greater than zero");
  await db.worker.update({
    where: { id },
    data: { projectId: optStr(fd, "projectId"), dailyRate, active: fd.get("active") === "on" },
  });
  revalidatePath("/workers");
  return "Updated";
});
