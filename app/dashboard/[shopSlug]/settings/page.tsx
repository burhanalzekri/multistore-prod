import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, ShopRole } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthorizationError, requireShopRoleBySlug } from "@/lib/authz";
import { ShopAccessDeniedError, TenantNotFoundError } from "@/lib/tenant";
import { saveSettingsAction } from "./actions";
import "./settings.css";

export const metadata: Metadata = { title: "إعدادات المتجر | MultiStore", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function record(value: Prisma.JsonValue | undefined): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function stringValue(values: Record<string, unknown>, key: string, fallback = ""): string {
  const value = values[key];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : fallback;
}
function boolValue(values: Record<string, unknown>, key: string, fallback = false): boolean {
  return typeof values[key] === "boolean" ? values[key] as boolean : fallback;
}
function Field({ label, name, value = "", type = "text", hint, dir }: { label: string; name: string; value?: string; type?: string; hint?: string; dir?: "ltr" | "rtl" }) {
  return <label className="settings-field"><span>{label}</span><input name={name} type={type} defaultValue={value} dir={dir} />{hint && <small>{hint}</small>}</label>;
}
function SelectField({ label, name, value, options }: { label: string; name: string; value: string; options: Array<[string, string]> }) {
  return <label className="settings-field"><span>{label}</span><select name={name} defaultValue={value}>{options.map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>;
}
function FormShell({ shopSlug, section, children }: { shopSlug: string; section: string; children: ReactNode }) {
  return <form action={saveSettingsAction} className="settings-form"><input type="hidden" name="shopSlug" value={shopSlug} /><input type="hidden" name="section" value={section} />{children}<button className="settings-save" type="submit">حفظ القسم</button></form>;
}

export default async function ShopSettingsPage({ params, searchParams }: { params: Promise<{ shopSlug: string }>; searchParams: Promise<{ saved?: string; error?: string; created?: string }> }) {
  const { shopSlug } = await params;
  let context;
  try {
    context = await requireShopRoleBySlug(shopSlug, [ShopRole.OWNER]);
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ShopAccessDeniedError || error instanceof TenantNotFoundError) notFound();
    throw error;
  }
  const { shop } = context;
  const query = await searchParams;
  const [settingRows, zones, paymentConfigs, taxes] = await Promise.all([
    db.siteSetting.findMany({ where: { shopId: shop.id }, select: { key: true, value: true } }),
    db.shippingZone.findMany({ where: { shopId: shop.id, isActive: true }, include: { rates: { where: { isActive: true }, take: 1 } }, take: 1 }),
    db.paymentMethodConfig.findMany({ where: { shopId: shop.id }, select: { method: true, isEnabled: true } }),
    db.taxRule.findMany({ where: { shopId: shop.id, isActive: true }, orderBy: { priority: "desc" }, take: 1 }),
  ]);
  const settings = new Map(settingRows.map((row) => [row.key, record(row.value)]));
  const brand = settings.get("brand") ?? {};
  const contact = settings.get("contact") ?? {};
  const regional = settings.get("regional") ?? {};
  const social = settings.get("social") ?? {};
  const seo = settings.get("seo") ?? {};
  const advanced = settings.get("advanced") ?? {};
  const zone = zones[0];
  const rate = zone?.rates[0];
  const tax = taxes[0];
  const enabledPayments = new Set(paymentConfigs.filter((item) => item.isEnabled).map((item) => item.method));
  const successLabels: Record<string, string> = { basic: "حُفظت المعلومات الأساسية.", brand: "حُفظت الهوية البصرية.", contact: "حُفظت معلومات التواصل.", regional: "حُفظت الإعدادات الإقليمية.", shipping: "حُفظت إعدادات الشحن.", payments: "حُفظت طرق الدفع المختارة.", tax: "حُفظت قاعدة الضريبة.", social: "حُفظت روابط التواصل الاجتماعي.", seo: "حُفظت إعدادات SEO.", advanced: "حُفظت إعدادات النطاق المتقدمة." };

  return (
    <main className="settings-page" dir="rtl">
      <div className="settings-container">
        <header className="settings-header">
          <Link className="settings-brand" href="/"><span className="settings-mark">M</span><span>MultiStore</span></Link>
          <nav aria-label="تنقل الحساب"><Link href="/account">الحساب</Link><Link href="/onboarding">متجر جديد</Link></nav>
        </header>
        <section className="settings-hero">
          <div><p className="settings-kicker">لوحة المتجر · المالك</p><h1>إعدادات <span>{shop.name}</span></h1><p>كل تعديل محفوظ داخل مساحة هذا المتجر فقط.</p></div>
          <span className="settings-shop-slug" dir="ltr">/{shop.slug}</span>
        </section>
        {query.created && <p className="settings-notice" role="status">تم إنشاء متجرك. أكمل الأقسام التي تريد ضبطها الآن.</p>}
        {query.saved && <p className="settings-notice" role="status">{successLabels[query.saved] ?? "تم الحفظ."}</p>}
        {query.error && <p className="settings-notice settings-notice-error" role="alert">{query.error === "conflict" ? "القيمة مستخدمة من متجر آخر. تحقق من المعرّف أو النطاق." : "تعذر حفظ الإعدادات؛ تحقق من القيم المدخلة."}</p>}
        <div className="settings-layout">
          <aside className="settings-nav" aria-label="أقسام الإعدادات">
            <p>الأقسام</p>
            <a href="#basic">01 · المعلومات الأساسية</a><a href="#brand">02 · الهوية البصرية</a><a href="#contact">03 · التواصل</a><a href="#regional">04 · الإعدادات الإقليمية</a><a href="#shipping">05 · الشحن</a><a href="#payments">06 · الدفع</a><a href="#tax">07 · الضرائب</a><a href="#social">08 · التواصل الاجتماعي</a><a href="#seo">09 · SEO</a><a href="#advanced">10 · متقدم</a>
          </aside>
          <div className="settings-sections">
            <details className="settings-card" id="basic" open>
              <summary><span className="settings-number">01</span><span><b>المعلومات الأساسية</b><small>اسم المتجر ومعرّفه وبريد الدعم</small></span></summary>
              <FormShell shopSlug={shop.slug} section="basic"><div className="settings-fields"><Field label="اسم المتجر" name="name" value={shop.name} /><Field label="معرّف المتجر" name="slug" value={shop.slug} dir="ltr" hint="تغيير المعرّف يغيّر مسار لوحة المتجر." /><Field label="بريد الدعم" name="supportEmail" type="email" value={shop.supportEmail ?? ""} dir="ltr" /></div></FormShell>
            </details>
            <details className="settings-card" id="brand">
              <summary><span className="settings-number">02</span><span><b>الهوية البصرية</b><small>ألوان العلامة والخط المعروض</small></span></summary>
              <FormShell shopSlug={shop.slug} section="brand"><div className="settings-fields"><Field label="اللون الأساسي" name="primaryColor" type="color" value={stringValue(brand, "primaryColor", "#7c3aed")} /><Field label="اللون الثانوي" name="secondaryColor" type="color" value={stringValue(brand, "secondaryColor", "#38bdf8")} /><SelectField label="عائلة الخط" name="fontFamily" value={stringValue(brand, "fontFamily", "IBM Plex Sans Arabic")} options={[["IBM Plex Sans Arabic", "IBM Plex Sans Arabic"], ["Arial", "Arial"], ["system-ui", "خط النظام"]]} /></div></FormShell>
            </details>
            <details className="settings-card" id="contact">
              <summary><span className="settings-number">03</span><span><b>التواصل</b><small>هاتف المتجر وعنوانه وبريده</small></span></summary>
              <FormShell shopSlug={shop.slug} section="contact"><div className="settings-fields"><Field label="الهاتف" name="phone" value={stringValue(contact, "phone")} dir="ltr" /><Field label="البريد" name="email" type="email" value={stringValue(contact, "email")} dir="ltr" /><Field label="العنوان" name="address" value={stringValue(contact, "address")} /><Field label="المدينة" name="city" value={stringValue(contact, "city")} /><Field label="الدولة" name="country" value={stringValue(contact, "country")} /></div></FormShell>
            </details>
            <details className="settings-card" id="regional">
              <summary><span className="settings-number">04</span><span><b>الإعدادات الإقليمية</b><small>العملة واللغة والتوقيت والتقويم</small></span></summary>
              <FormShell shopSlug={shop.slug} section="regional"><div className="settings-fields"><SelectField label="العملة" name="currency" value={shop.defaultCurrency} options={[["SAR", "SAR — ريال سعودي"], ["AED", "AED — درهم إماراتي"], ["EGP", "EGP — جنيه مصري"], ["USD", "USD — دولار أمريكي"], ["EUR", "EUR — يورو"], ["GBP", "GBP — جنيه إسترليني"]]} /><SelectField label="اللغة" name="locale" value={shop.defaultLocale} options={[["ar", "العربية"], ["en", "English"]]} /><Field label="المنطقة الزمنية" name="timeZone" value={shop.timeZone} dir="ltr" /><SelectField label="التقويم" name="calendar" value={stringValue(regional, "calendar", "gregorian")} options={[["gregorian", "ميلادي"], ["hijri", "هجري"]]} /></div></FormShell>
            </details>
            <details className="settings-card" id="shipping">
              <summary><span className="settings-number">05</span><span><b>الشحن</b><small>منطقة واحدة وسعر قياسي قابلان للتعديل</small></span></summary>
              <FormShell shopSlug={shop.slug} section="shipping"><div className="settings-fields"><Field label="اسم المنطقة" name="zoneName" value={zone?.name ?? "المنطقة الرئيسية"} /><Field label="رموز الدول (ISO)" name="countryCodes" value={zone?.countryCodes.join(", ") ?? "SA, AE"} dir="ltr" hint="مثال: SA, AE — حتى 30 دولة." /><Field label="طريقة الشحن" name="rateName" value={rate?.name ?? "الشحن القياسي"} /><Field label="السعر" name="amount" type="number" value={rate?.amount.toString() ?? "25"} /><SelectField label="عملة سعر الشحن" name="currency" value={rate?.currency ?? shop.defaultCurrency} options={[["SAR", "SAR"], ["AED", "AED"], ["EGP", "EGP"], ["USD", "USD"], ["EUR", "EUR"], ["GBP", "GBP"]]} /></div><p className="settings-hint">هذه المرحلة تحفظ منطقة وسعراً أساسياً؛ واجهة إدارة المناطق المتعددة تُستكمل مع دورة الطلبات.</p></FormShell>
            </details>
            <details className="settings-card" id="payments">
              <summary><span className="settings-number">06</span><span><b>الدفع</b><small>اختيار الوسائل التي ينوي المتجر تفعيلها</small></span></summary>
              <FormShell shopSlug={shop.slug} section="payments"><div className="settings-checks">{([["CASH_ON_DELIVERY", "الدفع عند الاستلام"], ["BANK_TRANSFER", "تحويل بنكي"], ["STRIPE", "Stripe"], ["PAYPAL", "PayPal"], ["WALLET", "محافظ رقمية"], ["OTHER", "وسيلة أخرى"]] as const).map(([method, label]) => <label className="settings-check" key={method}><input type="checkbox" name="methods" value={method} defaultChecked={enabledPayments.has(method)} /><span>{label}</span></label>)}</div><p className="settings-hint">يُحفظ الاختيار فقط؛ بيانات الاعتماد السرية لا تدخل إعدادات المتجر ولا تُفعّل المدفوعات في المعاينة.</p></FormShell>
            </details>
            <details className="settings-card" id="tax">
              <summary><span className="settings-number">07</span><span><b>الضرائب</b><small>قاعدة ضريبية حسب الدولة والنسبة</small></span></summary>
              <FormShell shopSlug={shop.slug} section="tax"><div className="settings-fields"><Field label="اسم القاعدة" name="name" value={tax?.name ?? "VAT"} /><Field label="رمز الدولة" name="countryCode" value={tax?.countryCode ?? "SA"} dir="ltr" /><Field label="النسبة المئوية" name="ratePercent" type="number" value={tax ? String(tax.rate.toNumber() * 100) : "15"} /><label className="settings-check"><input type="checkbox" name="isInclusive" defaultChecked={tax?.isInclusive ?? false} /><span>السعر يشمل الضريبة</span></label></div></FormShell>
            </details>
            <details className="settings-card" id="social">
              <summary><span className="settings-number">08</span><span><b>التواصل الاجتماعي</b><small>روابط الحسابات العامة للمتجر</small></span></summary>
              <FormShell shopSlug={shop.slug} section="social"><div className="settings-fields"><Field label="Instagram" name="instagram" value={stringValue(social, "instagram")} dir="ltr" /><Field label="Facebook" name="facebook" value={stringValue(social, "facebook")} dir="ltr" /><Field label="TikTok" name="tiktok" value={stringValue(social, "tiktok")} dir="ltr" /><Field label="X" name="x" value={stringValue(social, "x")} dir="ltr" /></div></FormShell>
            </details>
            <details className="settings-card" id="seo">
              <summary><span className="settings-number">09</span><span><b>SEO</b><small>عنوان ووصف وظهور المتجر في الفهرسة</small></span></summary>
              <FormShell shopSlug={shop.slug} section="seo"><div className="settings-fields"><Field label="عنوان الصفحة (60 حرفاً)" name="title" value={stringValue(seo, "title")} /><label className="settings-field settings-field-wide"><span>الوصف (160 حرفاً)</span><textarea name="description" rows={3} maxLength={160} defaultValue={stringValue(seo, "description")} /></label><Field label="كلمات مفتاحية" name="keywords" value={stringValue(seo, "keywords")} /><label className="settings-check"><input type="checkbox" name="indexable" defaultChecked={boolValue(seo, "indexable")} /><span>السماح بفهرسة المتجر عند نشره</span></label></div></FormShell>
            </details>
            <details className="settings-card" id="advanced">
              <summary><span className="settings-number">10</span><span><b>متقدم</b><small>نطاق مخصص ومسودات webhook وAPI</small></span></summary>
              <FormShell shopSlug={shop.slug} section="advanced"><div className="settings-fields"><Field label="النطاق المخصص" name="customDomain" value={shop.customDomain ?? ""} dir="ltr" hint={shop.customDomainVerifiedAt ? "النطاق موثق." : "يُحفظ كطلب فقط؛ لن يعمل قبل تحقق DNS في مرحلة النشر."} /><Field label="عنوان webhook (مسودة HTTPS)" name="webhookUrl" value={stringValue(advanced, "webhookUrl")} dir="ltr" hint="لا يتم استدعاؤه أو تفعيل إرسال أحداث في هذه المرحلة." /><label className="settings-check"><input type="checkbox" name="apiAccessRequested" defaultChecked={boolValue(advanced, "apiAccessRequested")} /><span>طلب تفعيل API عند تجهيز مفاتيح الوصول</span></label></div><p className="settings-hint">لن تُخزن مفاتيح سرية هنا. إصدار مفاتيح API وإدارة webhook الفعلية يتطلبان ضوابط المرحلة 7/12.</p></FormShell>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
