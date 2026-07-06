import { Router, type IRouter } from "express";
import { db, visitorEventsTable } from "@workspace/db";
import { sql, gte, desc, count, countDistinct } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const TrackBody = z.object({
  visitorId: z.string().min(1).max(64),
  sessionId: z.string().min(1).max(64),
  path: z.string().min(1).max(512),
  referrerSource: z.string().max(128).optional().nullable(),
  deviceType: z.enum(["desktop", "mobile", "tablet"]).optional().nullable(),
});

// Lightweight in-memory rate limit per client IP to reduce trivial abuse of
// the public tracking endpoint. Best-effort only (single-process assumption).
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (rateBuckets.size > 5000) {
      for (const [key, b] of rateBuckets) {
        if (now >= b.resetAt) rateBuckets.delete(key);
      }
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX;
}

router.post("/analytics/track", async (req, res): Promise<void> => {
  const ip = req.ip ?? "unknown";
  if (isRateLimited(ip)) {
    res.status(429).end();
    return;
  }
  const parsed = TrackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { visitorId, sessionId, path, referrerSource, deviceType } = parsed.data;
  await db.insert(visitorEventsTable).values({
    visitorId,
    sessionId,
    path,
    referrerSource: referrerSource ?? "direct",
    deviceType: deviceType ?? "desktop",
  });
  res.status(204).end();
});

router.get("/analytics/summary", requireAuth, async (req, res): Promise<void> => {
  const rawDays = parseInt((req.query["days"] as string) ?? "7", 10);
  const days = Number.isFinite(rawDays) && rawDays > 0 && rawDays <= 90 ? rawDays : 7;

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - (days - 1));
  rangeStart.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const prevRangeStart = new Date(rangeStart);
  prevRangeStart.setDate(prevRangeStart.getDate() - days);

  const dayExpr = sql<string>`to_char(${visitorEventsTable.createdAt}, 'YYYY-MM-DD')`;

  const [
    totalsRow,
    todayRow,
    prevVisitorsRow,
    seriesRows,
    topPagesRows,
    deviceRows,
    referrerRows,
  ] = await Promise.all([
    db
      .select({
        visitors: countDistinct(visitorEventsTable.visitorId),
        pageViews: count(),
      })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, rangeStart)),
    db
      .select({
        visitors: countDistinct(visitorEventsTable.visitorId),
        pageViews: count(),
      })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, todayStart)),
    db
      .select({ visitors: countDistinct(visitorEventsTable.visitorId) })
      .from(visitorEventsTable)
      .where(
        sql`${visitorEventsTable.createdAt} >= ${prevRangeStart} AND ${visitorEventsTable.createdAt} < ${rangeStart}`,
      ),
    db
      .select({
        date: dayExpr,
        visitors: countDistinct(visitorEventsTable.visitorId),
        pageViews: count(),
      })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, rangeStart))
      .groupBy(dayExpr),
    db
      .select({ label: visitorEventsTable.path, count: count() })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, rangeStart))
      .groupBy(visitorEventsTable.path)
      .orderBy(desc(count()))
      .limit(8),
    db
      .select({ label: visitorEventsTable.deviceType, count: count() })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, rangeStart))
      .groupBy(visitorEventsTable.deviceType)
      .orderBy(desc(count())),
    db
      .select({ label: visitorEventsTable.referrerSource, count: count() })
      .from(visitorEventsTable)
      .where(gte(visitorEventsTable.createdAt, rangeStart))
      .groupBy(visitorEventsTable.referrerSource)
      .orderBy(desc(count())),
  ]);

  const seriesMap = new Map(seriesRows.map((r) => [r.date, r]));
  const timeSeries: { date: string; visitors: number; pageViews: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const row = seriesMap.get(key);
    timeSeries.push({
      date: key,
      visitors: row?.visitors ?? 0,
      pageViews: row?.pageViews ?? 0,
    });
  }

  const totalVisitors = totalsRow?.[0]?.visitors ?? 0;
  const prevVisitors = prevVisitorsRow?.[0]?.visitors ?? 0;
  const visitorChangePct =
    prevVisitors === 0
      ? totalVisitors > 0
        ? 100
        : 0
      : Math.round(((totalVisitors - prevVisitors) / prevVisitors) * 100);

  res.json({
    totalVisitors,
    totalPageViews: totalsRow?.[0]?.pageViews ?? 0,
    todayVisitors: todayRow?.[0]?.visitors ?? 0,
    todayPageViews: todayRow?.[0]?.pageViews ?? 0,
    visitorChangePct,
    timeSeries,
    topPages: topPagesRows.map((r) => ({ label: r.label, count: r.count })),
    deviceBreakdown: deviceRows.map((r) => ({ label: r.label, count: r.count })),
    referrerBreakdown: referrerRows.map((r) => ({ label: r.label, count: r.count })),
  });
});

export default router;
