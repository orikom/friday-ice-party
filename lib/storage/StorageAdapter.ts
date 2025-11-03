export interface StorageAdapter {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
  getPublicUrl(path: string): string;
}

export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "public/uploads";
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<string> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const uploadPath = path.join(process.cwd(), this.uploadDir);
    await fs.mkdir(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, filename);
    await fs.writeFile(filePath, file);

    return `/uploads/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Remove leading slash if present
    const relativePath = url.startsWith("/") ? url.slice(1) : url;
    const filePath = path.join(process.cwd(), relativePath);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, that's okay
      console.warn("Failed to delete file:", filePath, error);
    }
  }

  getPublicUrl(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }
}

export class S3StorageAdapter implements StorageAdapter {
  // TODO: Implement S3 adapter
  // Requires: AWS SDK, S3 bucket configuration

  async uploadFile(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<string> {
    console.log("[S3] Would upload file:", { filename, mimeType });
    throw new Error("S3 adapter not yet implemented");
  }

  async deleteFile(url: string): Promise<void> {
    console.log("[S3] Would delete file:", url);
    throw new Error("S3 adapter not yet implemented");
  }

  getPublicUrl(path: string): string {
    const bucketUrl = process.env.S3_BUCKET_URL || "";
    return `${bucketUrl}/${path}`;
  }
}

export function getStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "s3":
      return new S3StorageAdapter();
    case "local":
    default:
      return new LocalStorageAdapter();
  }
}
