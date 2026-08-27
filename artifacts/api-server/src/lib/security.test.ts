import assert from "node:assert/strict";
import test from "node:test";
import { detectMediaContentType, validateMediaUploadMetadata } from "./security";

test("detectMediaContentType recognises each supported format by signature", () => {
  assert.equal(detectMediaContentType(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
  assert.equal(
    detectMediaContentType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "image/png",
  );
  assert.equal(detectMediaContentType(Buffer.from("RIFF0000WEBP", "ascii")), "image/webp");
  assert.equal(detectMediaContentType(Buffer.from("xxxxftypavif", "ascii")), "image/avif");
  assert.equal(detectMediaContentType(Buffer.from("%PDF-1.7", "ascii")), "application/pdf");
  assert.equal(detectMediaContentType(Buffer.from("<script>alert(1)</script>")), null);
});

test("upload metadata rejects traversal and MIME/extension mismatches", () => {
  assert.equal(
    validateMediaUploadMetadata({
      name: "../invoice.pdf",
      size: 10,
      contentType: "application/pdf",
    }).ok,
    false,
  );
  assert.equal(
    validateMediaUploadMetadata({
      name: "photo.jpg",
      size: 10,
      contentType: "image/png",
    }).ok,
    false,
  );
  assert.equal(
    validateMediaUploadMetadata({
      name: "photo.png",
      size: 10,
      contentType: "image/png",
    }).ok,
    true,
  );
});