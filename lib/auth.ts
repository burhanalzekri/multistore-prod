import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { GlobalRole } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearLoginFailures, isLoginRateLimited, recordLoginFailure } from "@/lib/auth-rate-limit";
import { verifyPassword } from "@/lib/password";

const credentialSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  jwt: { maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", newUser: "/register" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (await isLoginRateLimited(email)) return null;

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true, globalRole: true, emailVerified: true },
        });
        if (!user?.passwordHash || !user.email) {
          await recordLoginFailure(email);
          return null;
        }

        if (process.env.NODE_ENV === "production" && !user.emailVerified) return null;
        if (!(await verifyPassword(password, user.passwordHash))) {
          await recordLoginFailure(email);
          return null;
        }

        await clearLoginFailures(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          globalRole: user.globalRole ?? GlobalRole.USER,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.globalRole = user.globalRole;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.globalRole = (token.globalRole as GlobalRole | undefined) ?? GlobalRole.USER;
      }
      return session;
    },
  },
});
