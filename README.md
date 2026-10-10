# MultiStore

منصة SaaS متعددة المتاجر لإنشاء وإدارة المتاجر الإلكترونية. الواجهة العربية للمرحلة الأولى ثابتة بصرياً كخط أساس. المراحل 1–5 مكتملة محلياً، والجزء المطلوب من المرحلة 6 (إدارة المنتجات والفئات ورفع الصور المحلي) منفذ ومختبر. راجع [`docs/ROADMAP.md`](docs/ROADMAP.md) و[`docs/DELIVERY-PHASE-1-6.md`](docs/DELIVERY-PHASE-1-6.md) للتفاصيل والحدود المتبقية.

## المكدس

- Next.js 15 App Router وReact 19
- Bun 1.2+ (ملف القفل منشأ بواسطة Bun 1.4.2)
- TypeScript وTailwind CSS
- Prisma 6 وPostgreSQL
- Auth.js v5، Zod، وIBM Plex Sans Arabic مستضاف محلياً

## المتطلبات وتشغيل التطبيق

- Bun 1.2 أو أحدث
- PostgreSQL 15 أو أحدث عند تشغيل migrations

```bash
cp .env.example .env.local
bun install --frozen-lockfile
```

املأ `DATABASE_URL` و`DIRECT_URL` بقيم قاعدة بياناتك، وضع `AUTH_SECRET` و`AUTH_RATE_LIMIT_SECRET` عشوائيين وسريين، ثم شغّل:

```bash
bun run db:generate
bun run db:migrate:deploy
bun run dev
```

## تهيئة قاعدة بيانات وبيانات عرض تجريبية

يمكن استخدام PostgreSQL محلي أو قاعدة اختبار منفصلة. لا توصل seed إلى قاعدة الإنتاج. بعد ضبط `DATABASE_URL` و`DIRECT_URL` في `.env.local`:

```bash
bun run db:migrate:deploy
ALLOW_DEMO_SEED=true bun run db:seed
```

ينشئ seed متجراً باسم `demo`، وفئة ومنتجاً ومتغيراً افتراضياً اصطناعياً. لإنشاء مالك تسجيل دخول محلي اختياري، شغّل seed مع بريد اختبار وكلمة مرور جديدة لا تقل عن 12 حرفاً:

```bash
ALLOW_DEMO_SEED=true \
DEMO_OWNER_EMAIL='owner@example.test' \
DEMO_OWNER_PASSWORD='replace-with-a-new-strong-password' \
bun run db:seed
```

يتحقق seed من `NODE_ENV` ويرفض العمل في الإنتاج. لا تضع بيانات الدخول الحقيقية في هذا المستودع أو ملف `.env.example`.

## الفحوص

```bash
bun run test
bun run typecheck
bun run lint
bun run db:validate
bun run build
```

## الصور والوسائط

رفع JPEG/PNG/WebP/AVIF محقق حتى 5MB لكل ملف؛ يُخزَّن محلياً خارج `public/` في `var/uploads` افتراضياً، مع سجل `MediaAsset` ومسار عرض يتحقق من متجر الأصل. يمكن تخصيص المسار عبر `MULTISTORE_MEDIA_DIR`. هذا المسار ملائم للتجربة المحلية فقط ما لم يُربط بمجلد دائم/تخزين كائني موثوق في بيئة النشر. Cloudinary غير مهيأ في هذه النسخة، ولا توجد معالجة تحويل/تصغير سحابية.

## بنية المشروع

```text
app/                  صفحات App Router؛ مصادقة، onboarding، إعدادات وكتالوج
components/           الواجهة ومكونات Landing
lib/                  Prisma، Auth، tenant-scope، التحقق، الوسائط
prisma/schema.prisma  مخطط المجال متعدد المستأجرين
prisma/migrations/    SQL migrations
prisma/seed.ts        بيانات تجريبية اختيارية وغير إنتاجية
tests/                اختبارات المخططات والتحقق من الصور
public/fonts/         خطوط عربية مستضافة محلياً
docs/                 خارطة الطريق وسجل التسليم والقرارات
```

## خارطة التنفيذ والمعاينة

- [`docs/PHASE-1.md`](docs/PHASE-1.md) إلى [`docs/PHASE-4.md`](docs/PHASE-4.md): التأسيس، البيانات، تعدد المستأجرين والمصادقة.
- [`docs/ROADMAP.md`](docs/ROADMAP.md): حالات المراحل 1–12 والقيود.
- [`docs/DELIVERY-PHASE-1-6.md`](docs/DELIVERY-PHASE-1-6.md): نتائج فحص قاعدة العرض وكيفية إعادة إعدادها.
- رابط المعاينة الحالي مؤقت من Sandbox، وليس نشرًا دائماً. النشر الدائم وربط Neon/Vercel والأسرار التشغيلية ضمن المرحلة 12.
- Lighthouse الموثق سابقاً: الحاسوب 100/100 في تشغيل منفرد، والهاتف 97/100 بوسيط ثلاثة تشغيلات؛ تحسين الهاتف يستمر في المرحلة 11.
