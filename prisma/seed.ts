import { Prisma, PrismaClient, ProductStatus, ShopRole } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seed is disabled in production.");
  }

  if (process.env.ALLOW_DEMO_SEED !== "true") {
    console.info("Demo seed skipped. Set ALLOW_DEMO_SEED=true in a non-production environment to create sample data.");
    return;
  }

  const shop = await prisma.shop.upsert({
    where: { slug: "demo" },
    create: {
      name: "MultiStore Demo",
      slug: "demo",
      defaultLocale: "ar",
      defaultCurrency: "SAR",
      timeZone: "Asia/Riyadh",
    },
    update: {},
  });

  const category = await prisma.category.upsert({
    where: { shopId_slug: { shopId: shop.id, slug: "essentials" } },
    create: {
      shopId: shop.id,
      slug: "essentials",
      name: "منتجات أساسية — بيانات تجريبية",
    },
    update: {},
  });

  const product = await prisma.product.upsert({
    where: { shopId_slug: { shopId: shop.id, slug: "sample-product" } },
    create: {
      shopId: shop.id,
      slug: "sample-product",
      name: "منتج توضيحي",
      description: "سجل تجريبي محلي لا يمثل سعراً أو عرضاً حقيقياً.",
      status: ProductStatus.ACTIVE,
      basePrice: new Prisma.Decimal("120.00"),
      currency: "SAR",
      inventoryQuantity: 10,
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.productCategory.upsert({
    where: {
      shopId_productId_categoryId: {
        shopId: shop.id,
        productId: product.id,
        categoryId: category.id,
      },
    },
    create: { shopId: shop.id, productId: product.id, categoryId: category.id },
    update: {},
  });

  await prisma.productVariant.upsert({
    where: { shopId_sku: { shopId: shop.id, sku: "DEMO-SAMPLE-001" } },
    create: {
      shopId: shop.id,
      productId: product.id,
      sku: "DEMO-SAMPLE-001",
      name: "الخيار الافتراضي",
      price: new Prisma.Decimal("120.00"),
      inventoryQuantity: 10,
      isDefault: true,
    },
    update: {},
  });

  const demoEmail = process.env.DEMO_OWNER_EMAIL?.trim().toLowerCase();
  const demoPassword = process.env.DEMO_OWNER_PASSWORD;
  if (demoEmail || demoPassword) {
    if (!demoEmail || !demoEmail.includes("@") || !demoPassword || demoPassword.length < 12) {
      throw new Error("Set both DEMO_OWNER_EMAIL and a DEMO_OWNER_PASSWORD of at least 12 characters.");
    }
    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      create: { name: "مالك تجريبي", email: demoEmail, passwordHash: await hashPassword(demoPassword), emailVerified: new Date() },
      update: { passwordHash: await hashPassword(demoPassword), emailVerified: new Date() },
      select: { id: true },
    });
    await prisma.shopMembership.upsert({
      where: { shopId_userId: { shopId: shop.id, userId: user.id } },
      create: { shopId: shop.id, userId: user.id, role: ShopRole.OWNER, acceptedAt: new Date() },
      update: { role: ShopRole.OWNER, acceptedAt: new Date() },
    });
  }

  console.info(`Demo records are ready for shop '${shop.slug}'. They are sample data only.`);
}

main()
  .catch((error: unknown) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
