import app from "./app";
import { db, mediaFilesTable } from "@workspace/db";
import { logger } from "./lib/logger";
import { reconcileLocalMedia } from "./lib/localMedia";
import { startVisitorCleanupScheduler } from "./lib/visitorCleanup";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer(): Promise<void> {
  const rows = await db.select({ objectPath: mediaFilesTable.objectPath }).from(mediaFilesTable);
  const reconciliation = await reconcileLocalMedia(rows.map((row) => row.objectPath));
  if (reconciliation.missing.length > 0) {
    logger.error(
      { objectPaths: reconciliation.missing },
      "Registered local media files are missing; restore them from the verified backup",
    );
  }
  logger.info(reconciliation, "Local media storage reconciled");

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    startVisitorCleanupScheduler();
  });
}

startServer().catch((err) => {
  logger.error({ err }, "Unable to reconcile local media storage before startup");
  process.exit(1);
});
