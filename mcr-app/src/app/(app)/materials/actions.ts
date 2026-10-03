"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth";
import { optStr, safe, str } from "@/lib/action";
import { toCents } from "@/lib/money";
import { parseDate } from "@/lib/dates";
import { PAYMENT_METHODS, oneOf } from "@/lib/labels";

export const createMaterial = safe(async (fd) => {
  await requirePermission(can.siteOps);
  await db.material.create({ data: { name: str(fd, "name"), unit: str(fd, "unit"), minStock: Number(fd.get("minStock") || 0) } });
  revalidatePath("/materials");
  return "Material added";
});

export const recordMovement = safe(async (fd) => {
  const user = await requirePermission(can.siteOps);
  const materialId = str(fd, "materialId");
  const projectId = str(fd, "projectId");
  const type = str(fd, "type") === "OUT" ? "OUT" : "IN";
  const quantity = Number(fd.get("quantity"));
  if (!(quantity > 0)) throw new Error("Quantity must be greater than zero");
  const unitCost = type === "IN" ? toCents(fd.get("unitCost") || 0) : 0;
  const date = parseDate(fd.get("date"));
  const note = optStr(fd, "note");

  await db.$transaction(async (tx) => {
    const material = await tx.material.findUniqueOrThrow({ where: { id: materialId } });
    if (type === "OUT") {
      const agg = await tx.stockMovement.groupBy({ by: ["type"], where: { materialId, projectId }, _sum: { quantity: true } });
      const onHand = (agg.find((a) => a.type === "IN")?._sum.quantity ?? 0) - (agg.find((a) => a.type === "OUT")?._sum.quantity ?? 0);
      if (quantity > onHand + 1e-9) throw new Error(`Only ${onHand} ${material.unit} on this site`);
    }
    // A purchase can raise a pending MATERIALS expense so the cost is not entered twice by hand.
    let expenseId: string | null = null;
    if (type === "IN" && fd.get("raiseExpense") === "on") {
      if (!unitCost) throw new Error("Enter a unit cost to raise an expense");
      const e = await tx.expense.create({
        data: {
          projectId,
          supplierId: optStr(fd, "supplierId"),
          category: "MATERIALS",
          description: `${quantity} ${material.unit} ${material.name}${note ? ` — ${note}` : ""}`,
          amount: Math.round(quantity * unitCost),
          date,
          method: oneOf(PAYMENT_METHODS, fd.get("method") ?? "CASH"),
          createdById: user.id,
        },
      });
      expenseId = e.id;
    }
    await tx.stockMovement.create({ data: { materialId, projectId, type, quantity, unitCost, date, note, expenseId } });
  });
  revalidatePath("/materials");
  revalidatePath("/expenses");
  return type === "IN" ? "Delivery recorded" : "Usage recorded";
});
