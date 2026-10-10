# مراجع المرحلة الرابعة — Auth.js

تاريخ المراجعة: 2026-10-09. الاعتماديات المنفذة: `next-auth@5.0.0-beta.32` و`@prisma/client@6.19.3`.

## مراجع رسمية

- Credentials Provider: https://authjs.dev/getting-started/providers/credentials — مزود Credentials يستدعي `authorize` للتحقق من بيانات الاعتماد، لكنه لا يحفظ مستخدميه في قاعدة البيانات بنفسه؛ لهذا يسجل التطبيق المستخدمين ويبحث عن كلمة المرور المحمية في PostgreSQL. يذكر التوثيق مسؤولية كشف الإساءة وتحديد المعدل وإدارة كلمة المرور عند بناء نظام كلمات مرور خاص.
- RBAC: https://authjs.dev/guides/role-based-access-control — يمكن تمرير الدور إلى JWT/session callbacks، مع استخدام `auth()` على الخادم لاتخاذ قرارات الوصول. Claims الجلسة لا تُعد مصدراً دائماً للحقيقة بعد تغيير الصلاحيات.
- Prisma Adapter: https://authjs.dev/getting-started/adapters/prisma — مخطط User/Account/Session/VerificationToken القياسي واسماء أعمدة Auth.js محفوظة. جلسة Credentials في هذا المشروع JWT؛ لم يُربط PrismaAdapter بمزود Credentials لأن المستخدم يُنشأ ويُقرأ صراحةً من التطبيق.
- Session strategies: https://authjs.dev/concepts/session-strategies — JWT في Cookie مشفر وHttpOnly لا يحتاج lookup لكل طلب لكنه لا يُلغى فوراً قبل انتهاء صلاحيته؛ لذلك حد عمر الجلسة هنا 8 ساعات، وتُعاد قراءة GlobalRole من DB في حاجز super_admin.

## قرارات التنفيذ

كلمات المرور تُخزن scrypt مع salt فريد وذاكرة/كلفة ثابتة، لا بصيغة نصية. روابط التحقق/الاستعادة عالية العشوائية، لا تُخزن إلا بصمة SHA-256، وتستهلك مرة واحدة خلال ساعة. Rate-limit محاولات الدخول يستخدم HMAC لبريد الحساب بدلاً من تخزينه في جدول الحدود. الأدوار الحساسة تُفحص server-side من قاعدة البيانات؛ دور المتجر يؤخذ من العضوية المرتبطة بالمضيف الموثوق. إرسال البريد لا يعمل إلا عند ضبط `EMAIL_SERVER` و`EMAIL_FROM`، ولا تُرسل هذه البيئة حالياً أي رسالة.
