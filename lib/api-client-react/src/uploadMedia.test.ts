// @ts-nocheck -- this is a Node runtime test in a browser-oriented library project.
import assert from "node:assert/strict";
import test from "node:test";
import { uploadMedia } from "./generated/api";

test("generated uploadMedia sends the original binary body", async () => {
  const originalFetch = globalThis.fetch;
  const image = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" });
  let request: RequestInit | undefined;

  globalThis.fetch = async (_input, init) => {
    request = init;
    return new Response(
      JSON.stringify({
        id: 1,
        filename: "image.png",
        objectPath: "/objects/uploads/00000000-0000-4000-8000-000000000000",
        mimeType: "image/png",
        size: 4,
        createdAt: new Date().toISOString(),
      }),
      { status: 201, headers: { "content-type": "application/json" } },
    );
  };

  try {
    await uploadMedia(image, { headers: { "X-Media-Filename": "image.png" } });
    assert.equal(request?.body, image);
    assert.equal(new Headers(request?.headers).get("content-type"), "image/png");
    assert.equal(new Headers(request?.headers).get("x-media-filename"), "image.png");

    request = undefined;
    await assert.rejects(
      () => uploadMedia(new Blob([new Uint8Array([1])]), { headers: { "X-Media-Filename": "image.png" } }),
      /supported MIME type/,
    );
    assert.equal(request, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});