"use server";

import { ShopRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireShopRoleBySlug } from "@/lib/authz";
import { categoryCreateSchema } from "@/lib/category-schema";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function ownerContext(formData: FormData) {
  const shopSlug = text(formData, "shopSlug").trim().toLowerCase();
  if (!shopSlug) redirect("/account");
  const context = await requireShopRoleBySlug(shopSlug, [ShopRole.OWNER]);
  return { ...context, shopSlug: context.shop.slug };
}

export async function createCategoryAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const parsed = categoryCreateSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
  });
  if (!parsed.success) redirect(`/dashboard/${shopSlug}/products?error=category-invalid`);

  try {
    const category = await db.category.create({
      data: {
        shopId: shop.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
      },
      select: { id: true },
    });
    await db.activityLog.create({
      data: { shopId: shop.id, userId: user.id, action: "category.created", entityType: "category", entityId: category.id },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      redirect(`/dashboard/${shopSlug}/products?error=category-conflict`);
    }
    throw error;
  }

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?categoryCreated=1`);
}

export async function updateCategoryAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const categoryId = text(formData, "categoryId").trim();
  if (!categoryId || categoryId.length > 60) redirect(`/dashboard/${shopSlug}/products?error=category-not-found`);
  const parsed = categoryCreateSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
  });
  if (!parsed.success) redirect(`/dashboard/${shopSlug}/products?error=category-invalid`);

  let updatedCount = 0;
  try {
    const result = await db.category.updateMany({
      where: { id: categoryId, shopId: shop.id },
      data: { name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description || null },
    });
    updatedCount = result.count;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      redirect(`/dashboard/${shopSlug}/products?error=category-conflict`);
    }
    throw error;
  }
  if (!updatedCount) redirect(`/dashboard/${shopSlug}/products?error=category-not-found`);
  await db.activityLog.create({
    data: { shopId: shop.id, userId: user.id, action: "category.updated", entityType: "category", entityId: categoryId },
  });

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?categoryUpdated=1`);
}

export async function setCategoryActiveAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const categoryId = text(formData, "categoryId").trim();
  const activeValue = text(formData, "isActive");
  if (!categoryId || categoryId.length > 60 || !["true", "false"].includes(activeValue)) {
    redirect(`/dashboard/${shopSlug}/products?error=category-not-found`);
  }

  const isActive = activeValue === "true";
  const result = await db.category.updateMany({ where: { id: categoryId, shopId: shop.id }, data: { isActive } });
  if (!result.count) redirect(`/dashboard/${shopSlug}/products?error=category-not-found`);
  await db.activityLog.create({
    data: { shopId: shop.id, userId: user.id, action: isActive ? "category.activated" : "category.archived", entityType: "category", entityId: categoryId },
  });

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?categoryStatus=1`);
}
