import { prisma } from "@/lib/prisma";

export async function logAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, entityType, entityId, metadata: metadata as any },
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}
