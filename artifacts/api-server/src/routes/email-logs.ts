import { Router, type IRouter } from "express";
import { db, emailLogsTable } from "@workspace/db";
import { desc, eq, or, ilike, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/email-logs", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(parseInt((req.query["limit"] as string) ?? "100", 10), 200);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);
  const emailType = (req.query["emailType"] as string | undefined)?.trim() || undefined;
  const search = (req.query["search"] as string | undefined)?.trim() || undefined;

  const typeCondition = emailType ? eq(emailLogsTable.emailType, emailType) : undefined;
  const searchCondition = search
    ? or(
        ilike(emailLogsTable.recipientEmail, `%${search}%`),
        ilike(emailLogsTable.subject, `%${search}%`),
        ilike(emailLogsTable.relatedRef, `%${search}%`),
        ilike(emailLogsTable.sentBy, `%${search}%`),
      )
    : undefined;

  const whereClause =
    typeCondition && searchCondition
      ? and(typeCondition, searchCondition)
      : typeCondition ?? searchCondition;

  const rows = await db
    .select()
    .from(emailLogsTable)
    .where(whereClause)
    .orderBy(desc(emailLogsTable.sentAt))
    .limit(limit)
    .offset(offset);

  res.json({ items: rows });
});

export default router;
