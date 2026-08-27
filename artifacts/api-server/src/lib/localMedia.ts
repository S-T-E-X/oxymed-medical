import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const OBJECT_PATH_RE =
  /^\/objects\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StagedMedia = {
  objectPath: string;
  stagedPath: string;
};

export type StagedDeletion = {
  sourcePath: string;
  trashPath: string;
};

function mediaRoot(): string {
  const configured = process.env["MEDIA_STORAGE_DIR"];

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MEDIA_STORAGE_DIR must be an absolute path in production.");
    }
    return path.resolve(process.cwd(), ".oxymed-local-media");
  }

  if (!path.isAbsolute(configured)) {
    throw new Error("MEDIA_STORAGE_DIR must be an absolute path.");
  }

  return path.resolve(configured);
}

function publicRoot(): string {
  return path.join(mediaRoot(), "files");
}

function stagingRoot(): string {
  return path.join(mediaRoot(), ".staging");
}

function trashRoot(): string {
  return path.join(mediaRoot(), ".trash");
}

function relativeObjectPath(objectPath: string): string {
  if (!OBJECT_PATH_RE.test(objectPath)) {
    throw new Error("Invalid local media object path.");
  }
  return objectPath.slice(1);
}

function objectFilename(objectPath: string): string {
  return path.basename(relativeObjectPath(objectPath));
}

function stagingPathFor(objectPath: string): string {
  return path.join(stagingRoot(), `${objectFilename(objectPath)}.upload`);
}

function trashPathFor(objectPath: string): string {
  return path.join(trashRoot(), `${objectFilename(objectPath)}.deleted`);
}

function publicPathFor(objectPath: string): string {
  const root = publicRoot();
  const candidate = path.resolve(root, relativeObjectPath(objectPath));
  const relative = path.relative(root, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Local media path escapes its storage root.");
  }
  return candidate;
}

export function isSafeLocalMediaObjectPath(objectPath: string): boolean {
  return OBJECT_PATH_RE.test(objectPath);
}

export function createLocalMediaObjectPath(): string {
  return `/objects/uploads/${randomUUID()}`;
}

/**
 * Write incoming bytes into a non-public staging directory. The value used for
 * the on-disk path is server generated; the client filename is display-only.
 */
export async function stageLocalMedia(body: Buffer): Promise<StagedMedia> {
  const objectPath = createLocalMediaObjectPath();
  const stagedPath = stagingPathFor(objectPath);
  await fs.mkdir(path.dirname(stagedPath), { recursive: true, mode: 0o750 });
  await fs.writeFile(stagedPath, body, { flag: "wx", mode: 0o640 });
  return { objectPath, stagedPath };
}

/**
 * Atomically expose a completed upload. link() is intentionally used instead
 * of rename() so an astronomically unlikely UUID collision cannot overwrite an
 * existing public file.
 */
export async function publishStagedLocalMedia(staged: StagedMedia): Promise<void> {
  const destination = publicPathFor(staged.objectPath);
  await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o750 });
  await fs.link(staged.stagedPath, destination);
  await fs.rm(staged.stagedPath, { force: true });
}

export async function discardStagedLocalMedia(staged: Pick<StagedMedia, "stagedPath">): Promise<void> {
  await fs.rm(staged.stagedPath, { force: true });
}

