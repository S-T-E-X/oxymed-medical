import { db, visitorEventsTable } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";

const DAY_MS = 24 * 60 * 60 * 1000;

function resolveRetentionDays(): number {
  const raw = process.env["VISITOR_EVENTS_RETENTION_DAYS"];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  // Default: keep 12 months of visitor analytics.
  return 365;
}

/**
 * Delete visitor_events rows older than the configured retention window.
 * Returns the number of rows removed.
 */
export async function cleanupOldVisitorEvents(
  retentionDays: number = resolveRetentionDays(),
): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * DAY_MS);
  const deleted = await db
    .delete(visitorEventsTable)
    .where(lt(visitorEventsTable.createdAt, cutoff))
    .returning({ id: visitorEventsTable.id });
  return deleted.length;
}

/**
 * Start a best-effort periodic scheduler that prunes old visitor events.
 * Runs once shortly after startup and then every 24 hours. Single-process
 * assumption; safe because deletes are idempotent.
 */
export function startVisitorCleanupScheduler(): void {
  const retentionDays = resolveRetentionDays();

  const run = async (): Promise<void> => {
    try {
      const removed = await cleanupOldVisitorEvents(retentionDays);
      if (removed > 0) {
        logger.info(
          { removed, retentionDays },
          "Pruned old visitor_events rows",
        );
      }
    } catch (err) {
      logger.error({ err }, "Failed to prune old visitor_events rows");
    }
  };

  // Delay the first run slightly so it does not compete with startup work.
  setTimeout(() => {
    void run();
  }, 30_000).unref();

  setInterval(() => {
    void run();
  }, DAY_MS).unref();

  logger.info({ retentionDays }, "Visitor events cleanup scheduler started");
}
