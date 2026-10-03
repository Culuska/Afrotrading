import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: Role };

export async function getUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const id = await verifySession(token);
  if (!id) return null;
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

// What each role may do. Viewers are read-only everywhere.
export const can = {
  manageUsers: (r: Role) => r === "ADMIN",
  manageProjects: (r: Role) => r === "ADMIN",
  editBudgets: (r: Role) => r === "ADMIN" || r === "FINANCE",
  submitExpense: (r: Role) => r !== "VIEWER",
  approveExpense: (r: Role) => r === "ADMIN" || r === "FINANCE",
  manageInvoices: (r: Role) => r === "ADMIN" || r === "FINANCE",
  payroll: (r: Role) => r === "ADMIN" || r === "FINANCE",
  siteOps: (r: Role) => r !== "VIEWER",
  manageDirectory: (r: Role) => r !== "VIEWER",
};

export async function requirePermission(check: (r: Role) => boolean): Promise<CurrentUser> {
  const user = await requireUser();
  if (!check(user.role)) throw new Error("You do not have permission to do that.");
  return user;
}
