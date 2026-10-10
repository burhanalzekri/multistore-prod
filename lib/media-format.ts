export type SupportedImageFormat = "jpg" | "png" | "webp" | "avif";

export function identifyImageFormat(mimeType: string, bytes: Uint8Array): SupportedImageFormat | null {
  if (mimeType === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (mimeType === "image/png" && bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "png";
  if (mimeType === "image/webp" && bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "webp";
  if (mimeType === "image/avif" && bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "avif";
  return null;
}

export function imageMimeType(format: SupportedImageFormat): string {
  switch (format) {
    case "jpg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "avif": return "image/avif";
  }
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}
