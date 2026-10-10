"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { isAuthEmailConfigured, sendAuthLink } from "@/lib/auth-email";
import { hashPassword } from "@/lib/password";
import { clearLoginFailures } from "@/lib/auth-rate-limit";
import { hashAuthToken, issueAuthToken, makeAuthLink, normalizeEmail } from "@/lib/auth-tokens";

const emailSchema = z.string().trim().email().max(254).transform(normalizeEmail);
const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: z.string().min(12).max(128),
});
const resetSchema = z.object({
  email: emailSchema,
  token: z.string().min(32).max(128),
  password: z.string().min(12).max(128),
});
const tokenSchema = z.object({ email: emailSchema, token: z.string().min(32).max(128) });

export async function loginAction(formData: FormData) {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(1).max(128).safeParse(formData.get("password"));
  if (!email.success || !password.success) redirect("/login?error=invalid");

  try {
    await signIn("credentials", {
      email: email.data,
      password: password.data,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=invalid");
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/register?error=invalid");
  if (process.env.NODE_ENV === "production" && !isAuthEmailConfigured()) {
    redirect("/register?error=email-config");
  }

  const { name, email, password } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    await db.user.create({ data: { name, email, passwordHash } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      redirect("/register?error=exists");
    }
    throw error;
  }

  if (isAuthEmailConfigured()) {
    const token = await issueAuthToken("verify", email);
    const link = makeAuthLink("/verify-email", email, token);
    await sendAuthLink(email, link, "verify");
    redirect("/register?status=check-email");
  }

  // Development can be exercised without an SMTP provider; production requires verification.
  if (process.env.NODE_ENV !== "production") {
    try {
      await signIn("credentials", { email, password, redirectTo: "/account" });
    } catch (error) {
      if (error instanceof AuthError) redirect("/login?error=invalid");
      throw error;
    }
  }
  redirect("/register?status=created");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/forgot-password?status=sent");
  if (!isAuthEmailConfigured()) redirect("/forgot-password?status=unavailable");

  const email = parsed.data;
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const token = await issueAuthToken("reset", email);
    const link = makeAuthLink("/reset-password", email, token);
    await sendAuthLink(email, link, "reset");
  }
  // Same response for present/missing emails to avoid account enumeration.
  redirect("/forgot-password?status=sent");
}

export async function verifyEmailAction(formData: FormData) {
  const parsed = tokenSchema.safeParse({ email: formData.get("email"), token: formData.get("token") });
  if (!parsed.success) redirect("/verify-email?error=invalid");
  const { email, token } = parsed.data;
  const hashed = hashAuthToken(token);
  const identifier = `verify:${email}`;

  try {
    await db.$transaction(async (tx) => {
      const record = await tx.verificationToken.findUnique({ where: { token: hashed } });
      if (!record || record.identifier !== identifier || record.expires <= new Date()) throw new Error("INVALID_TOKEN");
      await tx.user.update({ where: { email }, data: { emailVerified: new Date() } });
      await tx.verificationToken.delete({ where: { token: hashed } });
    });
  } catch {
    redirect("/verify-email?error=invalid");
  }
  redirect("/login?verified=1");
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/reset-password?error=invalid");
  const { email, token, password } = parsed.data;
  const hashed = hashAuthToken(token);
  const identifier = `reset:${email}`;
  const passwordHash = await hashPassword(password);

  try {
    await db.$transaction(async (tx) => {
      const record = await tx.verificationToken.findUnique({ where: { token: hashed } });
      if (!record || record.identifier !== identifier || record.expires <= new Date()) throw new Error("INVALID_TOKEN");
      await tx.user.update({ where: { email }, data: { passwordHash } });
      await tx.verificationToken.delete({ where: { token: hashed } });
    });
  } catch {
    redirect("/reset-password?error=invalid");
  }

  await clearLoginFailures(email);
  redirect("/login?reset=1");
}