export async function getLocalMediaFile(
  objectPath: string,
): Promise<{ filePath: string; size: number; etag: string } | null> {
  const filePath = publicPathFor(objectPath);
  try {
    const stat = await fs.lstat(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) return null;
    return {
      filePath,
      size: stat.size,
      etag: `W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export function openLocalMediaFile(filePath: string): NodeJS.ReadableStream {
  return createReadStream(filePath);
}

/**
 * Remove a media file from the public tree before its database registration is
 * deleted. If the database operation fails, restoreStagedDeletion makes the
 * file public again.
 */
export async function stageLocalMediaDeletion(objectPath: string): Promise<StagedDeletion | null> {
  const sourcePath = publicPathFor(objectPath);
  const trashPath = trashPathFor(objectPath);
  await fs.mkdir(path.dirname(trashPath), { recursive: true, mode: 0o750 });

  try {
    await fs.lstat(trashPath);
    throw new Error("A previous deletion for this media file is awaiting reconciliation.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  try {
    await fs.rename(sourcePath, trashPath);
    return { sourcePath, trashPath };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function restoreStagedLocalMediaDeletion(deletion: StagedDeletion): Promise<void> {
  await fs.mkdir(path.dirname(deletion.sourcePath), { recursive: true, mode: 0o750 });
  await fs.rename(deletion.trashPath, deletion.sourcePath);
}

export async function finalizeLocalMediaDeletion(deletion: StagedDeletion): Promise<void> {
  await fs.rm(deletion.trashPath, { force: true });
}

export async function readLocalMedia(objectPath: string): Promise<Buffer> {
  const entry = await getLocalMediaFile(objectPath);
  if (!entry) throw new Error("Local media file not found.");
  return fs.readFile(entry.filePath);
}

/**
 * Conversion keeps the public UUID URL stable. Replace through a temporary
 * sibling file so static serving can never observe a partial image.
 */
export async function replaceLocalMedia(objectPath: string, body: Buffer): Promise<void> {
  const destination = publicPathFor(objectPath);
  const existing = await getLocalMediaFile(objectPath);
  if (!existing) throw new Error("Local media file not found.");

  const tempPath = path.join(
    path.dirname(destination),
    `.${path.basename(destination)}.${randomUUID()}.tmp`,
  );
  await fs.writeFile(tempPath, body, { flag: "wx", mode: 0o640 });
  await fs.rename(tempPath, destination);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(filePath);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function removeUnregisteredFiles(
  directory: string,
  suffix: string,
  registeredPaths: Set<string>,
): Promise<number> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    let removed = 0;
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(suffix)) continue;
      const uuid = suffix ? entry.name.slice(0, -suffix.length) : entry.name;
      const objectPath = `/objects/uploads/${uuid}`;
      if (!isSafeLocalMediaObjectPath(objectPath) || registeredPaths.has(objectPath)) continue;
      await fs.rm(path.join(directory, entry.name), { force: true });
      removed++;
    }
    return removed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
}

/**
 * Repair a process crash between the filesystem action and its database
 * mutation. Every staged/trash filename derives from the object UUID, so a
 * restart can deterministically resume or roll back the operation.
 */
export async function reconcileLocalMedia(
  objectPaths: readonly string[],
): Promise<{
  published: number;
  restored: number;
  missing: string[];
  removedOrphans: number;
}> {
  const registeredPaths = new Set(objectPaths.filter(isSafeLocalMediaObjectPath));
  let published = 0;
  let restored = 0;
  const missing: string[] = [];

  await fs.mkdir(stagingRoot(), { recursive: true, mode: 0o750 });
  await fs.mkdir(trashRoot(), { recursive: true, mode: 0o750 });

  for (const objectPath of registeredPaths) {
    const publicFile = publicPathFor(objectPath);
    const stagedFile = stagingPathFor(objectPath);
    const trashFile = trashPathFor(objectPath);
    const [hasPublicFile, hasStagedFile, hasTrashFile] = await Promise.all([
      fileExists(publicFile),
      fileExists(stagedFile),
      fileExists(trashFile),
    ]);

    if (hasPublicFile) {
      // Crash after link() but before staged-file removal.
      if (hasStagedFile) await fs.rm(stagedFile, { force: true });
      continue;
    }
    if (hasStagedFile) {
      await publishStagedLocalMedia({ objectPath, stagedPath: stagedFile });
      published++;
      continue;
    }
    if (hasTrashFile) {
      await fs.mkdir(path.dirname(publicFile), { recursive: true, mode: 0o750 });
      await fs.rename(trashFile, publicFile);
      restored++;
      continue;
    }
    missing.push(objectPath);
  }

  const publicUploadDirectory = path.join(publicRoot(), "objects", "uploads");
  const removedOrphans = (
    await Promise.all([
      removeUnregisteredFiles(stagingRoot(), ".upload", registeredPaths),
      removeUnregisteredFiles(trashRoot(), ".deleted", registeredPaths),
      removeUnregisteredFiles(publicUploadDirectory, "", registeredPaths),
    ])
  ).reduce((total, count) => total + count, 0);

  return { published, restored, missing, removedOrphans };
}

export function checksumMedia(body: Buffer): string {
  return createHash("sha256").update(body).digest("hex");
}