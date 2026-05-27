import { Router, type IRouter } from "express";
import { db, emailLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/email-logs", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(parseInt((req.query["limit"] as string) ?? "100", 10), 200);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);
  const emailType = req.query["emailType"] as string | undefined;

  const query = db
    .select()
    .from(emailLogsTable)
    .orderBy(desc(emailLogsTable.sentAt))
    .limit(limit)
    .offset(offset);

  const rows = emailType
    ? await db
        .select()
        .from(emailLogsTable)
        .where(eq(emailLogsTable.emailType, emailType))
        .orderBy(desc(emailLogsTable.sentAt))
        .limit(limit)
        .offset(offset)
    : await query;

  res.json({ items: rows });
});

export default router;
