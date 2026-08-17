import type { Request } from "express";
import { db, adminAuditLogsTable } from "@workspace/db";
import type { JwtPayload } from "./auth";

export async function writeAdminAuditLog(
  req: Request,
  input: {
    action: string;
    targetType: string;
    targetId?: string | number;
    details?: Record<string, string | number | boolean | null>;
  },
): Promise<void> {
  const payload = (req as Request & { adminPayload?: JwtPayload }).adminPayload;
  if (!payload) return;

  try {
    await db.insert(adminAuditLogsTable).values({
      adminId: payload.adminId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId == null ? null : String(input.targetId),
      details: input.details,
    });
  } catch (error) {
    req.log.error({ err: error, action: input.action }, "Admin audit log could not be written");
  }
}