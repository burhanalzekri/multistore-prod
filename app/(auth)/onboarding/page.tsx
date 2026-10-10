import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createShopAction } from "./actions";

export const metadata: Metadata = { title: "إنشاء متجرك | MultiStore", robots: { index: false, follow: false } };

const timeZones = ["Asia/Riyadh", "Asia/Dubai", "Africa/Cairo", "UTC", "Europe/London", "America/New_York"];

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fonboarding");
  const { error } = await searchParams;

  return (
    <section className="auth-card auth-card-wide" aria-labelledby="onboarding-title">
      <Link className="auth-brand" href="/"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <p className="auth-eyebrow">إعداد مساحة عمل جديدة</p>
      <h1 id="onboarding-title">أنشئ متجرك</h1>
      <p className="auth-intro">ستكون مالك المتجر. يمكنك تعديل الإعدادات لاحقاً، ولن يتم تفعيل نطاق أو تكامل مدفوع تلقائياً.</p>
      {error && <p className="auth-message auth-message-error" role="alert">{error === "slug" ? "هذا المعرّف مستخدم أو محجوز. جرّب معرّفاً آخر." : "راجع الحقول المطلوبة وحاول مجدداً."}</p>}
      <form className="auth-form" action={createShopAction}>
        <label>اسم المتجر<input name="name" type="text" required minLength={2} maxLength={100} autoComplete="organization" /></label>
        <label>معرّف المتجر<input name="slug" type="text" required minLength={1} maxLength={63} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" autoCapitalize="none" autoComplete="off" /><small>أحرف لاتينية صغيرة وأرقام وشرطة فقط؛ سيُستخدم في رابط لوحة الإعدادات.</small></label>
        <div className="auth-form-row">
          <label>العملة<select name="currency" defaultValue="SAR"><option value="SAR">SAR — ريال سعودي</option><option value="AED">AED — درهم إماراتي</option><option value="EGP">EGP — جنيه مصري</option><option value="USD">USD — دولار أمريكي</option><option value="EUR">EUR — يورو</option><option value="GBP">GBP — جنيه إسترليني</option></select></label>
          <label>لغة المتجر<select name="locale" defaultValue="ar"><option value="ar">العربية</option><option value="en">English</option></select></label>
        </div>
        <label>المنطقة الزمنية<select name="timeZone" defaultValue="Asia/Riyadh">{timeZones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label>
        <button className="auth-submit" type="submit">إنشاء المتجر والمتابعة</button>
      </form>
      <p className="auth-footnote"><Link href="/account">العودة إلى الحساب</Link></p>
    </section>
  );
}
