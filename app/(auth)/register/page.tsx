import type { Metadata } from "next";
import Link from "next/link";
import { registerAction } from "../actions";

export const metadata: Metadata = { title: "إنشاء حساب | MultiStore", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string; status?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = params.error === "exists"
    ? "يوجد حساب بهذا البريد. جرّب تسجيل الدخول أو استعادة كلمة المرور."
    : params.error === "email-config"
      ? "تسجيل الحسابات يتطلب إعداد خدمة البريد أولاً."
      : params.error
        ? "تحقق من الاسم والبريد وكلمة المرور (12 محرفاً على الأقل)."
        : null;
  const statusMessage = params.status === "check-email"
    ? "أرسلنا رابط التحقق إن كان مزود البريد مضبوطاً. افتح الرابط لتفعيل الحساب."
    : params.status === "created"
      ? "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن."
      : null;

  return (
    <section className="auth-card" aria-labelledby="register-title">
      <Link className="auth-brand" href="/" aria-label="MultiStore — الصفحة الرئيسية"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <h1 id="register-title">ابدأ حسابك</h1>
      <p className="auth-intro">أنشئ حساباً لإدارة متجرك من مساحة واحدة.</p>
      {errorMessage && <p className="auth-notice error" role="alert">{errorMessage}</p>}
      {statusMessage && <p className="auth-notice success" role="status">{statusMessage}</p>}
      <form className="auth-form" action={registerAction}>
        <label className="auth-field" htmlFor="name">الاسم<input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <label className="auth-field" htmlFor="email">البريد الإلكتروني<input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label className="auth-field" htmlFor="password">كلمة المرور<input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /><small>12 محرفاً على الأقل.</small></label>
        <button className="auth-submit" type="submit">إنشاء الحساب</button>
      </form>
      <div className="auth-links"><span>لديك حساب بالفعل؟</span><Link href="/login">تسجيل الدخول</Link></div>
    </section>
  );
}
