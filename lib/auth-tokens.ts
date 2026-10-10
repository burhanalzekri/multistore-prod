import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

export type AuthTokenPurpose = "verify" | "reset";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashAuthToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAuthToken(purpose: AuthTokenPurpose, email: string): Promise<string> {
  const identifier = `${purpose}:${normalizeEmail(email)}`;
  const rawToken = randomBytes(32).toString("base64url");
  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashAuthToken(rawToken),
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return rawToken;
}

export function makeAuthLink(path: string, email: string, token: string): string {
  const base = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = new URL(path, base);
  link.searchParams.set("email", normalizeEmail(email));
  link.searchParams.set("token", token);
  return link.toString();
}
