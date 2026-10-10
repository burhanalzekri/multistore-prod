import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const optionalAmount = z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.number().finite().min(0).max(1_000_000_000).optional());
const optionalHttpsUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "رابط الصورة يجب أن يستخدم HTTPS.");

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().min(1).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000),
  basePrice: z.coerce.number().finite().min(0).max(1_000_000_000),
  compareAtPrice: optionalAmount,
  currency: z.enum(["SAR", "AED", "EGP", "USD", "EUR", "GBP"]),
  trackInventory: z.boolean(),
  inventoryQuantity: z.coerce.number().int().min(0).max(1_000_000),
  sku: optionalText(80),
  categoryId: z.string().trim().max(60).transform((value) => value || null),
  imageUrl: optionalHttpsUrl,
  imageAlt: z.string().trim().max(240),
  isFeatured: z.boolean(),
}).superRefine((product, context) => {
  if (product.compareAtPrice !== undefined && product.compareAtPrice < product.basePrice) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["compareAtPrice"], message: "السعر قبل التخفيض يجب ألا يقل عن السعر الحالي." });
  }
});
