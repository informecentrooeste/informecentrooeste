import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";

export async function logAudit(
  userId: number | null,
  action: string,
  entityType: string,
  entityId?: string | number,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      userId: userId ?? undefined,
      action,
      entityType,
      entityId: entityId?.toString(),
      metadata: metadata ?? null,
    });
  } catch {
    // Audit logging should not break the main flow
  }
}
