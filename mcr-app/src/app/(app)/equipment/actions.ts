"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";
import { EQUIPMENT_STATUSES, oneOf } from "@/lib/labels";

export const createEquipment = safe(async (fd) => {
  await requirePermission(can.siteOps);
  await db.equipment.create({
    data: {
      name: str(fd, "name"),
      kind: str(fd, "kind"),
      owned: fd.get("owned") === "owned",
      dailyRate: toCents(fd.get("dailyRate") || 0),
      notes: optStr(fd, "notes"),
    },
  });
  revalidatePath("/equipment");
  return "Equipment added";
});

export const moveEquipment = safe(async (fd) => {
  await requirePermission(can.siteOps);
  const projectId = optStr(fd, "projectId");
  let status = oneOf(EQUIPMENT_STATUSES, fd.get("status"));
  if (projectId && status === "AVAILABLE") status = "ON_SITE";
  if (!projectId && status === "ON_SITE") status = "AVAILABLE";
  await db.equipment.update({ where: { id: str(fd, "id") }, data: { projectId: status === "ON_SITE" ? projectId : null, status } });
  revalidatePath("/equipment");
  return "Updated";
});
