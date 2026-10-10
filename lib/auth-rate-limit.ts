import { createHmac } from "node:crypto";
import { db } from "@/lib/db";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

function subjectHash(email: string): string {
  const secret = process.env.AUTH_RATE_LIMIT_SECRET ?? process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configure a high-entropy AUTH_SECRET before enabling authentication.");
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

export async function isLoginRateLimited(email: string): Promise<boolean> {
  const key = subjectHash(email);
  const now = new Date();
  const state = await db.authRateLimit.findUnique({ where: { subjectHash: key } });
  if (!state) return false;
  if (state.blockedUntil && state.blockedUntil > now) return true;

  if (now.getTime() - state.windowStartedAt.getTime() >= WINDOW_MS) {
    await db.authRateLimit.update({
      where: { subjectHash: key },
      data: { attempts: 0, windowStartedAt: now, blockedUntil: null },
    });
    return false;
  }

  return state.attempts >= MAX_FAILURES;
}

export async function recordLoginFailure(email: string): Promise<void> {
  const key = subjectHash(email);
  const now = new Date();
  const current = await db.authRateLimit.findUnique({ where: { subjectHash: key } });

  if (!current) {
    await db.authRateLimit.upsert({
      where: { subjectHash: key },
      create: { subjectHash: key, attempts: 1, windowStartedAt: now },
      update: { attempts: { increment: 1 } },
    });
  } else if (now.getTime() - current.windowStartedAt.getTime() >= WINDOW_MS) {
    await db.authRateLimit.update({
      where: { subjectHash: key },
      data: { attempts: 1, windowStartedAt: now, blockedUntil: null },
    });
  } else {
    await db.authRateLimit.update({
      where: { subjectHash: key },
      data: { attempts: { increment: 1 } },
    });
  }

  const updated = await db.authRateLimit.findUnique({ where: { subjectHash: key } });
  if (updated && updated.attempts >= MAX_FAILURES) {
    await db.authRateLimit.update({
      where: { subjectHash: key },
      data: { blockedUntil: new Date(now.getTime() + BLOCK_MS) },
    });
  }
}

export async function clearLoginFailures(email: string): Promise<void> {
  const key = subjectHash(email);
  await db.authRateLimit.updateMany({
    where: { subjectHash: key },
    data: { attempts: 0, blockedUntil: null, windowStartedAt: new Date() },
  });
}
