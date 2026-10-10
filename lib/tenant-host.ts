export type TenantHostResolution =
  | { kind: "platform"; hostname: string }
  | { kind: "subdomain"; hostname: string; slug: string }
  | { kind: "custom-domain"; hostname: string }
  | { kind: "invalid"; hostname: null };

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "auth",
  "docs",
  "status",
  "support",
  "mail",
  "static",
  "cdn",
  "assets",
]);

const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;
const SHOP_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

/** Normalize a single Host value supplied by the platform proxy. */
export function normalizeHostname(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;

  let host = rawHost.trim().toLowerCase().split(",", 1)[0]?.trim() ?? "";
  if (!host) return null;

  if (host.startsWith("[")) {
    const closingBracket = host.indexOf("]");
    if (closingBracket < 0) return null;
    host = host.slice(1, closingBracket);
  } else {
    const firstColon = host.indexOf(":");
    const lastColon = host.lastIndexOf(":");
    if (firstColon >= 0 && firstColon === lastColon) host = host.slice(0, lastColon);
  }

  host = host.replace(/\.$/, "");
  if (host === "::1") return host;
  if (!host || !HOSTNAME_PATTERN.test(host)) return null;
  return host;
}

/**
 * Classify the request host. A subdomain is only a routing hint; database lookup
 * and shop status/domain verification remain authoritative in `lib/tenant.ts`.
 */
export function resolveTenantHost(
  rawHost: string | null | undefined,
  configuredRootDomain: string | null | undefined,
): TenantHostResolution {
  const hostname = normalizeHostname(rawHost);
  if (!hostname) return { kind: "invalid", hostname: null };

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "::1" ||
    IPV4_PATTERN.test(hostname)
  ) {
    return { kind: "platform", hostname };
  }

  const rootDomain = normalizeHostname(configuredRootDomain);
  if (rootDomain && hostname === rootDomain) return { kind: "platform", hostname };

  if (rootDomain && hostname.endsWith(`.${rootDomain}`)) {
    const prefix = hostname.slice(0, -(rootDomain.length + 1));
    if (prefix.includes(".")) return { kind: "invalid", hostname: null };
    if (RESERVED_SUBDOMAINS.has(prefix)) return { kind: "platform", hostname };
    if (!SHOP_SLUG_PATTERN.test(prefix)) return { kind: "invalid", hostname: null };
    return { kind: "subdomain", hostname, slug: prefix };
  }

  return { kind: "custom-domain", hostname };
}

const INTERNAL_TENANT_HEADERS = [
  "x-multistore-host",
  "x-multistore-tenant-kind",
  "x-multistore-tenant-slug",
] as const;

/** Copy request headers while replacing every internal tenant hint. */
export function buildTrustedTenantHeaders(
  incoming: Headers,
  resolution: Exclude<TenantHostResolution, { kind: "invalid" }>,
): Headers {
  const trusted = new Headers(incoming);
  for (const name of INTERNAL_TENANT_HEADERS) trusted.delete(name);

  trusted.set("x-multistore-host", resolution.hostname);
  trusted.set("x-multistore-tenant-kind", resolution.kind);
  if (resolution.kind === "subdomain") {
    trusted.set("x-multistore-tenant-slug", resolution.slug);
  }
  return trusted;
}
