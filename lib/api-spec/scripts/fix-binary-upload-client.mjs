import fs from "node:fs/promises";
import path from "node:path";

const filePath = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "api-client-react",
  "src",
  "generated",
  "api.ts",
);
const source = await fs.readFile(filePath, "utf8");
const generatedStart = `export const uploadMedia = async (uploadMediaBody: Blob, options?: RequestInit): Promise<MediaFile> => {

  return customFetch`;
const validatedStart = `export const uploadMedia = async (uploadMediaBody: Blob, options?: RequestInit): Promise<MediaFile> => {
  const contentType = uploadMediaBody.type;
  if (!["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"].includes(contentType)) {
    throw new Error("uploadMedia requires a Blob with a supported MIME type.");
  }

  return customFetch`;
const generatedBody = /headers: \{ 'Content-Type': '[^']+', \.\.\.options\?\.headers \},\n    body: JSON\.stringify\(\n      uploadMediaBody,\)/;
const rawBinaryBody = `headers: { 'Content-Type': contentType, ...options?.headers },
    body: uploadMediaBody`;

if (!source.includes(generatedStart) || !generatedBody.test(source)) {
  throw new Error("The generated uploadMedia implementation changed; review binary upload serialization.");
}

await fs.writeFile(
  filePath,
  source.replace(generatedStart, validatedStart).replace(generatedBody, rawBinaryBody),
);