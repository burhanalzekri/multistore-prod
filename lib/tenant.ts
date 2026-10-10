import "server-only";

import { ShopStatus } from "@prisma/client";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { withTenantData, withTenantWhere } from "@/lib/tenant-scope";
import { resolveTenantHost } from "@/lib/tenant-host";

const tenantSelect = {
  id: true,
  slug: true,
  name: true,
  customDomain: true,
  defaultCurrency: true,
  defaultLocale: true,
  timeZone: true,
} as const;

const findActiveShopBySlug = unstable_cache(
  async (slug: string) =>
    db.shop.findFirst({
      where: { slug, status: ShopStatus.ACTIVE },
      select: tenantSelect,
    }),
  ["multistore-active-shop-by-slug-v1"],
  { revalidate: 300, tags: ["tenant-mappings"] },
);

const findVerifiedShopByDomain = unstable_cache(
  async (hostname: string) =>
    db.shop.findFirst({
      where: {
        customDomain: hostname,
        customDomainVerifiedAt: { not: null },
        status: ShopStatus.ACTIVE,
      },
      select: tenantSelect,
    }),
  ["multistore-verified-shop-by-domain-v1"],
  { revalidate: 300, tags: ["tenant-mappings"] },
);

/** Call after a shop's status, slug, or verified custom domain changes. */
export function invalidateTenantMappings() {
  revalidateTag("tenant-mappings");
}

export type TenantShop = NonNullable<Awaited<ReturnType<typeof findActiveShopBySlug>>>;

export type CurrentTenant =
  | { kind: "platform" }
  | { kind: "shop"; shop: TenantShop };

export class TenantNotFoundError extends Error {
  constructor() {
    super("No active shop is mapped to this host.");
    this.name = "TenantNotFoundError";
  }
}

export class ShopAccessDeniedError extends Error {
  constructor() {
    super("The user is not a member of the current shop.");
    this.name = "ShopAccessDeniedError";
  }
}

/**
 * Request-scoped resolver. Host and routing headers are injected by middleware;
 * every non-platform result is then confirmed against an active DB record.
 */
export const getCurrentTenant = cache(async (): Promise<CurrentTenant | null> => {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get("x-multistore-host");
  if (!hostname) return null;

  const resolution = resolveTenantHost(hostname, process.env.PLATFORM_ROOT_DOMAIN);
  if (resolution.kind === "invalid") return null;
  if (requestHeaders.get("x-multistore-tenant-kind") !== resolution.kind) return null;

  if (resolution.kind === "platform") return { kind: "platform" };

  if (resolution.kind === "subdomain") {
    if (requestHeaders.get("x-multistore-tenant-slug") !== resolution.slug) return null;
    const shop = await findActiveShopBySlug(resolution.slug);
    return shop ? { kind: "shop", shop } : null;
  }

  const shop = await findVerifiedShopByDomain(resolution.hostname);
  return shop ? { kind: "shop", shop } : null;
});

export async function requireCurrentTenant(): Promise<{ kind: "shop"; shop: TenantShop }> {
  const tenant = await getCurrentTenant();
  if (!tenant || tenant.kind !== "shop") throw new TenantNotFoundError();
  return tenant;
}

/** Check the signed-in user's membership against the host-resolved shop, never a client-supplied shop id. */
export async function requireCurrentShopMembership(userId: string) {
  const { shop } = await requireCurrentTenant();
  const membership = await db.shopMembership.findFirst({
    where: { shopId: shop.id, userId, acceptedAt: { not: null } },
    select: { id: true, shopId: true, userId: true, role: true, permissions: true },
  });
  if (!membership) throw new ShopAccessDeniedError();
  return membership;
}

/** Path-based fallback for the temporary preview; the shop slug is never sufficient without membership. */
export async function requireShopMembershipBySlug(userId: string, shopSlug: string) {
  const shop = await db.shop.findFirst({
    where: { slug: shopSlug, status: ShopStatus.ACTIVE },
    select: { ...tenantSelect, supportEmail: true, customDomainVerifiedAt: true },
  });
  if (!shop) throw new TenantNotFoundError();
  const membership = await db.shopMembership.findFirst({
    where: { shopId: shop.id, userId, acceptedAt: { not: null } },
    select: { id: true, shopId: true, userId: true, role: true, permissions: true },
  });
  if (!membership) throw new ShopAccessDeniedError();
  return { shop, membership };
}

export { withTenantData, withTenantWhere };
