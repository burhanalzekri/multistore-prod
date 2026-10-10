"use server";

import { Prisma, ProductStatus, ShopRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireShopRoleBySlug } from "@/lib/authz";
import { productCreateSchema } from "@/lib/product-schema";
import {
  MediaUploadError,
  persistImageUpload,
  removeStoredImage,
  removeStoredImageById,
  type StoredImage,
} from "@/lib/media-storage";

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

function uploadFrom(formData: FormData): File | null {
  const value = formData.get("imageFile");
  return typeof File !== "undefined" && value instanceof File && value.size > 0 ? value : null;
}

function productInput(formData: FormData) {
  return {
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    basePrice: text(formData, "basePrice"),
    compareAtPrice: text(formData, "compareAtPrice"),
    currency: text(formData, "currency"),
    trackInventory: formData.get("trackInventory") === "on",
    inventoryQuantity: text(formData, "inventoryQuantity"),
    sku: text(formData, "sku"),
    categoryId: text(formData, "categoryId"),
    imageUrl: text(formData, "imageUrl"),
    imageAlt: text(formData, "imageAlt"),
    isFeatured: formData.get("isFeatured") === "on",
  };
}

export async function createProductAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const parsed = productCreateSchema.safeParse(productInput(formData));
  if (!parsed.success) redirect(`/dashboard/${shopSlug}/products?error=invalid`);

  const uploadFile = uploadFrom(formData);
  let storedImage: StoredImage | null = null;
  try {
    if (uploadFile) storedImage = await persistImageUpload(uploadFile, shop.id, shop.slug);
    await db.$transaction(async (tx) => {
      if (parsed.data.categoryId) {
        const category = await tx.category.findFirst({
          where: { id: parsed.data.categoryId, shopId: shop.id, isActive: true },
          select: { id: true },
        });
        if (!category) throw new Error("INVALID_CATEGORY");
      }

      const product = await tx.product.create({
        data: {
          shopId: shop.id,
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
          status: ProductStatus.DRAFT,
          basePrice: new Prisma.Decimal(parsed.data.basePrice),
          compareAtPrice: parsed.data.compareAtPrice === undefined ? null : new Prisma.Decimal(parsed.data.compareAtPrice),
          currency: parsed.data.currency,
          trackInventory: parsed.data.trackInventory,
          inventoryQuantity: parsed.data.trackInventory ? parsed.data.inventoryQuantity : 0,
          isFeatured: parsed.data.isFeatured,
        },
        select: { id: true },
      });

      await tx.productVariant.create({
        data: {
          shopId: shop.id,
          productId: product.id,
          sku: parsed.data.sku,
          name: "النسخة الافتراضية",
          price: new Prisma.Decimal(parsed.data.basePrice),
          compareAtPrice: parsed.data.compareAtPrice === undefined ? null : new Prisma.Decimal(parsed.data.compareAtPrice),
          inventoryQuantity: parsed.data.trackInventory ? parsed.data.inventoryQuantity : 0,
          isDefault: true,
        },
      });

      if (parsed.data.categoryId) {
        await tx.productCategory.create({ data: { shopId: shop.id, productId: product.id, categoryId: parsed.data.categoryId } });
      }
      if (storedImage) {
        const alt = parsed.data.imageAlt || parsed.data.name;
        await tx.mediaAsset.create({
          data: { shopId: shop.id, uploadedById: user.id, publicId: storedImage.publicId, url: storedImage.url, format: storedImage.format, bytes: storedImage.bytes, alt },
        });
        await tx.productImage.create({ data: { shopId: shop.id, productId: product.id, publicId: storedImage.publicId, url: storedImage.url, alt, position: 0 } });
      } else if (parsed.data.imageUrl) {
        await tx.productImage.create({ data: { shopId: shop.id, productId: product.id, url: parsed.data.imageUrl, alt: parsed.data.imageAlt || parsed.data.name, position: 0 } });
      }

      await tx.activityLog.create({
        data: { shopId: shop.id, userId: user.id, action: "product.created", entityType: "product", entityId: product.id },
      });
    });
  } catch (error) {
    if (storedImage) await removeStoredImage(storedImage.storagePath).catch(() => undefined);
    if (error instanceof MediaUploadError) redirect(`/dashboard/${shopSlug}/products?error=image`);
    if (error instanceof Error && error.message === "INVALID_CATEGORY") redirect(`/dashboard/${shopSlug}/products?error=category`);
    if (error instanceof z.ZodError) redirect(`/dashboard/${shopSlug}/products?error=invalid`);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") redirect(`/dashboard/${shopSlug}/products?error=conflict`);
    throw error;
  }

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?created=1`);
}

export async function updateProductAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const productId = text(formData, "productId").trim();
  if (!productId || productId.length > 60) redirect(`/dashboard/${shopSlug}/products?error=product-not-found`);

  const parsed = productCreateSchema.safeParse(productInput(formData));
  if (!parsed.success) redirect(`/dashboard/${shopSlug}/products?error=invalid`);

  const existing = await db.product.findFirst({
    where: { id: productId, shopId: shop.id },
    select: { id: true },
  });
  if (!existing) redirect(`/dashboard/${shopSlug}/products?error=product-not-found`);

  const uploadFile = uploadFrom(formData);
  const removeImage = formData.get("removeImage") === "on";
  let storedImage: StoredImage | null = null;
  let replacedPublicIds: string[] = [];
  try {
    if (uploadFile) storedImage = await persistImageUpload(uploadFile, shop.id, shop.slug);

    replacedPublicIds = await db.$transaction(async (tx) => {
      if (parsed.data.categoryId) {
        const category = await tx.category.findFirst({
          where: { id: parsed.data.categoryId, shopId: shop.id, isActive: true },
          select: { id: true },
        });
        if (!category) throw new Error("INVALID_CATEGORY");
      }

      await tx.product.update({
        where: { shopId_id: { shopId: shop.id, id: productId } },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
          basePrice: new Prisma.Decimal(parsed.data.basePrice),
          compareAtPrice: parsed.data.compareAtPrice === undefined ? null : new Prisma.Decimal(parsed.data.compareAtPrice),
          currency: parsed.data.currency,
          trackInventory: parsed.data.trackInventory,
          inventoryQuantity: parsed.data.trackInventory ? parsed.data.inventoryQuantity : 0,
          isFeatured: parsed.data.isFeatured,
        },
      });

      const defaultVariant = await tx.productVariant.findFirst({
        where: { shopId: shop.id, productId, isDefault: true },
        select: { id: true },
      });
      if (defaultVariant) {
        await tx.productVariant.updateMany({
          where: { id: defaultVariant.id, shopId: shop.id, productId },
          data: {
            sku: parsed.data.sku,
            price: new Prisma.Decimal(parsed.data.basePrice),
            compareAtPrice: parsed.data.compareAtPrice === undefined ? null : new Prisma.Decimal(parsed.data.compareAtPrice),
            inventoryQuantity: parsed.data.trackInventory ? parsed.data.inventoryQuantity : 0,
          },
        });
      }

      await tx.productCategory.deleteMany({ where: { shopId: shop.id, productId } });
      if (parsed.data.categoryId) {
        await tx.productCategory.create({ data: { shopId: shop.id, productId, categoryId: parsed.data.categoryId } });
      }

      const shouldReplaceImage = Boolean(storedImage) || Boolean(parsed.data.imageUrl) || removeImage;
      let oldIds: string[] = [];
      if (shouldReplaceImage) {
        const oldImages = await tx.productImage.findMany({ where: { shopId: shop.id, productId }, select: { publicId: true } });
        await tx.productImage.deleteMany({ where: { shopId: shop.id, productId } });
        oldIds = [...new Set(oldImages.flatMap((image) => image.publicId ? [image.publicId] : []))];
        for (const publicId of oldIds) {
          const references = await tx.productImage.count({ where: { shopId: shop.id, publicId } });
          if (!references) await tx.mediaAsset.deleteMany({ where: { shopId: shop.id, publicId } });
        }

        if (storedImage) {
          const alt = parsed.data.imageAlt || parsed.data.name;
          await tx.mediaAsset.create({
            data: { shopId: shop.id, uploadedById: user.id, publicId: storedImage.publicId, url: storedImage.url, format: storedImage.format, bytes: storedImage.bytes, alt },
          });
          await tx.productImage.create({ data: { shopId: shop.id, productId, publicId: storedImage.publicId, url: storedImage.url, alt, position: 0 } });
        } else if (parsed.data.imageUrl) {
          await tx.productImage.create({ data: { shopId: shop.id, productId, url: parsed.data.imageUrl, alt: parsed.data.imageAlt || parsed.data.name, position: 0 } });
        }
      }

      await tx.activityLog.create({
        data: { shopId: shop.id, userId: user.id, action: "product.updated", entityType: "product", entityId: productId },
      });
      return oldIds;
    });

  } catch (error) {
    if (storedImage) await removeStoredImage(storedImage.storagePath).catch(() => undefined);
    if (error instanceof MediaUploadError) redirect(`/dashboard/${shopSlug}/products?error=image`);
    if (error instanceof Error && error.message === "INVALID_CATEGORY") redirect(`/dashboard/${shopSlug}/products?error=category`);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") redirect(`/dashboard/${shopSlug}/products?error=conflict`);
    throw error;
  }

  for (const publicId of replacedPublicIds) {
    const references = await db.productImage.count({ where: { shopId: shop.id, publicId } }).catch(() => 1);
    if (!references) await removeStoredImageById(shop.id, publicId).catch(() => undefined);
  }

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?updated=1`);
}

export async function setProductStatusAction(formData: FormData) {
  const { shop, user, shopSlug } = await ownerContext(formData);
  const productId = text(formData, "productId").trim();
  const status = text(formData, "status");
  const parsedStatus = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).safeParse(status);
  if (!productId || productId.length > 60 || !parsedStatus.success) redirect(`/dashboard/${shopSlug}/products?error=product-not-found`);

  const result = await db.product.updateMany({
    where: { id: productId, shopId: shop.id },
    data: {
      status: parsedStatus.data,
      ...(parsedStatus.data === ProductStatus.ACTIVE ? { publishedAt: new Date() } : {}),
      ...(parsedStatus.data === ProductStatus.DRAFT ? { publishedAt: null } : {}),
    },
  });
  if (!result.count) redirect(`/dashboard/${shopSlug}/products?error=product-not-found`);
  await db.activityLog.create({
    data: { shopId: shop.id, userId: user.id, action: `product.status.${parsedStatus.data.toLowerCase()}`, entityType: "product", entityId: productId },
  });

  revalidatePath(`/dashboard/${shopSlug}/products`);
  redirect(`/dashboard/${shopSlug}/products?statusUpdated=1`);
}
