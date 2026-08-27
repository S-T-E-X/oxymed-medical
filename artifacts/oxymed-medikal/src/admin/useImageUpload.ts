import { useState } from "react";
import { uploadMedia } from "@workspace/api-client-react";
import { publicMediaUrl } from "./mediaUrl";

interface UploadResult {
  objectPath: string;
  publicUrl: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File): Promise<UploadResult> {
    setUploading(true);
    try {
      const media = await uploadMedia(file, {
        headers: {
          "X-Media-Filename": encodeURIComponent(file.name),
        },
      });

      return { objectPath: media.objectPath, publicUrl: publicMediaUrl(media.objectPath) };
    } finally {
      setUploading(false);
    }
  }

  return { uploadFile, uploading };
}
