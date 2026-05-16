import { useState } from "react";
import { requestMediaUploadUrl, uploadMedia } from "@workspace/api-client-react";

interface UploadResult {
  objectPath: string;
  publicUrl: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File): Promise<UploadResult> {
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestMediaUploadUrl({
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      });

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      await uploadMedia({
        filename: file.name,
        objectPath,
        mimeType: file.type || undefined,
        size: file.size,
      });

      const publicUrl = `/api/storage/public-objects/${objectPath}`;
      return { objectPath, publicUrl };
    } finally {
      setUploading(false);
    }
  }

  return { uploadFile, uploading };
}
