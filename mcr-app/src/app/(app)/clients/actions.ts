"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { CLIENT_TYPES, oneOf } from "@/lib/labels";

export const createClient = safe(async (fd) => {
  await requirePermission(can.manageDirectory);
  await db.client.create({
    data: {
      name: str(fd, "name"),
      type: oneOf(CLIENT_TYPES, fd.get("type")),
      contact: optStr(fd, "contact"),
      phone: optStr(fd, "phone"),
      email: optStr(fd, "email"),
    },
  });
  revalidatePath("/clients");
  return "Client added";
});

export const createSupplier = safe(async (fd) => {
  await requirePermission(can.manageDirectory);
  await db.supplier.create({ data: { name: str(fd, "name"), category: optStr(fd, "category"), phone: optStr(fd, "phone") } });
  revalidatePath("/suppliers");
  return "Supplier added";
});
