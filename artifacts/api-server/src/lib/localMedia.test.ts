import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  finalizeLocalMediaDeletion,
  getLocalMediaFile,
  isSafeLocalMediaObjectPath,
  publishStagedLocalMedia,
  reconcileLocalMedia,
  readLocalMedia,
  stageLocalMedia,
  stageLocalMediaDeletion,
} from "./localMedia";

test("local media paths are UUID-only and files leave public storage before deletion", async () => {
  const root = await mkdtemp(path.join("/tmp", "oxymed-local-media-test-"));
  const previousRoot = process.env.MEDIA_STORAGE_DIR;
  process.env.MEDIA_STORAGE_DIR = root;

  try {
    assert.equal(isSafeLocalMediaObjectPath("/objects/uploads/../secret"), false);
    assert.equal(isSafeLocalMediaObjectPath("/objects/uploads/not-a-uuid"), false);

    const staged = await stageLocalMedia(Buffer.from("verified media content"));
    assert.match(
      staged.objectPath,
      /^\/objects\/uploads\/[0-9a-f-]{36}$/i,
    );
    await publishStagedLocalMedia(staged);

    assert.equal((await readLocalMedia(staged.objectPath)).toString(), "verified media content");
    assert.ok(await getLocalMediaFile(staged.objectPath));

    const deletion = await stageLocalMediaDeletion(staged.objectPath);
    assert.ok(deletion);
    assert.equal(await getLocalMediaFile(staged.objectPath), null);

    const recoveredDeletion = await reconcileLocalMedia([staged.objectPath]);
    assert.equal(recoveredDeletion.restored, 1);
    assert.ok(await getLocalMediaFile(staged.objectPath));

    const finalDeletion = await stageLocalMediaDeletion(staged.objectPath);
    assert.ok(finalDeletion);
    await finalizeLocalMediaDeletion(finalDeletion!);
    assert.equal(await getLocalMediaFile(staged.objectPath), null);

    const interruptedUpload = await stageLocalMedia(Buffer.from("restart recovery"));
    const recoveredUpload = await reconcileLocalMedia([interruptedUpload.objectPath]);
    assert.equal(recoveredUpload.published, 1);
    assert.equal((await readLocalMedia(interruptedUpload.objectPath)).toString(), "restart recovery");
  } finally {
    if (previousRoot === undefined) delete process.env.MEDIA_STORAGE_DIR;
    else process.env.MEDIA_STORAGE_DIR = previousRoot;
    await rm(root, { recursive: true, force: true });
  }
});