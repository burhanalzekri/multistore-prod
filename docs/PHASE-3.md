# المرحلة الثالثة — أساس عزل المستأجر وتوجيه النطاقات

## ما أُنجز

- `lib/tenant-host.ts`: محلل hostname نقي يدعم نطاق المنصة، subdomain متجر، custom domain، ومضيفات التطوير؛ يطبّع الحروف/المنفذ/النقطة النهائية ويرفض hostname غير صالح أو المتداخل.
- يحجز المضيفات `www`, `admin`, `api`, `app`, `auth`, `docs`, `status`, `support`, `mail`, `static`, `cdn`, `assets` للنظام، ولا يعتبر slug المصنّف هوية أو صلاحية.
- `middleware.ts`: يمسح `x-multistore-*` الواردة من العميل، ويعيد كتابة إشارات المضيف الداخلية بعد التصنيف؛ يرفض host غير صالح بـ400. الأصول الثابتة مستثناة من matcher.
- `lib/tenant.ts`: يقرأ الإشارات الداخلية فقط، يعيد تصنيف host، ثم يتحقق من متجر نشط عند subdomain أو متجر نشط ذي نطاق مخصص موثّق. يستخدم request memoization وcache لمدة 5 دقائق مع `invalidateTenantMappings()` للتغييرات.
- `requireCurrentTenant()` و`requireCurrentShopMembership(userId)` يربطان الوصول بسياق المضيف لا بمعرف متجر من العميل.
- `lib/tenant-scope.ts`: `withTenantWhere` و`withTenantData` يضعان `shopId` الموثوق أخيراً، بحيث لا تستطيع حقول الطلب استبداله.
- أضيف `PLATFORM_ROOT_DOMAIN` إلى `.env.example` واختبارات Bun تغطي normalization والنطاقات المحجوزة والمضيفات غير الصالحة وتزوير الرؤوس وتجاوز `shopId`.

## الاختبارات

- `bun run test` — 8 اختبارات ناجحة.
- `bun run typecheck` — ناجح.
- `bun run lint` — ناجح.
- `bun run build` — ناجح، Landing ما زالت static؛ middleware bundle على جهة الخادم فقط.

## حدود التنفيذ

لم تُنشأ بعد صفحات لوحة أو متجر تقرأ بيانات؛ دمج كل استعلام وكتابة tenant-scoped يتم عند بناء الميزات في المراحل 4–10. المخطط يحتوي قيوداً مركبة تمنع ربط صفوف بعض الجداول بمتجر مختلف. لا يوجد اتصال PostgreSQL في الجلسة، لذلك لم تُختبر الاستعلامات أو cache invalidation ضد قاعدة فعلية؛ ينبغي تنفيذ تغييرات slug/status/custom-domain عبر معاملات موثوقة ثم استدعاء `invalidateTenantMappings()`. توثيق/تحقق ملكية DNS للنطاق المخصص ونشر DNS جزء من المرحلة 12.
