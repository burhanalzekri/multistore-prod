import { expect, test } from "bun:test";
import { categoryCreateSchema } from "../lib/category-schema.ts";

test("category schema accepts Arabic names with a normalized safe slug", () => {
  const parsed = categoryCreateSchema.safeParse({ name: "حقائب يومية", slug: "Daily-Bags", description: "منتجات يومية" });
  expect(parsed.success).toBe(true);
  if (parsed.success) expect(parsed.data.slug).toBe("daily-bags");
});

test("category schema rejects unsafe URL slugs and oversized fields", () => {
  expect(categoryCreateSchema.safeParse({ name: "فئة", slug: "Bad Slug", description: "" }).success).toBe(false);
  expect(categoryCreateSchema.safeParse({ name: "فئة", slug: "valid", description: "x".repeat(1001) }).success).toBe(false);
});
