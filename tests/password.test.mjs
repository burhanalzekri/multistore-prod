import { expect, test } from "bun:test";
import { hashPassword, verifyPassword } from "../lib/password.ts";

test("password hashes use unique salts and verify only the matching secret", async () => {
  const first = await hashPassword("correct horse battery staple 2026");
  const second = await hashPassword("correct horse battery staple 2026");

  expect(first.startsWith("scrypt$32768$8$1$")).toBe(true);
  expect(first).not.toBe(second);
  expect(await verifyPassword("correct horse battery staple 2026", first)).toBe(true);
  expect(await verifyPassword("incorrect password", first)).toBe(false);
});

test("password hashing rejects weak or oversized inputs and malformed hashes", async () => {
  await expect(hashPassword("too-short")).rejects.toThrow();
  expect(await verifyPassword("anything", "not-a-scrypt-hash")).toBe(false);
});
