import type { DefaultSession } from "next-auth";
import type { GlobalRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    globalRole: GlobalRole;
  }

  interface Session {
    user: {
      id: string;
      globalRole: GlobalRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    globalRole?: GlobalRole;
  }
}
