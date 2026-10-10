import type { Metadata } from "next";
import Link from "next/link";
import { forgotPasswordAction } from "../actions";

export const metadata: Metadata = { title: "استعادة كلمة المرور | MultiStore", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <section className="auth-card" aria-labelledby="forgot-title">
      <Link className="auth-brand" href="/"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <h1 id="forgot-title">استعادة كلمة المرور</h1>
      <p className="auth-intro">أدخل بريد حسابك. إذا كان مسجلاً، سنرسل رابط إعادة التعيين عند تهيئة خدمة البريد.</p>
      {params.status === "sent" && <p className="auth-notice success" role="status">إذا كان البريد مرتبطاً بحساب، ستصلك تعليمات الاستعادة.</p>}
      {params.status === "unavailable" && <p className="auth-notice" role="status">إرسال البريد غير متاح حتى يضبط مسؤول المنصة SMTP. لم نكشف ما إذا كان البريد مسجلاً.</p>}
      <form className="auth-form" action={forgotPasswordAction}>
        <label className="auth-field" htmlFor="email">البريد الإلكتروني<input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <button className="auth-submit" type="submit">إرسال تعليمات الاستعادة</button>
      </form>
      <div className="auth-links"><Link href="/login">العودة إلى تسجيل الدخول</Link></div>
    </section>
  );
}
