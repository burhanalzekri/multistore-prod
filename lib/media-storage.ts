import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { identifyImageFormat, type SupportedImageFormat } from "@/lib/media-format";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export class MediaUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUploadError";
  }
}

export type StoredImage = { publicId: string; url: string; format: SupportedImageFormat; bytes: number; storagePath: string };

function storageRoot(): string {
  const configured = process.env.MULTISTORE_MEDIA_DIR?.trim();
  return path.resolve(configured || path.join(process.cwd(), "var", "uploads"));
}

function safePart(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,100}$/.test(value);
}

export async function persistImageUpload(file: File, shopId: string, shopSlug: string): Promise<StoredImage> {
  if (!safePart(shopId) || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(shopSlug)) throw new MediaUploadError("Invalid tenant context.");
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) throw new MediaUploadError("Image must be between 1 byte and 5 MB.");

  const contents = Buffer.from(await file.arrayBuffer());
  if (contents.byteLength !== file.size || contents.byteLength > MAX_IMAGE_BYTES) throw new MediaUploadError("Invalid image size.");
  const format = identifyImageFormat(file.type, contents);
  if (!format) throw new MediaUploadError("Only valid JPEG, PNG, WebP, and AVIF images are supported.");

  const publicId = randomUUID();
  const directory = path.join(storageRoot(), shopId);
  const storagePath = path.join(directory, `${publicId}.image`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(storagePath, contents, { flag: "wx", mode: 0o600 });

  return {
    publicId,
    url: `/api/shops/${encodeURIComponent(shopSlug)}/media/${publicId}`,
    format,
    bytes: contents.byteLength,
    storagePath,
  };
}

export async function readStoredImage(shopId: string, publicId: string): Promise<Buffer> {
  if (!safePart(shopId) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(publicId)) throw new MediaUploadError("Invalid media identifier.");
  return readFile(path.join(storageRoot(), shopId, `${publicId}.image`));
}

export async function removeStoredImage(storagePath: string): Promise<void> {
  const root = storageRoot();
  const resolved = path.resolve(storagePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new MediaUploadError("Refusing to remove a file outside media storage.");
  await rm(resolved, { force: true });
}

export async function removeStoredImageById(shopId: string, publicId: string): Promise<void> {
  if (!safePart(shopId) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(publicId)) {
    throw new MediaUploadError("Invalid media identifier.");
  }
  await removeStoredImage(path.join(storageRoot(), shopId, `${publicId}.image`));
}
