-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ShopRole" AS ENUM ('OWNER', 'STAFF');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL', 'WALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "FlashSaleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'REDEEM', 'ADJUST', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "custom_domain" TEXT,
    "custom_domain_verified_at" TIMESTAMP(3),
    "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "default_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "default_locale" TEXT NOT NULL DEFAULT 'en',
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "logo_url" TEXT,
    "support_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password_hash" TEXT,
    "global_role" "GlobalRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "shop_memberships" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ShopRole" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "invited_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "base_price" DECIMAL(12,2),
    "compare_at_price" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" VARCHAR(320),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "compare_at_price" DECIMAL(12,2),
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "weight_grams" INTEGER,
    "options" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "public_id" TEXT,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("shop_id","product_id","category_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "accepts_email" BOOLEAN NOT NULL DEFAULT false,
    "accepts_sms" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT,
    "recipient" TEXT NOT NULL,
    "phone" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "postal_code" TEXT,
    "country_code" VARCHAR(2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "minimum_order_amount" DECIMAL(12,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "per_customer_limit" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_sales" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "FlashSaleStatus" NOT NULL DEFAULT 'DRAFT',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_sale_items" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "flash_sale_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "discount_pct" DECIMAL(5,2),
    "sale_price" DECIMAL(12,2),

    CONSTRAINT "flash_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "coupon_id" TEXT,
    "order_number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_method" "PaymentMethod",
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "shipping_address" JSONB,
    "billing_address" JSONB,
    "customer_note" TEXT,
    "internal_note" TEXT,
    "placed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "variant_id" TEXT,
    "product_name" TEXT NOT NULL,
    "variant_name" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT,
    "type" "LoyaltyTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "visitor_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "shop_id" TEXT NOT NULL,
    "wishlist_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("shop_id","wishlist_id","product_id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "provider" TEXT,
    "provider_message_id" TEXT,
    "status" "SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "error_code" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "audience" JSONB,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "ip_hash" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthly_price" DECIMAL(12,2),
    "annual_price" DECIMAL(12,2),
    "currency" VARCHAR(3),
    "limits" JSONB,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "provider" TEXT,
    "provider_customer_id" TEXT,
    "provider_subscription_id" TEXT,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "minimum_order" DECIMAL(12,2),
    "maximum_order" DECIMAL(12,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_code" VARCHAR(2) NOT NULL,
    "region_code" TEXT,
    "rate" DECIMAL(7,4) NOT NULL,
    "is_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_configs" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "title" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "public_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL DEFAULT 'image',
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "signing_secret_encrypted" TEXT,
    "event_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth_secret_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "shops_custom_domain_key" ON "shops"("custom_domain");

-- CreateIndex
CREATE INDEX "shops_status_created_at_idx" ON "shops"("status", "created_at");

-- CreateIndex
CREATE INDEX "shops_created_at_idx" ON "shops"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_idx" ON "sessions"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "shop_memberships_user_id_created_at_idx" ON "shop_memberships"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "shop_memberships_shop_id_role_created_at_idx" ON "shop_memberships"("shop_id", "role", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "shop_memberships_shop_id_user_id_key" ON "shop_memberships"("shop_id", "user_id");

-- CreateIndex
CREATE INDEX "products_shop_id_status_created_at_idx" ON "products"("shop_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "products_shop_id_is_featured_status_idx" ON "products"("shop_id", "is_featured", "status");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_id_key" ON "products"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_slug_key" ON "products"("shop_id", "slug");

-- CreateIndex
CREATE INDEX "product_variants_shop_id_product_id_idx" ON "product_variants"("shop_id", "product_id");

-- CreateIndex
CREATE INDEX "product_variants_created_at_idx" ON "product_variants"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_shop_id_id_key" ON "product_variants"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_shop_id_sku_key" ON "product_variants"("shop_id", "sku");

-- CreateIndex
CREATE INDEX "product_images_shop_id_product_id_position_idx" ON "product_images"("shop_id", "product_id", "position");

-- CreateIndex
CREATE INDEX "product_images_created_at_idx" ON "product_images"("created_at");

-- CreateIndex
CREATE INDEX "categories_shop_id_is_active_sort_order_idx" ON "categories"("shop_id", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "categories_shop_id_parent_id_idx" ON "categories"("shop_id", "parent_id");

-- CreateIndex
CREATE INDEX "categories_created_at_idx" ON "categories"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shop_id_id_key" ON "categories"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shop_id_slug_key" ON "categories"("shop_id", "slug");

-- CreateIndex
CREATE INDEX "product_categories_shop_id_category_id_product_id_idx" ON "product_categories"("shop_id", "category_id", "product_id");

-- CreateIndex
CREATE INDEX "product_categories_created_at_idx" ON "product_categories"("created_at");

-- CreateIndex
CREATE INDEX "customers_shop_id_phone_idx" ON "customers"("shop_id", "phone");

-- CreateIndex
CREATE INDEX "customers_shop_id_created_at_idx" ON "customers"("shop_id", "created_at");

-- CreateIndex
CREATE INDEX "customers_created_at_idx" ON "customers"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_id_key" ON "customers"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_email_key" ON "customers"("shop_id", "email");

-- CreateIndex
CREATE INDEX "customer_addresses_shop_id_customer_id_is_default_idx" ON "customer_addresses"("shop_id", "customer_id", "is_default");

-- CreateIndex
CREATE INDEX "customer_addresses_created_at_idx" ON "customer_addresses"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "customer_addresses_shop_id_id_key" ON "customer_addresses"("shop_id", "id");

-- CreateIndex
CREATE INDEX "coupons_shop_id_is_active_starts_at_ends_at_idx" ON "coupons"("shop_id", "is_active", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "coupons_created_at_idx" ON "coupons"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_shop_id_id_key" ON "coupons"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_shop_id_code_key" ON "coupons"("shop_id", "code");

-- CreateIndex
CREATE INDEX "flash_sales_shop_id_status_starts_at_ends_at_idx" ON "flash_sales"("shop_id", "status", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "flash_sales_created_at_idx" ON "flash_sales"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "flash_sales_shop_id_id_key" ON "flash_sales"("shop_id", "id");

-- CreateIndex
CREATE INDEX "flash_sale_items_shop_id_product_id_idx" ON "flash_sale_items"("shop_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "flash_sale_items_shop_id_flash_sale_id_product_id_key" ON "flash_sale_items"("shop_id", "flash_sale_id", "product_id");

-- CreateIndex
CREATE INDEX "orders_shop_id_status_created_at_idx" ON "orders"("shop_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "orders_shop_id_payment_status_created_at_idx" ON "orders"("shop_id", "payment_status", "created_at");

-- CreateIndex
CREATE INDEX "orders_shop_id_customer_id_created_at_idx" ON "orders"("shop_id", "customer_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_shop_id_placed_at_idx" ON "orders"("shop_id", "placed_at");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shop_id_id_key" ON "orders"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shop_id_order_number_key" ON "orders"("shop_id", "order_number");

-- CreateIndex
CREATE INDEX "order_items_shop_id_order_id_idx" ON "order_items"("shop_id", "order_id");

-- CreateIndex
CREATE INDEX "order_items_shop_id_product_id_idx" ON "order_items"("shop_id", "product_id");

-- CreateIndex
CREATE INDEX "order_items_created_at_idx" ON "order_items"("created_at");

-- CreateIndex
CREATE INDEX "order_status_history_shop_id_order_id_created_at_idx" ON "order_status_history"("shop_id", "order_id", "created_at");

-- CreateIndex
CREATE INDEX "order_status_history_actor_user_id_created_at_idx" ON "order_status_history"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "loyalty_transactions_shop_id_customer_id_created_at_idx" ON "loyalty_transactions"("shop_id", "customer_id", "created_at");

-- CreateIndex
CREATE INDEX "loyalty_transactions_shop_id_order_id_idx" ON "loyalty_transactions"("shop_id", "order_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_expires_at_idx" ON "loyalty_transactions"("expires_at");

-- CreateIndex
CREATE INDEX "reviews_shop_id_product_id_status_created_at_idx" ON "reviews"("shop_id", "product_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "reviews_shop_id_customer_id_created_at_idx" ON "reviews"("shop_id", "customer_id", "created_at");

-- CreateIndex
CREATE INDEX "wishlists_shop_id_created_at_idx" ON "wishlists"("shop_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_shop_id_id_key" ON "wishlists"("shop_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_shop_id_customer_id_key" ON "wishlists"("shop_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_shop_id_visitor_token_key" ON "wishlists"("shop_id", "visitor_token");

-- CreateIndex
CREATE INDEX "wishlist_items_shop_id_product_id_idx" ON "wishlist_items"("shop_id", "product_id");

-- CreateIndex
CREATE INDEX "sms_logs_shop_id_status_created_at_idx" ON "sms_logs"("shop_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "sms_logs_shop_id_recipient_created_at_idx" ON "sms_logs"("shop_id", "recipient", "created_at");

-- CreateIndex
CREATE INDEX "email_campaigns_shop_id_status_scheduled_at_idx" ON "email_campaigns"("shop_id", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "email_campaigns_shop_id_created_at_idx" ON "email_campaigns"("shop_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_shop_id_created_at_idx" ON "activity_logs"("shop_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "site_settings_shop_id_updated_at_idx" ON "site_settings"("shop_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_shop_id_key_key" ON "site_settings"("shop_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE INDEX "plans_is_active_sort_order_idx" ON "plans"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_subscription_id_key" ON "subscriptions"("provider_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_shop_id_status_current_period_end_idx" ON "subscriptions"("shop_id", "status", "current_period_end");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_status_idx" ON "subscriptions"("plan_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions"("created_at");

-- CreateIndex
CREATE INDEX "shipping_zones_shop_id_is_active_idx" ON "shipping_zones"("shop_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_zones_shop_id_id_key" ON "shipping_zones"("shop_id", "id");

-- CreateIndex
CREATE INDEX "shipping_rates_shop_id_zone_id_is_active_idx" ON "shipping_rates"("shop_id", "zone_id", "is_active");

-- CreateIndex
CREATE INDEX "tax_rules_shop_id_country_code_region_code_is_active_idx" ON "tax_rules"("shop_id", "country_code", "region_code", "is_active");

-- CreateIndex
CREATE INDEX "payment_method_configs_shop_id_is_enabled_idx" ON "payment_method_configs"("shop_id", "is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_configs_shop_id_method_key" ON "payment_method_configs"("shop_id", "method");

-- CreateIndex
CREATE INDEX "media_assets_shop_id_created_at_idx" ON "media_assets"("shop_id", "created_at");

-- CreateIndex
CREATE INDEX "media_assets_uploaded_by_id_created_at_idx" ON "media_assets"("uploaded_by_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_shop_id_public_id_key" ON "media_assets"("shop_id", "public_id");

-- CreateIndex
CREATE INDEX "webhook_endpoints_shop_id_is_active_idx" ON "webhook_endpoints"("shop_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_shop_id_revoked_at_created_at_idx" ON "api_keys"("shop_id", "revoked_at", "created_at");

-- CreateIndex
CREATE INDEX "api_keys_created_by_id_idx" ON "api_keys"("created_by_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_shop_id_customer_id_idx" ON "push_subscriptions"("shop_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_shop_id_endpoint_key" ON "push_subscriptions"("shop_id", "endpoint");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_memberships" ADD CONSTRAINT "shop_memberships_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_memberships" ADD CONSTRAINT "shop_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shop_id_parent_id_fkey" FOREIGN KEY ("shop_id", "parent_id") REFERENCES "categories"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_shop_id_category_id_fkey" FOREIGN KEY ("shop_id", "category_id") REFERENCES "categories"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sale_items" ADD CONSTRAINT "flash_sale_items_shop_id_flash_sale_id_fkey" FOREIGN KEY ("shop_id", "flash_sale_id") REFERENCES "flash_sales"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sale_items" ADD CONSTRAINT "flash_sale_items_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sale_items" ADD CONSTRAINT "flash_sale_items_shop_id_variant_id_fkey" FOREIGN KEY ("shop_id", "variant_id") REFERENCES "product_variants"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_coupon_id_fkey" FOREIGN KEY ("shop_id", "coupon_id") REFERENCES "coupons"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_shop_id_order_id_fkey" FOREIGN KEY ("shop_id", "order_id") REFERENCES "orders"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_shop_id_variant_id_fkey" FOREIGN KEY ("shop_id", "variant_id") REFERENCES "product_variants"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_shop_id_order_id_fkey" FOREIGN KEY ("shop_id", "order_id") REFERENCES "orders"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_shop_id_wishlist_id_fkey" FOREIGN KEY ("shop_id", "wishlist_id") REFERENCES "wishlists"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_shop_id_product_id_fkey" FOREIGN KEY ("shop_id", "product_id") REFERENCES "products"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shop_id_zone_id_fkey" FOREIGN KEY ("shop_id", "zone_id") REFERENCES "shipping_zones"("shop_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_method_configs" ADD CONSTRAINT "payment_method_configs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_shop_id_customer_id_fkey" FOREIGN KEY ("shop_id", "customer_id") REFERENCES "customers"("shop_id", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

