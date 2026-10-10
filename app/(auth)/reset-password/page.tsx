import type { Metadata } from "next";
import Link from "next/link";
import { resetPasswordAction } from "../actions";

export const metadata: Metadata = { title: "تعيين كلمة مرور جديدة | MultiStore", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ email?: string; token?: string; error?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const validLink = Boolean(params.email && params.token);
  return (
    <section className="auth-card" aria-labelledby="reset-title">
      <Link className="auth-brand" href="/"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <h1 id="reset-title">كلمة مرور جديدة</h1>
      <p className="auth-intro">اختر كلمة مرور جديدة لا تقل عن 12 محرفاً. رابط التعيين صالح لساعة ويُستخدم مرة واحدة.</p>
      {params.error && <p className="auth-notice error" role="alert">الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.</p>}
      {validLink ? (
        <form className="auth-form" action={resetPasswordAction}>
          <input type="hidden" name="email" value={params.email} />
          <input type="hidden" name="token" value={params.token} />
          <label className="auth-field" htmlFor="password">كلمة المرور الجديدة<input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
          <button className="auth-submit" type="submit">حفظ كلمة المرور</button>
        </form>
      ) : <p className="auth-notice">افتح الرابط المرسل إلى بريدك أو <Link href="/forgot-password">اطلب رابطاً جديداً</Link>.</p>}
    </section>
  );
}
