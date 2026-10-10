import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailAction } from "../actions";

export const metadata: Metadata = { title: "تأكيد البريد الإلكتروني | MultiStore", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ email?: string; token?: string; error?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const validLink = Boolean(params.email && params.token);
  return (
    <section className="auth-card" aria-labelledby="verify-title">
      <Link className="auth-brand" href="/"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <h1 id="verify-title">تأكيد بريدك الإلكتروني</h1>
      <p className="auth-intro">التأكيد يحمي حسابك ويساعد على استعادة الوصول إليه لاحقاً.</p>
      {params.error && <p className="auth-notice error" role="alert">الرابط غير صالح أو انتهت صلاحيته. اطلب إرسال رابط جديد.</p>}
      {validLink ? (
        <form className="auth-form" action={verifyEmailAction}>
          <input type="hidden" name="email" value={params.email} />
          <input type="hidden" name="token" value={params.token} />
          <button className="auth-submit" type="submit">تأكيد البريد</button>
        </form>
      ) : <p className="auth-notice">افتح رابط التحقق المرسل إلى بريدك الإلكتروني.</p>}
      <div className="auth-links"><Link href="/login">تسجيل الدخول</Link></div>
    </section>
  );
}
