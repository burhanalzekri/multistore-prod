import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopRole } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthorizationError, requireShopRoleBySlug } from "@/lib/authz";
import { ShopAccessDeniedError, TenantNotFoundError } from "@/lib/tenant";
import { createProductAction, setProductStatusAction, updateProductAction } from "./actions";
import { createCategoryAction, setCategoryActiveAction, updateCategoryAction } from "./category-actions";
import "./products.css";

export const metadata: Metadata = { title: "المنتجات | MultiStore", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const currencies = ["SAR", "AED", "EGP", "USD", "EUR", "GBP"] as const;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
    statusUpdated?: string;
    categoryCreated?: string;
    categoryUpdated?: string;
    categoryStatus?: string;
    error?: string;
  }>;
}) {
  const { shopSlug } = await params;
  let context;
  try {
    context = await requireShopRoleBySlug(shopSlug, [ShopRole.OWNER, ShopRole.STAFF]);
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ShopAccessDeniedError || error instanceof TenantNotFoundError) notFound();
    throw error;
  }

  const { shop, membership } = context;
  const query = await searchParams;
  const [products, categories, productCount, activeCount] = await Promise.all([
    db.product.findMany({
      where: { shopId: shop.id },
      orderBy: { updatedAt: "desc" },
      take: 24,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        basePrice: true,
        compareAtPrice: true,
        currency: true,
        inventoryQuantity: true,
        trackInventory: true,
        isFeatured: true,
        updatedAt: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { publicId: true, url: true, alt: true } },
        variants: { where: { isDefault: true }, take: 1, select: { sku: true } },
        categories: { select: { category: { select: { id: true, name: true } } } },
      },
    }),
    db.category.findMany({
      where: { shopId: shop.id },
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 100,
      select: { id: true, name: true, slug: true, description: true, isActive: true },
    }),
    db.product.count({ where: { shopId: shop.id } }),
    db.product.count({ where: { shopId: shop.id, status: "ACTIVE" } }),
  ]);

  const canEdit = membership.role === ShopRole.OWNER;
  const activeCategories = categories.filter((category) => category.isActive);
  const errorMessages: Record<string, string> = {
    invalid: "راجع الحقول؛ تأكد من صيغة المعرّف والسعر والمخزون ورابط HTTPS.",
    conflict: "معرّف المنتج أو SKU مستخدم في هذا المتجر بالفعل.",
    image: "تعذر رفع الصورة. ارفع JPEG أو PNG أو WebP أو AVIF صالحاً بحجم لا يتجاوز 5MB.",
    category: "الفئة المختارة غير موجودة أو غير متاحة في هذا المتجر.",
    "category-invalid": "أدخل اسم فئة ومعرّفاً صالحاً بالأحرف اللاتينية.",
    "category-conflict": "معرّف الفئة مستخدم مسبقاً في هذا المتجر.",
    "category-not-found": "الفئة غير موجودة ضمن هذا المتجر.",
    "product-not-found": "المنتج غير موجود ضمن هذا المتجر.",
  };

  return (
    <main className="products-page" dir="rtl">
      <div className="products-container">
        <header className="products-header">
          <Link className="products-brand" href="/"><span className="products-mark">M</span>MultiStore</Link>
          <nav><Link href={`/dashboard/${shop.slug}/settings`}>الإعدادات</Link><Link href="/account">الحساب</Link></nav>
        </header>

        <section className="products-hero">
          <div>
            <p className="products-kicker">لوحة المتجر · {membership.role === ShopRole.OWNER ? "المالك" : "الفريق"}</p>
            <h1>كتالوج <span>{shop.name}</span></h1>
            <p>أدر المنتجات والفئات ضمن مساحة متجرك.</p>
          </div>
          <div className="products-stats">
            <span><b>{productCount}</b><small>كل المنتجات</small></span>
            <span><b>{activeCount}</b><small>منشور</small></span>
            <span><b>{activeCategories.length}</b><small>فئة مفعّلة</small></span>
          </div>
        </section>

        {query.created && <p className="products-notice" role="status">أُنشئ المنتج كمسودة، ولم يُنشر للواجهة العامة.</p>}
        {query.updated && <p className="products-notice" role="status">حُفظت تعديلات المنتج.</p>}
        {query.statusUpdated && <p className="products-notice" role="status">تم تحديث حالة المنتج.</p>}
        {query.categoryCreated && <p className="products-notice" role="status">أُنشئت الفئة. يمكنك الآن ربط منتج جديد بها.</p>}
        {query.categoryUpdated && <p className="products-notice" role="status">حُفظت تعديلات الفئة.</p>}
        {query.categoryStatus && <p className="products-notice" role="status">تم تحديث حالة الفئة.</p>}
        {query.error && <p className="products-notice products-error" role="alert">{errorMessages[query.error] ?? "تعذر تنفيذ العملية."}</p>}
        {!canEdit && <p className="products-notice">لديك صلاحية عرض الكتالوج؛ إنشاء المنتجات والفئات وتعديلها متاح لمالك المتجر فقط.</p>}

        <div className="products-grid">
          <section className="products-panel products-list-panel">
            <div className="panel-heading"><div><h2>المنتجات</h2><p>آخر 24 منتجاً تم تحديثه</p></div><span className="panel-count">{productCount}</span></div>
            {products.length ? (
              <div className="product-list">
                {products.map((product) => {
                  const image = product.images[0];
                  const currentCategory = product.categories[0]?.category;
                  const currentCategoryIsInactive = currentCategory && !activeCategories.some((category) => category.id === currentCategory.id);
                  const nextStatus = product.status === "ACTIVE" ? "ARCHIVED" : product.status === "ARCHIVED" ? "DRAFT" : "ACTIVE";
                  const nextStatusLabel = product.status === "ACTIVE" ? "أرشفة" : product.status === "ARCHIVED" ? "إعادة كمسودة" : "نشر المنتج";

                  return (
                    <article className="product-management-card" key={product.id}>
                      <div className="product-row">
                        {image ? <Image className="product-thumb" src={image.url} alt={image.alt ?? product.name} width={68} height={68} sizes="68px" loading="lazy" unoptimized /> : <div className="product-thumb product-thumb-empty" aria-label="لا توجد صورة">M</div>}
                        <div className="product-details">
                          <h3>{product.name}</h3><p dir="ltr">/{product.slug}</p>
                          <div className="product-tags">{product.categories.map(({ category }) => <span key={category.id}>{category.name}</span>)}</div>
                        </div>
                        <div className="product-meta">
                          <b dir="ltr">{product.basePrice?.toString() ?? "—"} {product.currency}</b>
                          <span className={`product-status product-status-${product.status.toLowerCase()}`}>{product.status === "DRAFT" ? "مسودة" : product.status === "ACTIVE" ? "منشور" : "مؤرشف"}</span>
                          <small>{product.trackInventory ? `المخزون: ${product.inventoryQuantity}` : "المخزون غير متتبع"}</small>
                        </div>
                      </div>

                      {canEdit && <div className="product-management-actions">
                        <details className="management-details">
                          <summary>تعديل التفاصيل</summary>
                          <form action={updateProductAction} className="product-form management-form">
                            <input type="hidden" name="shopSlug" value={shop.slug} />
                            <input type="hidden" name="productId" value={product.id} />
                            <label>اسم المنتج<input name="name" required minLength={2} maxLength={160} defaultValue={product.name} /></label>
                            <label>معرّف URL<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={product.slug} /></label>
                            <label>الوصف<textarea name="description" maxLength={5000} rows={3} defaultValue={product.description ?? ""} /></label>
                            <div className="product-form-row">
                              <label>السعر<input name="basePrice" type="number" min="0" max="1000000000" step="0.01" required defaultValue={product.basePrice?.toString() ?? "0"} /></label>
                              <label>العملة<select name="currency" defaultValue={product.currency}>{currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></label>
                            </div>
                            <label>السعر قبل التخفيض<input name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={product.compareAtPrice?.toString() ?? ""} /></label>
                            <label>SKU<input name="sku" maxLength={80} dir="ltr" defaultValue={product.variants[0]?.sku ?? ""} /></label>
                            <div className="product-form-row">
                              <label>الكمية<input name="inventoryQuantity" type="number" min="0" max="1000000" step="1" defaultValue={product.inventoryQuantity} /></label>
                              <label>الفئة<select name="categoryId" defaultValue={currentCategory?.id ?? ""}>
                                <option value="">بلا فئة</option>
                                {currentCategoryIsInactive && <option value={currentCategory.id}>{currentCategory.name} — غير مفعّلة</option>}
                                {activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                              </select></label>
                            </div>
                            {image && <div className="current-image-row"><Image src={image.url} alt={image.alt ?? product.name} width={48} height={48} sizes="48px" unoptimized /><span>الصورة الحالية محفوظة ما لم تستبدلها أو تزلها.</span></div>}
                            <label>رفع صورة بديلة<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
                            <label>أو رابط صورة HTTPS<input name="imageUrl" type="url" maxLength={2048} dir="ltr" placeholder="https://…" defaultValue={image && !image.publicId ? image.url : ""} /></label>
                            <label>وصف الصورة<input name="imageAlt" maxLength={240} defaultValue={image?.alt ?? product.name} /></label>
                            {image && <label className="products-checkbox"><input type="checkbox" name="removeImage" /><span>إزالة الصورة الحالية عند الحفظ</span></label>}
                            <label className="products-checkbox"><input type="checkbox" name="trackInventory" defaultChecked={product.trackInventory} /><span>تتبع المخزون</span></label>
                            <label className="products-checkbox"><input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} /><span>منتج بارز</span></label>
                            <button className="products-button products-button-secondary" type="submit">حفظ تعديلات المنتج</button>
                          </form>
                        </details>
                        <form action={setProductStatusAction}>
                          <input type="hidden" name="shopSlug" value={shop.slug} />
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="status" value={nextStatus} />
                          <button className="management-status-button" type="submit">{nextStatusLabel}</button>
                        </form>
                      </div>}
                    </article>
                  );
                })}
              </div>
            ) : <div className="products-empty"><span>＋</span><h3>ابدأ بأول منتج</h3><p>سيظهر هنا بعد حفظه كمسودة.</p></div>}
          </section>

          <aside className="products-side">
            <section className="products-panel">
              <div className="panel-heading"><div><h2>الفئات</h2><p>أنشئ الفئات وعدّلها أو أوقفها مؤقتاً</p></div><span className="panel-count">{activeCategories.length}</span></div>
              {canEdit ? <>
                <form action={createCategoryAction} className="product-form">
                  <input type="hidden" name="shopSlug" value={shop.slug} />
                  <label>اسم الفئة<input name="name" required minLength={2} maxLength={100} placeholder="مثال: حقائب" /></label>
                  <label>المعرّف (لاتيني)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" placeholder="bags" /></label>
                  <label>وصف مختصر<textarea name="description" maxLength={1000} rows={2} /></label>
                  <button className="products-button products-button-secondary" type="submit">إنشاء فئة</button>
                </form>
                {categories.length > 0 && <div className="category-management-list">
                  {categories.map((category) => <details className={`category-management-item${category.isActive ? "" : " is-inactive"}`} key={category.id}>
                    <summary><span>{category.name}</span><small>{category.isActive ? "مفعّلة" : "متوقفة"}</small></summary>
                    <form action={updateCategoryAction} className="product-form management-form">
                      <input type="hidden" name="shopSlug" value={shop.slug} />
                      <input type="hidden" name="categoryId" value={category.id} />
                      <label>اسم الفئة<input name="name" required minLength={2} maxLength={100} defaultValue={category.name} /></label>
                      <label>المعرّف (لاتيني)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={category.slug} /></label>
                      <label>الوصف<textarea name="description" maxLength={1000} rows={2} defaultValue={category.description ?? ""} /></label>
                      <button className="products-button products-button-secondary" type="submit">حفظ الفئة</button>
                    </form>
                    <form action={setCategoryActiveAction} className="category-status-form">
                      <input type="hidden" name="shopSlug" value={shop.slug} />
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="isActive" value={category.isActive ? "false" : "true"} />
                      <button className="management-status-button" type="submit">{category.isActive ? "إيقاف الفئة مؤقتاً" : "إعادة تفعيل الفئة"}</button>
                    </form>
                  </details>)}
                </div>}
              </> : <p className="products-readonly">الفئات للعرض فقط.</p>}
            </section>

            {canEdit && <section className="products-panel">
              <div className="panel-heading"><div><h2>منتج جديد</h2><p>يُحفظ كمسودة حتى تراجعه وتنشره</p></div></div>
              <form action={createProductAction} className="product-form">
                <input type="hidden" name="shopSlug" value={shop.slug} />
                <label>اسم المنتج<input name="name" required minLength={2} maxLength={160} /></label>
                <label>معرّف URL<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" placeholder="everyday-bag" /></label>
                <label>الوصف<textarea name="description" maxLength={5000} rows={3} /></label>
                <div className="product-form-row"><label>السعر<input name="basePrice" type="number" min="0" max="1000000000" step="0.01" required /></label><label>العملة<select name="currency" defaultValue={shop.defaultCurrency}>{currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></label></div>
                <label>السعر قبل التخفيض (اختياري)<input name="compareAtPrice" type="number" min="0" step="0.01" /></label>
                <label>SKU / رمز المخزون<input name="sku" maxLength={80} dir="ltr" /></label>
                <div className="product-form-row"><label>الكمية الابتدائية<input name="inventoryQuantity" type="number" min="0" max="1000000" step="1" defaultValue="0" /></label><label>الفئة<select name="categoryId" defaultValue=""><option value="">بلا فئة</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
                <label>رفع صورة فعلية<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
                <label>أو رابط صورة HTTPS<input name="imageUrl" type="url" maxLength={2048} dir="ltr" placeholder="https://…" /></label>
                <label>وصف الصورة<input name="imageAlt" maxLength={240} placeholder="وصف موجز للصورة" /></label>
                <label className="products-checkbox"><input type="checkbox" name="trackInventory" defaultChecked /><span>تتبع المخزون</span></label>
                <label className="products-checkbox"><input type="checkbox" name="isFeatured" /><span>تمييز كمنتج بارز</span></label>
                <button className="products-button" type="submit">حفظ كمسودة</button>
                <p className="products-hint">ملفات الصور تُخزّن محلياً في مجلد خاص غير عام، وترتبط بسجل MediaAsset للمتجر. حد الملف 5MB. يمكن اختيار رابط HTTPS بدلاً منها.</p>
              </form>
            </section>}
          </aside>
        </div>
        <footer className="products-footer">عرض محدود إلى آخر 24 منتجاً · العملة الافتراضية لهذا المتجر: <b dir="ltr">{shop.defaultCurrency}</b></footer>
      </div>
    </main>
  );
}
