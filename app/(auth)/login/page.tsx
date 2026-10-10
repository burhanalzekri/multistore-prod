import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "تسجيل الدخول | MultiStore", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string; registered?: string; verified?: string; reset?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <section className="auth-card" aria-labelledby="login-title">
      <Link className="auth-brand" href="/" aria-label="MultiStore — الصفحة الرئيسية">
        <span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span>
      </Link>
      <h1 id="login-title">مرحباً بعودتك</h1>
      <p className="auth-intro">سجّل الدخول لمتابعة مساحة عملك ومتجرك.</p>
      {params.error && <p className="auth-notice error" role="alert">تعذر تسجيل الدخول. راجع البريد وكلمة المرور وحاول مجدداً.</p>}
      {params.registered && <p className="auth-notice success" role="status">تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.</p>}
      {params.verified && <p className="auth-notice success" role="status">تم تأكيد البريد الإلكتروني بنجاح.</p>}
      {params.reset && <p className="auth-notice success" role="status">تم تحديث كلمة المرور. سجّل الدخول بكلمتك الجديدة.</p>}
      <form className="auth-form" action={loginAction}>
        <label className="auth-field" htmlFor="email">البريد الإلكتروني<input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label className="auth-field" htmlFor="password">كلمة المرور<input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required /></label>
        <button className="auth-submit" type="submit">تسجيل الدخول</button>
      </form>
      <div className="auth-links"><Link href="/forgot-password">نسيت كلمة المرور؟</Link><Link href="/register">إنشاء حساب جديد</Link></div>
    </section>
  );
}
