"use server";

import { PaymentMethod, Prisma, ShopRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireShopRoleBySlug } from "@/lib/authz";
import { invalidateTenantMappings } from "@/lib/tenant";
import {
  advancedSettingsSchema,
  basicSettingsSchema,
  brandSettingsSchema,
  contactSettingsSchema,
  paymentSettingsSchema,
  regionalSettingsSchema,
  seoSettingsSchema,
  shippingSettingsSchema,
  socialSettingsSchema,
  taxSettingsSchema,
} from "@/lib/settings-schema";

const paymentMethods: PaymentMethod[] = ["CASH_ON_DELIVERY", "BANK_TRANSFER", "STRIPE", "PAYPAL", "WALLET", "OTHER"];
const sections = new Set(["basic", "brand", "contact", "regional", "shipping", "payments", "tax", "social", "seo", "advanced"]);

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

async function saveJsonSetting(shopId: string, key: string, value: Record<string, string | number | boolean | null>) {
  const jsonValue = value as Prisma.InputJsonValue;
  await db.siteSetting.upsert({
    where: { shopId_key: { shopId, key } },
    create: { shopId, key, value: jsonValue },
    update: { value: jsonValue },
  });
}

export async function saveSettingsAction(formData: FormData) {
  const shopSlug = text(formData, "shopSlug").trim().toLowerCase();
  const section = text(formData, "section");
  if (!shopSlug || !sections.has(section)) redirect("/account");

  const { shop, user } = await requireShopRoleBySlug(shopSlug, [ShopRole.OWNER]);
  let destinationSlug = shop.slug;

  try {
    switch (section) {
      case "basic": {
        const parsed = basicSettingsSchema.parse({ name: text(formData, "name"), slug: text(formData, "slug"), supportEmail: text(formData, "supportEmail") });
        await db.shop.update({ where: { id: shop.id }, data: { name: parsed.name, slug: parsed.slug, supportEmail: parsed.supportEmail || null } });
        destinationSlug = parsed.slug;
        if (destinationSlug !== shop.slug) invalidateTenantMappings();
        break;
      }
      case "brand": {
        const parsed = brandSettingsSchema.parse({ primaryColor: text(formData, "primaryColor"), secondaryColor: text(formData, "secondaryColor"), fontFamily: text(formData, "fontFamily") });
        await saveJsonSetting(shop.id, "brand", parsed);
        break;
      }
      case "contact": {
        const parsed = contactSettingsSchema.parse({ phone: text(formData, "phone"), email: text(formData, "email"), address: text(formData, "address"), city: text(formData, "city"), country: text(formData, "country") });
        await saveJsonSetting(shop.id, "contact", parsed);
        break;
      }
      case "regional": {
        const parsed = regionalSettingsSchema.parse({ currency: text(formData, "currency"), locale: text(formData, "locale"), timeZone: text(formData, "timeZone"), calendar: text(formData, "calendar") });
        await db.$transaction([
          db.shop.update({ where: { id: shop.id }, data: { defaultCurrency: parsed.currency, defaultLocale: parsed.locale, timeZone: parsed.timeZone } }),
          db.siteSetting.upsert({ where: { shopId_key: { shopId: shop.id, key: "regional" } }, create: { shopId: shop.id, key: "regional", value: { calendar: parsed.calendar } }, update: { value: { calendar: parsed.calendar } } }),
        ]);
        break;
      }
      case "shipping": {
        const parsed = shippingSettingsSchema.parse({ zoneName: text(formData, "zoneName"), countryCodes: text(formData, "countryCodes"), rateName: text(formData, "rateName"), amount: text(formData, "amount"), currency: text(formData, "currency") });
        await db.$transaction(async (tx) => {
          const priorZone = await tx.shippingZone.findFirst({ where: { shopId: shop.id, name: parsed.zoneName }, select: { id: true } });
          const zone = priorZone
            ? await tx.shippingZone.update({ where: { shopId_id: { shopId: shop.id, id: priorZone.id } }, data: { countryCodes: parsed.countryCodes, isActive: true }, select: { id: true } })
            : await tx.shippingZone.create({ data: { shopId: shop.id, name: parsed.zoneName, countryCodes: parsed.countryCodes }, select: { id: true } });
          const priorRate = await tx.shippingRate.findFirst({ where: { shopId: shop.id, zoneId: zone.id, name: parsed.rateName }, select: { id: true } });
          const rateData = { name: parsed.rateName, amount: new Prisma.Decimal(parsed.amount), currency: parsed.currency, isActive: true };
          if (priorRate) await tx.shippingRate.update({ where: { id: priorRate.id }, data: rateData });
          else await tx.shippingRate.create({ data: { shopId: shop.id, zoneId: zone.id, ...rateData } });
        });
        break;
      }
      case "payments": {
        const parsed = paymentSettingsSchema.parse({ methods: formData.getAll("methods") });
        await db.$transaction(paymentMethods.map((method) => db.paymentMethodConfig.upsert({
          where: { shopId_method: { shopId: shop.id, method } },
          create: { shopId: shop.id, method, isEnabled: parsed.methods.includes(method) },
          update: { isEnabled: parsed.methods.includes(method) },
        })));
        break;
      }
      case "tax": {
        const parsed = taxSettingsSchema.parse({ name: text(formData, "name"), countryCode: text(formData, "countryCode"), ratePercent: text(formData, "ratePercent"), isInclusive: checked(formData, "isInclusive") });
        const rate = new Prisma.Decimal(parsed.ratePercent).div(100);
        const prior = await db.taxRule.findFirst({ where: { shopId: shop.id, name: parsed.name, countryCode: parsed.countryCode }, select: { id: true } });
        if (prior) await db.taxRule.update({ where: { id: prior.id }, data: { rate, isInclusive: parsed.isInclusive, isActive: true } });
        else await db.taxRule.create({ data: { shopId: shop.id, name: parsed.name, countryCode: parsed.countryCode, rate, isInclusive: parsed.isInclusive } });
        break;
      }
      case "social": {
        const parsed = socialSettingsSchema.parse({ instagram: text(formData, "instagram"), facebook: text(formData, "facebook"), tiktok: text(formData, "tiktok"), x: text(formData, "x") });
        await saveJsonSetting(shop.id, "social", parsed);
        break;
      }
      case "seo": {
        const parsed = seoSettingsSchema.parse({ title: text(formData, "title"), description: text(formData, "description"), keywords: text(formData, "keywords"), indexable: checked(formData, "indexable") });
        await saveJsonSetting(shop.id, "seo", parsed);
        break;
      }
      case "advanced": {
        const parsed = advancedSettingsSchema.parse({ customDomain: text(formData, "customDomain"), webhookUrl: text(formData, "webhookUrl"), apiAccessRequested: checked(formData, "apiAccessRequested") });
        await db.$transaction([
          db.shop.update({ where: { id: shop.id }, data: { customDomain: parsed.customDomain || null, ...(parsed.customDomain !== shop.customDomain ? { customDomainVerifiedAt: null } : {}) } }),
          db.siteSetting.upsert({ where: { shopId_key: { shopId: shop.id, key: "advanced" } }, create: { shopId: shop.id, key: "advanced", value: { webhookUrl: parsed.webhookUrl, apiAccessRequested: parsed.apiAccessRequested } }, update: { value: { webhookUrl: parsed.webhookUrl, apiAccessRequested: parsed.apiAccessRequested } } }),
        ]);
        invalidateTenantMappings();
        break;
      }
    }

    await db.activityLog.create({ data: { shopId: shop.id, userId: user.id, action: `settings.${section}.updated`, entityType: "shop_settings", metadata: { section } } });
  } catch (error) {
    if (error instanceof z.ZodError) redirect(`/dashboard/${shopSlug}/settings?error=invalid`);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") redirect(`/dashboard/${shopSlug}/settings?error=conflict`);
    throw error;
  }

  revalidatePath(`/dashboard/${destinationSlug}/settings`);
  redirect(`/dashboard/${destinationSlug}/settings?saved=${section}`);
}
