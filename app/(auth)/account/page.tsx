import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "حسابك | MultiStore", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const roleLabel = session.user.globalRole === "SUPER_ADMIN" ? "مدير المنصة" : "مستخدم";
  return (
    <section className="auth-card" aria-labelledby="account-title">
      <Link className="auth-brand" href="/"><span className="auth-brand-mark" aria-hidden="true">M</span><span>MultiStore</span></Link>
      <h1 id="account-title">حسابك</h1>
      <p className="auth-intro">تم تسجيل الدخول. أنشئ متجرك أو تابع إعداداته من هنا.</p>
      <div className="auth-account-meta">
        <span><b>الاسم:</b> {session.user.name ?? "—"}</span>
        <span><b>البريد:</b> {session.user.email ?? "—"}</span>
        <span><b>الدور:</b> {roleLabel}</span>
      </div>
      <div className="auth-account-actions"><Link href="/onboarding">إنشاء متجر</Link><Link href="/">العودة إلى الموقع</Link><form action={logoutAction}><button className="auth-submit" type="submit">تسجيل الخروج</button></form></div>
    </section>
  );
}
