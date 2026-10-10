import { expect, test } from "bun:test";
import { identifyImageFormat } from "../lib/media-format.ts";

test("recognizes supported formats from matching MIME type and file signature", () => {
  expect(identifyImageFormat("image/jpeg", Uint8Array.from([0xff, 0xd8, 0xff, 0x00]))).toBe("jpg");
  expect(identifyImageFormat("image/png", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
  expect(identifyImageFormat("image/webp", new TextEncoder().encode("RIFF0000WEBP"))).toBe("webp");
  expect(identifyImageFormat("image/avif", new TextEncoder().encode("0000ftypavif"))).toBe("avif");
});

test("rejects an unsupported image type or mismatched signature", () => {
  expect(identifyImageFormat("image/svg+xml", new TextEncoder().encode("<svg/>"))).toBeNull();
  expect(identifyImageFormat("image/jpeg", new TextEncoder().encode("not-jpeg"))).toBeNull();
});
