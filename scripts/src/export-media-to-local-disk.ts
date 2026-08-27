import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { db, mediaFilesTable } from "@workspace/db";

const OBJECT_PATH_RE =
  /^\/objects\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const outputRoot = path.resolve(
  process.env["MEDIA_EXPORT_DIR"] ?? "/home/runner/workspace/oxymed-media-export",
);
const apiOrigin = (process.env["MEDIA_EXPORT_API_URL"] ?? "http://127.0.0.1:8080").replace(/\/$/, "");

function filePathFor(objectPath: string): string {
  if (!OBJECT_PATH_RE.test(objectPath)) {
    throw new Error(`Unsupported object path in media_files: ${objectPath}`);
  }
  const root = path.join(outputRoot, "files");
  const destination = path.resolve(root, objectPath.slice(1));
  const relative = path.relative(root, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Object path escapes export root: ${objectPath}`);
  }
  return destination;
}

function checksum(body: Buffer): string {
  return createHash("sha256").update(body).digest("hex");
}

async function writeAtomically(destination: string, body: Buffer): Promise<void> {
  await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o750 });
  const temp = `${destination}.${process.pid}.partial`;
  await fs.writeFile(temp, body, { flag: "w", mode: 0o640 });
  await fs.rename(temp, destination);
}

async function main(): Promise<void> {
  const rows = await db.select().from(mediaFilesTable);
  const manifest: Array<{
    id: number;
    objectPath: string;
    filename: string;
    size: number;
    sha256: string;
  }> = [];

  for (const row of rows) {
    const url = `${apiOrigin}/api/storage/public-objects/${row.objectPath.replace(/^\//, "")}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Media export failed for id ${row.id}: HTTP ${response.status} (${row.objectPath})`);
    }

    const body = Buffer.from(await response.arrayBuffer());
    if (body.length === 0) {
      throw new Error(`Media export failed for id ${row.id}: empty response (${row.objectPath})`);
    }
    if (row.size != null && body.length !== row.size) {
      throw new Error(
        `Media export failed for id ${row.id}: expected ${row.size} bytes, received ${body.length}`,
      );
    }

    await writeAtomically(filePathFor(row.objectPath), body);
    manifest.push({
      id: row.id,
      objectPath: row.objectPath,
      filename: row.filename,
      size: body.length,
      sha256: checksum(body),
    });
  }

  await fs.mkdir(outputRoot, { recursive: true, mode: 0o750 });
  await fs.writeFile(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify({ exportedAt: new Date().toISOString(), count: manifest.length, files: manifest }, null, 2)}\n`,
    { mode: 0o640 },
  );
  console.log(`Exported and verified ${manifest.length} media file(s) to ${outputRoot}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});