import { GlobalRole, ShopRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireCurrentShopMembership, requireShopMembershipBySlug } from "@/lib/tenant";

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireSignedInUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Re-read the role from PostgreSQL so a stale JWT cannot retain admin access. */
export async function requireSuperAdmin() {
  const sessionUser = await requireSignedInUser();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, globalRole: true },
  });
  if (!user || user.globalRole !== GlobalRole.SUPER_ADMIN) throw new AuthorizationError();
  return user;
}

export async function requireCurrentShopRole(allowedRoles: readonly ShopRole[]) {
  const sessionUser = await requireSignedInUser();
  const membership = await requireCurrentShopMembership(sessionUser.id);
  if (!allowedRoles.includes(membership.role)) throw new AuthorizationError();
  return membership;
}

export async function requireShopRoleBySlug(shopSlug: string, allowedRoles: readonly ShopRole[]) {
  const sessionUser = await requireSignedInUser();
  const context = await requireShopMembershipBySlug(sessionUser.id, shopSlug);
  if (!allowedRoles.includes(context.membership.role)) throw new AuthorizationError();
  return { ...context, user: sessionUser };
}
