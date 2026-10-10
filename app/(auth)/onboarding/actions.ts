"use server";

import { ShopRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { invalidateTenantMappings } from "@/lib/tenant";
import { requireSignedInUser } from "@/lib/authz";
import { basicSettingsSchema, regionalSettingsSchema } from "@/lib/settings-schema";

export async function createShopAction(formData: FormData) {
  const user = await requireSignedInUser();
  const basic = basicSettingsSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    supportEmail: "",
  });
  const regional = regionalSettingsSchema.safeParse({
    currency: formData.get("currency"),
    locale: formData.get("locale"),
    timeZone: formData.get("timeZone"),
    calendar: "gregorian",
  });
  if (!basic.success || !regional.success) redirect("/onboarding?error=invalid");

  try {
    const shop = await db.$transaction(async (tx) => {
      const created = await tx.shop.create({
        data: {
          name: basic.data.name,
          slug: basic.data.slug,
          defaultCurrency: regional.data.currency,
          defaultLocale: regional.data.locale,
          timeZone: regional.data.timeZone,
        },
        select: { id: true, slug: true },
      });
      await tx.shopMembership.create({
        data: { shopId: created.id, userId: user.id, role: ShopRole.OWNER, acceptedAt: new Date() },
      });
      await tx.activityLog.create({
        data: { shopId: created.id, userId: user.id, action: "shop.created", entityType: "shop", entityId: created.id },
      });
      return created;
    });
    invalidateTenantMappings();
    redirect(`/dashboard/${shop.slug}/settings?created=1`);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      redirect("/onboarding?error=slug");
    }
    throw error;
  }
}
