import { expect, test } from "bun:test";
import { advancedSettingsSchema, basicSettingsSchema, brandSettingsSchema, regionalSettingsSchema, shippingSettingsSchema, taxSettingsSchema } from "../lib/settings-schema.ts";

test("basic settings reject reserved slugs and accept normalized ordinary slugs", () => {
  expect(basicSettingsSchema.safeParse({ name: "متجر جميل", slug: "shop-1", supportEmail: "" }).success).toBe(true);
  expect(basicSettingsSchema.safeParse({ name: "متجر", slug: "admin", supportEmail: "" }).success).toBe(false);
});

test("brand colors require six-digit hex and a supported font", () => {
  expect(brandSettingsSchema.safeParse({ primaryColor: "#7c3aed", secondaryColor: "#38bdf8", fontFamily: "IBM Plex Sans Arabic" }).success).toBe(true);
  expect(brandSettingsSchema.safeParse({ primaryColor: "purple", secondaryColor: "#38bdf8", fontFamily: "Comic Sans" }).success).toBe(false);
});

test("regional and tax settings enforce valid timezones, currencies, and bounds", () => {
  expect(regionalSettingsSchema.safeParse({ currency: "SAR", locale: "ar", timeZone: "Asia/Riyadh", calendar: "hijri" }).success).toBe(true);
  expect(regionalSettingsSchema.safeParse({ currency: "BAD", locale: "ar", timeZone: "Not/AZone", calendar: "hijri" }).success).toBe(false);
  expect(taxSettingsSchema.safeParse({ name: "VAT", countryCode: "SA", ratePercent: 15, isInclusive: false }).success).toBe(true);
  expect(taxSettingsSchema.safeParse({ name: "VAT", countryCode: "SA", ratePercent: 150, isInclusive: false }).success).toBe(false);
});

test("shipping country list is normalized and unsafe domains/protocols are rejected", () => {
  const parsed = shippingSettingsSchema.safeParse({ zoneName: "Local", countryCodes: "sa, ae", rateName: "Standard", amount: "25", currency: "SAR" });
  expect(parsed.success).toBe(true);
  if (parsed.success) expect(parsed.data.countryCodes).toEqual(["SA", "AE"]);
  expect(advancedSettingsSchema.safeParse({ customDomain: "shop.example.com", webhookUrl: "http://example.com/hook", apiAccessRequested: false }).success).toBe(false);
  expect(advancedSettingsSchema.safeParse({ customDomain: "admin.multistore.store", webhookUrl: "", apiAccessRequested: false }).success).toBe(false);
});
