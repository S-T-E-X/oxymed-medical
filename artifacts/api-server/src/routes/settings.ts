import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.settingKey] = row.settingValue;
  }
  res.json(map);
});

router.put("/settings/:settingKey", requireAuth, async (req, res): Promise<void> => {
  const settingKey = Array.isArray(req.params["settingKey"]) ? req.params["settingKey"][0] : req.params["settingKey"];
  const parsed = z.object({ settingValue: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.settingKey, settingKey!));

  let setting;
  if (existing.length > 0) {
    [setting] = await db
      .update(siteSettingsTable)
      .set({ settingValue: parsed.data.settingValue })
      .where(eq(siteSettingsTable.settingKey, settingKey!))
      .returning();
  } else {
    [setting] = await db
      .insert(siteSettingsTable)
      .values({ settingKey: settingKey!, settingValue: parsed.data.settingValue })
      .returning();
  }
  res.json(setting);
});

export default router;
