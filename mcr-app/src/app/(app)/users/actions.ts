"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { safe, str } from "@/lib/action";
import { ROLES, oneOf } from "@/lib/labels";

function checkPassword(p: string) {
  if (p.length < 10) throw new Error("Password must be at least 10 characters");
}

export const createUser = safe(async (fd) => {
  await requirePermission(can.manageUsers);
  const password = str(fd, "password");
  checkPassword(password);
  await db.user.create({
    data: {
      name: str(fd, "name"),
      email: str(fd, "email").toLowerCase(),
      role: oneOf(ROLES, fd.get("role")),
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  revalidatePath("/users");
  return "User created";
});

export const updateUser = safe(async (fd) => {
  const me = await requirePermission(can.manageUsers);
  const id = str(fd, "id");
  const role = oneOf(ROLES, fd.get("role"));
  const active = fd.get("active") === "on";
  if (id === me.id && (role !== "ADMIN" || !active)) throw new Error("You cannot demote or deactivate yourself");
  const password = String(fd.get("password") ?? "");
  if (password) checkPassword(password);
  await db.user.update({
    where: { id },
    data: { role, active, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) },
  });
  revalidatePath("/users");
  return "Updated";
});
