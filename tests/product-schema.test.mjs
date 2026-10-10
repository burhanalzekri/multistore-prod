import { expect, test } from "bun:test";
import { productCreateSchema } from "../lib/product-schema.ts";

const validProduct = {
  name: "حقيبة يومية",
  slug: "everyday-bag",
  description: "",
  basePrice: "120",
  compareAtPrice: "150",
  currency: "SAR",
  trackInventory: true,
  inventoryQuantity: "12",
  sku: "BAG-001",
  categoryId: "",
  imageUrl: "https://images.example.com/bag.webp",
  imageAlt: "حقيبة بلون بنفسجي",
  isFeatured: false,
};

test("product schema normalizes product fields and parses numeric form values", () => {
  const parsed = productCreateSchema.safeParse(validProduct);
  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data.basePrice).toBe(120);
    expect(parsed.data.compareAtPrice).toBe(150);
    expect(parsed.data.sku).toBe("BAG-001");
    expect(parsed.data.categoryId).toBeNull();
  }
});

test("product schema rejects unsafe image protocols, invalid slugs, and negative stock", () => {
  expect(productCreateSchema.safeParse({ ...validProduct, imageUrl: "http://images.example.com/bag.jpg" }).success).toBe(false);
  expect(productCreateSchema.safeParse({ ...validProduct, slug: "Bag With Spaces" }).success).toBe(false);
  expect(productCreateSchema.safeParse({ ...validProduct, inventoryQuantity: "-4" }).success).toBe(false);
});

test("compare-at price cannot be lower than the actual price", () => {
  expect(productCreateSchema.safeParse({ ...validProduct, compareAtPrice: "110" }).success).toBe(false);
});
