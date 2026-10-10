import { z } from "zod";
import { resolveTenantHost } from "@/lib/tenant-host";

const reservedSlugs = new Set(["www", "admin", "api", "app", "auth", "docs", "status", "support", "mail", "static", "cdn", "assets"]);
const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const hexColor = /^#[0-9a-fA-F]{6}$/;
const optionalUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Enter a valid HTTPS URL.");

export const basicSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(slugPattern).refine((slug) => !reservedSlugs.has(slug)),
  supportEmail: z.union([z.literal(""), z.string().trim().email().max(254)]),
});

export const brandSettingsSchema = z.object({
  primaryColor: z.string().regex(hexColor),
  secondaryColor: z.string().regex(hexColor),
  fontFamily: z.enum(["IBM Plex Sans Arabic", "Arial", "system-ui"]),
});

export const contactSettingsSchema = z.object({
  phone: z.string().trim().max(30).regex(/^[+0-9() .-]*$/),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  address: z.string().trim().max(240),
  city: z.string().trim().max(100),
  country: z.string().trim().max(100),
});

export const regionalSettingsSchema = z.object({
  currency: z.enum(["SAR", "AED", "EGP", "USD", "EUR", "GBP"]),
  locale: z.enum(["ar", "en"]),
  timeZone: z.string().trim().min(1).max(80).refine((value) => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; }
  }),
  calendar: z.enum(["gregorian", "hijri"]),
});

export const shippingSettingsSchema = z.object({
  zoneName: z.string().trim().min(2).max(80),
  countryCodes: z.string().trim().max(300).transform((value) => value.split(/[\s,;]+/).filter(Boolean).map((code) => code.toUpperCase())).refine((codes) => codes.length > 0 && codes.length <= 30 && codes.every((code) => /^[A-Z]{2}$/.test(code))),
  rateName: z.string().trim().min(2).max(80),
  amount: z.coerce.number().finite().min(0).max(1_000_000),
  currency: z.enum(["SAR", "AED", "EGP", "USD", "EUR", "GBP"]),
});

export const paymentSettingsSchema = z.object({
  methods: z.array(z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "STRIPE", "PAYPAL", "WALLET", "OTHER"])).max(6),
});

export const taxSettingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  ratePercent: z.coerce.number().finite().min(0).max(100),
  isInclusive: z.boolean(),
});

export const socialSettingsSchema = z.object({
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  x: optionalUrl,
});

export const seoSettingsSchema = z.object({
  title: z.string().trim().max(60),
  description: z.string().trim().max(160),
  keywords: z.string().trim().max(255),
  indexable: z.boolean(),
});

export const advancedSettingsSchema = z.object({
  customDomain: z.string().trim().max(253).transform((value) => value.toLowerCase().replace(/\.$/, "")).refine((value) => {
    if (!value) return true;
    const host = resolveTenantHost(value, process.env.PLATFORM_ROOT_DOMAIN ?? "multistore.store");
    return host.kind === "custom-domain" && host.hostname === value;
  }),
  webhookUrl: optionalUrl,
  apiAccessRequested: z.boolean(),
});
