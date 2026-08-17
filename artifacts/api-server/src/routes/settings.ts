import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, isAdminRequest } from "../lib/auth";
import { writeAdminAuditLog } from "../lib/audit";
import { z } from "zod/v4";

const router: IRouter = Router();

// Setting keys are used as object keys on the public site and as DB lookup
// values; keep them to a boring, predictable shape.
const SettingKeySchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9_.-]+$/, "Geçersiz ayar anahtarı");

// Settings the public website must never receive. Everything else in this
// table is site copy (titles, images, contact details) that the front end
// renders anyway.
const INTERNAL_SETTING_KEYS = new Set(["hazirlayan_kisiler"]);
const INTERNAL_KEY_PATTERNS = [/secret/i, /password/i, /token/i, /api[_-]?key/i, /smtp/i];

function isInternalSetting(key: string): boolean {
  return INTERNAL_SETTING_KEYS.has(key) || INTERNAL_KEY_PATTERNS.some((re) => re.test(key));
}

router.get("/settings", async (req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable);
  // Admin screens need the full map (e.g. quote-form preparer names); anonymous
  // visitors only get the keys the public site actually renders. The check
  // verifies both JWT signature and DB existence so a deleted admin's token
  // cannot reveal internal settings for up to 8 hours.
  res.setHeader("Vary", "Authorization");
  const includeInternal = await isAdminRequest(req);

  const map: Record<string, string> = {};
  for (const row of rows) {
    if (!includeInternal && isInternalSetting(row.settingKey)) continue;
    map[row.settingKey] = row.settingValue;
  }
  res.json(map);
});

router.put("/settings/:settingKey", requireAuth, async (req, res): Promise<void> => {
  const rawKey = Array.isArray(req.params["settingKey"])
    ? req.params["settingKey"][0]
    : req.params["settingKey"];
  const parsedKey = SettingKeySchema.safeParse(rawKey);
  if (!parsedKey.success) {
    res.status(400).json({ error: "Geçersiz ayar anahtarı" });
    return;
  }
  const settingKey = parsedKey.data;

  const parsed = z.object({ settingValue: z.string().max(200_000) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz istek gövdesi" });
    return;
  }

  const existing = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.settingKey, settingKey));

  let setting;
  if (existing.length > 0) {
    [setting] = await db
      .update(siteSettingsTable)
      .set({ settingValue: parsed.data.settingValue })
      .where(eq(siteSettingsTable.settingKey, settingKey))
      .returning();
  } else {
    [setting] = await db
      .insert(siteSettingsTable)
      .values({ settingKey, settingValue: parsed.data.settingValue })
      .returning();
  }

  await writeAdminAuditLog(req, {
    action: existing.length > 0 ? "setting.update" : "setting.create",
    targetType: "site_setting",
    targetId: settingKey,
  });

  res.json(setting);
});

export default router;
