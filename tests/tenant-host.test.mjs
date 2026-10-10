import { expect, test } from "bun:test";
import { buildTrustedTenantHeaders, normalizeHostname, resolveTenantHost } from "../lib/tenant-host.ts";
import { withTenantData, withTenantWhere } from "../lib/tenant-scope.ts";

test("normalizes case, a trailing dot, and an optional port", () => {
  expect(normalizeHostname(" Shop-1.MultiStore.Store.:3000 ")).toBe("shop-1.multistore.store");
});

test("routes a shop subdomain as a hint, not as an authorization decision", () => {
  expect(resolveTenantHost("north.multistore.store", "multistore.store")).toEqual({
    kind: "subdomain",
    hostname: "north.multistore.store",
    slug: "north",
  });
});

test("keeps the root and reserved platform subdomains out of tenant routing", () => {
  expect(resolveTenantHost("multistore.store", "multistore.store").kind).toBe("platform");
  expect(resolveTenantHost("admin.multistore.store", "multistore.store").kind).toBe("platform");
  expect(resolveTenantHost("www.multistore.store", "multistore.store").kind).toBe("platform");
});

test("accepts a single-level custom hostname for verified database lookup", () => {
  expect(resolveTenantHost("shop.example.org", "multistore.store")).toEqual({
    kind: "custom-domain",
    hostname: "shop.example.org",
  });
});

test("rejects malformed hosts and nested platform subdomains", () => {
  expect(resolveTenantHost("north.eu.multistore.store", "multistore.store").kind).toBe("invalid");
  expect(resolveTenantHost("bad host.example.org", "multistore.store").kind).toBe("invalid");
  expect(resolveTenantHost("-bad.multistore.store", "multistore.store").kind).toBe("invalid");
});

test("treats local development hosts as platform requests", () => {
  expect(resolveTenantHost("localhost:3000", "multistore.store").kind).toBe("platform");
  expect(resolveTenantHost("127.0.0.1:3000", "multistore.store").kind).toBe("platform");
  expect(resolveTenantHost("[::1]:3000", "multistore.store").kind).toBe("platform");
});

test("trusted tenant scope overrides a client-supplied shop id", () => {
  expect(withTenantWhere({ shopId: "shop-a" }, { shopId: "shop-b", status: "ACTIVE" })).toEqual({
    shopId: "shop-a",
    status: "ACTIVE",
  });
  expect(withTenantData({ shopId: "shop-a" }, { shopId: "shop-b", name: "item" })).toEqual({
    shopId: "shop-a",
    name: "item",
  });
});

test("trusted routing headers overwrite forged client tenant hints", () => {
  const incoming = new Headers({
    "x-multistore-host": "victim.example.org",
    "x-multistore-tenant-kind": "subdomain",
    "x-multistore-tenant-slug": "victim",
    "x-request-id": "preserved",
  });
  const trusted = buildTrustedTenantHeaders(incoming, {
    kind: "subdomain",
    hostname: "north.multistore.store",
    slug: "north",
  });

  expect(trusted.get("x-multistore-host")).toBe("north.multistore.store");
  expect(trusted.get("x-multistore-tenant-slug")).toBe("north");
  expect(trusted.get("x-request-id")).toBe("preserved");
});
