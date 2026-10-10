import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 32_768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

function deriveKey(password: string, salt: Buffer, N = SCRYPT_OPTIONS.N): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, KEY_LENGTH, { ...SCRYPT_OPTIONS, N }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 128) {
    throw new Error("Password must be between 12 and 128 characters.");
  }
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  if (password.length > 128) return false;
  const [algorithm, nText, rText, pText, saltText, keyText, extra] = encoded.split("$");
  if (extra !== undefined || algorithm !== "scrypt") return false;
  if (nText !== String(SCRYPT_OPTIONS.N) || rText !== String(SCRYPT_OPTIONS.r) || pText !== String(SCRYPT_OPTIONS.p)) return false;
  if (!saltText || !keyText) return false;

  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(keyText, "base64url");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await deriveKey(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
