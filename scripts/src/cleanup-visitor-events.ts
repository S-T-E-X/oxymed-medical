import { db, visitorEventsTable, pool } from "@workspace/db";
import { lt } from "drizzle-orm";

const DAY_MS = 24 * 60 * 60 * 1000;

function resolveRetentionDays(): number {
  const fromArg = process.argv[2];
  const raw = fromArg ?? process.env["VISITOR_EVENTS_RETENTION_DAYS"];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 365;
}

async function main() {
  const retentionDays = resolveRetentionDays();
  const cutoff = new Date(Date.now() - retentionDays * DAY_MS);
  console.log(
    `🧹 Deleting visitor_events older than ${retentionDays} days (before ${cutoff.toISOString()})...`,
  );
  const deleted = await db
    .delete(visitorEventsTable)
    .where(lt(visitorEventsTable.createdAt, cutoff))
    .returning({ id: visitorEventsTable.id });
  console.log(`✅ Removed ${deleted.length} old visitor event(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
