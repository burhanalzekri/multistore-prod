import nodemailer from "nodemailer";

export type AuthLinkKind = "verify" | "reset";

export function isAuthEmailConfigured(): boolean {
  return Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM);
}

export async function sendAuthLink(to: string, link: string, kind: AuthLinkKind): Promise<boolean> {
  const server = process.env.EMAIL_SERVER;
  const from = process.env.EMAIL_FROM;
  if (!server || !from) return false;

  const isVerification = kind === "verify";
  const subject = isVerification ? "تأكيد بريدك في MultiStore" : "إعادة تعيين كلمة المرور في MultiStore";
  const instruction = isVerification
    ? "لتأكيد بريدك الإلكتروني، افتح الرابط التالي خلال ساعة:"
    : "لإعادة تعيين كلمة المرور، افتح الرابط التالي خلال ساعة. إذا لم تطلب ذلك فتجاهل الرسالة:";

  const transporter = nodemailer.createTransport(server);
  await transporter.sendMail({
    from,
    to,
    subject,
    text: `${instruction}\n\n${link}\n\nإذا لم يعمل الرابط، انسخه والصقه في المتصفح.`,
  });
  return true;
}
