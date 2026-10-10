import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Globe2,
  Languages,
  Layers3,
  MapPin,
  Moon,
  Package,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  Truck,
  Wallet,
} from "lucide-react";

import Script from "next/script";
import { LandingSignals } from "@/components/marketing/landing-signals";
import { AnalyticsBentoCard } from "@/components/marketing/analytics-bento";

export const dynamic = "force-static";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "green" | "lime" | "blue" | "peach";
};

const features: Feature[] = [
  {
    icon: Store,
    title: "واجهة تحمل هويتك",
    description: "رتّب واجهة متجرك واختر الألوان والخطوط التي تعبّر عن علامتك.",
    tone: "green",
  },
  {
    icon: Package,
    title: "منتجاتك في مكان واحد",
    description: "أضف المنتجات والفئات والمتغيرات، واحتفظ بتفاصيلها مرتبة.",
    tone: "lime",
  },
  {
    icon: CreditCard,
    title: "خيارات دفع مرنة",
    description: "هيّئ وسائل الدفع الملائمة لسوقك، من الدفع عند الاستلام إلى البطاقات.",
    tone: "blue",
  },
  {
    icon: Truck,
    title: "إدارة الطلبات والشحن",
    description: "تابع حالة الطلب من لحظة استلامه حتى وصوله إلى العميل.",
    tone: "peach",
  },
  {
    icon: BarChart3,
    title: "صورة أوضح للأداء",
    description: "اجمع مؤشرات المبيعات والطلبات في لوحة واحدة سهلة القراءة.",
    tone: "green",
  },
  {
    icon: ShieldCheck,
    title: "مساحة عمل منظمة",
    description: "أدر متجرك وفريقك من مساحة واضحة، مع أساس قابل للتوسع.",
    tone: "blue",
  },
];

const faqs = [
  {
    question: "هل أحتاج إلى خبرة تقنية لإنشاء متجري؟",
    answer:
      "صُممت التجربة لتكون واضحة لأصحاب المشاريع. ستتمكن من إعداد معلومات المتجر وإضافة المنتجات من واجهات موجهة، من دون الحاجة إلى كتابة الكود.",
  },
  {
    question: "هل يمكنني تخصيص شكل المتجر؟",
    answer:
      "نعم، خُطط المنصة لتتيح التحكم في الهوية البصرية، مثل الألوان والخطوط ومعلومات التواصل. واجهة الإدارة ستُربط بهذه الإعدادات في مراحل التنفيذ القادمة.",
  },
  {
    question: "هل تدعم المنصة أكثر من لغة وعملة؟",
    answer:
      "هذا من متطلبات المنتج الأساسية. يوضح هذا العرض شكل تجربة الإعداد، أما الربط الفعلي باللغات والعملات فسيأتي ضمن مراحل البناء التالية.",
  },
  {
    question: "هل أستطيع إدارة الطلبات ووسائل الدفع؟",
    answer:
      "صفحة الهبوط تعرض نطاق المنصة المقترح فقط؛ إدارة الطلبات وتهيئة وسائل الدفع ستُنفذ وتُختبر ضمن مراحل المنتج المخصصة لها.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={`lp-section-heading${centered ? " is-centered" : ""}`}>
      <p className="lp-eyebrow"><span className="lp-eyebrow-dot" />{eyebrow}</p>
      <h2>{title}</h2>
      <p className="lp-section-lede">{description}</p>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="lp-brand-mark" aria-hidden="true">
      <span className="lp-mark-column mark-one" />
      <span className="lp-mark-column mark-two" />
      <span className="lp-mark-column mark-three" />
    </span>
  );
}

function ProductCard({
  name,
  kind,
  price,
  color,
  shape,
}: {
  name: string;
  kind: string;
  price: string;
  color: string;
  shape: "bottle" | "bag" | "jar";
}) {
  return (
    <article className="lp-product-card">
      <div className={`lp-product-art ${color}`} aria-hidden="true">
        {shape === "bottle" && <span className="product-bottle"><i /></span>}
        {shape === "bag" && <span className="product-bag"><i /></span>}
        {shape === "jar" && <span className="product-jar"><i /></span>}
        <span className="product-art-glow" />
      </div>
      <div className="lp-product-meta">
        <div><span>{kind}</span><strong>{name}</strong></div>
        <b>{price}</b>
      </div>
    </article>
  );
}

function DashboardPreview() {
  const bars = [38, 53, 45, 67, 56, 78, 63, 89, 72, 100, 80, 94];
  return (
    <div className="lp-dashboard-window" dir="rtl" aria-label="معاينة تجريبية للوحة التحكم">
      <div className="lp-window-topbar" dir="ltr">
        <div className="lp-window-dots"><i /><i /><i /></div>
        <div className="lp-window-address"><span /> app.multistore.store</div>
        <div className="lp-window-menu"><span /><span /><span /></div>
      </div>
      <div className="lp-dashboard-body">
        <aside className="lp-dashboard-sidebar">
          <div className="lp-mini-brand"><BrandMark /><span>MultiStore</span></div>
          <div className="lp-mini-shop"><span className="lp-shop-avatar">ن</span><span><b>متجر نُور</b><small>المتجر الرئيسي</small></span><ChevronDown size={14} /></div>
          <div className="lp-side-label">القائمة</div>
          <div className="lp-side-link active"><BarChart3 size={15} />نظرة عامة</div>
          <div className="lp-side-link"><ShoppingBag size={15} />الطلبات</div>
          <div className="lp-side-link"><Package size={15} />المنتجات</div>
          <div className="lp-side-link"><Settings2 size={15} />الإعدادات</div>
          <div className="lp-sidebar-help"><CircleHelp size={15} /><span>مركز المساعدة</span></div>
        </aside>
        <div className="lp-dashboard-main">
          <div className="lp-dash-topline">
            <div><small>الأربعاء، ٩ أكتوبر</small><h3>أهلاً بك، نورة</h3></div>
            <div className="lp-dash-user"><span className="lp-online-dot" /> متجر نشط <span className="lp-user-avatar">ن</span></div>
          </div>
          <div className="lp-demo-note"><Sparkles size={13} /> بيانات توضيحية للمعاينة</div>
          <div className="lp-stat-grid">
            <div className="lp-stat-card"><span>إجمالي المبيعات</span><strong><span data-count-up="18420">١٨٬٤٢٠</span> <small>ر.س</small></strong><em className="up">↑ ١٢٪</em></div>
            <div className="lp-stat-card"><span>الطلبات</span><strong><span data-count-up="128">١٢٨</span></strong><em className="up">↑ ٨٪</em></div>
            <div className="lp-stat-card"><span>متوسط السلة</span><strong><span data-count-up="144">١٤٤</span> <small>ر.س</small></strong><em className="neutral">هذا الشهر</em></div>
          </div>
          <div className="lp-dash-lower">
            <div className="lp-chart-card">
              <div className="lp-card-heading"><div><b>نظرة على المبيعات</b><small>آخر ١٢ أسبوعاً</small></div><span>هذا العام⌄</span></div>
              <div className="lp-chart" role="img" aria-label="رسم توضيحي تجريبي للمبيعات"><div className="lp-chart-lines"><i /><i /><i /></div>{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} className={index === 9 ? "highlight" : ""} />)}</div>
              <div className="lp-chart-labels"><span>أغسطس</span><span>سبتمبر</span><span>أكتوبر</span></div>
            </div>
            <div className="lp-orders-card">
              <div className="lp-card-heading"><div><b>أحدث الطلبات</b><small>تحديث مباشر</small></div><ArrowUpLeft size={14} /></div>
              <div className="lp-order-row"><span className="lp-order-avatar peach-bg">ه</span><span><b>هند العتيبي</b><small>#MS-2084</small></span><strong>٢٤٠ ر.س</strong></div>
              <div className="lp-order-row"><span className="lp-order-avatar green-bg">م</span><span><b>مازن القحطاني</b><small>#MS-2083</small></span><strong>١٨٥ ر.س</strong></div>
              <div className="lp-order-row"><span className="lp-order-avatar blue-bg">ر</span><span><b>ريم السالم</b><small>#MS-2082</small></span><strong>٣٦٠ ر.س</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-floating-insight"><span><TrendingIcon /></span><div><small>كل شيء في مكانه</small><b>من المنتج إلى الطلب</b></div><BadgeCheck size={17} /></div>
    </div>
  );
}

function TrendingIcon() {
  return <ArrowUpLeft size={17} aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <div className="lp min-h-screen antialiased" id="home">
      <Script src="/landing-interactions.js" strategy="afterInteractive" />
      <header className="lp-header">
        <div className="lp-container lp-nav">
          <a className="lp-brand" href="#home" aria-label="MultiStore — الرئيسية"><BrandMark /><span>Multi<span>Store</span></span></a>
          <nav className="lp-nav-links" aria-label="التنقل الرئيسي">
            <a href="#features">المزايا</a><a href="#workflow">كيف تعمل</a><a href="#global">لكل سوق</a><a href="#faq">الأسئلة الشائعة</a>
          </nav>
          <div className="lp-nav-actions">
            <button type="button" className="lp-theme-toggle" data-theme-toggle aria-label="تبديل سمة الواجهة" aria-pressed="false">
              <Moon size={16} className="lp-theme-moon" aria-hidden="true" />
              <Sun size={16} className="lp-theme-sun" aria-hidden="true" />
              <span className="lp-theme-label-light">الوضع الداكن</span>
              <span className="lp-theme-label-dark">الوضع الفاتح</span>
            </button>
            <a className="lp-button lp-button-small" href="#workflow">ابدأ رحلتك <ArrowLeft size={16} /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-hero-badge"><span className="lp-live-dot" /> منصة متاجر تنمو مع فكرتك</p>
              <h1 id="hero-title">فكرتك تستحق<br /><span>متجراً يليق بها.</span></h1>
              <p className="lp-hero-lede">من أول منتج إلى أول طلب — أدوات تجارتك كلها في مكان واحد، بتجربة عربية واضحة وقابلة للتوسع.</p>
              <LandingSignals />
              <div className="lp-hero-actions"><a className="lp-button" href="#workflow">ابدأ إنشاء متجرك <ArrowLeft size={17} /></a><a className="lp-text-link" href="#showcase"><span className="lp-play">▶</span> ألقِ نظرة على التجربة</a></div>
              <div className="lp-hero-assurance"><span><Check size={14} /> بلا تعقيد تقني</span><span><Check size={14} /> جاهز للنمو</span><span><Check size={14} /> مصمم لأسواق متعددة</span></div>
            </div>
            <div className="lp-hero-visual"><div className="lp-hero-orbit orbit-one" /><div className="lp-hero-orbit orbit-two" /><DashboardPreview /></div>
          </div>
          <div className="lp-hero-bottom-line" />
        </section>

        <section className="lp-audience" aria-label="مناسب لمختلف أنواع المشاريع">
          <div className="lp-container lp-audience-row"><p>مكان واحد لكل ما يحتاجه مشروعك</p><div><span><ShoppingBag size={16} /> الأزياء</span><span><Sparkles size={16} /> العناية والجمال</span><span><Layers3 size={16} /> المنتجات المنزلية</span><span><Package size={16} /> وأكثر من ذلك</span></div></div>
          <div className="lp-offer-strip" role="region" aria-label="مختارات وعروض توضيحية">
          <div className="lp-container lp-offer-layout">
            <div className="lp-offer-heading"><span className="lp-offer-live-dot" /><span>لمحات متجددة</span><small>أمثلة للمعاينة</small></div>
            <div className="lp-offer-window" dir="ltr">
              <div className="lp-offer-track">
                <div className="lp-offer-set" dir="rtl">
                  <span className="lp-offer-item"><b>عرض موسمي</b> جهّز كوبونك الأول بلمسة واحدة <i>✦</i></span>
                  <span className="lp-offer-item"><b>قصة انطلاقة</b> من فكرة صغيرة إلى متجر واضح <i>↗</i></span>
                  <span className="lp-offer-item"><b>خطوة نمو</b> اكتشف المنتجات التي تستحق الظهور <i>✧</i></span>
                </div>
                <div className="lp-offer-set" dir="rtl" aria-hidden="true">
                  <span className="lp-offer-item"><b>عرض موسمي</b> جهّز كوبونك الأول بلمسة واحدة <i>✦</i></span>
                  <span className="lp-offer-item"><b>قصة انطلاقة</b> من فكرة صغيرة إلى متجر واضح <i>↗</i></span>
                  <span className="lp-offer-item"><b>خطوة نمو</b> اكتشف المنتجات التي تستحق الظهور <i>✧</i></span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="lp-section lp-value-section" id="value">
          <div className="lp-container lp-value-grid">
            <SectionHeading eyebrow="مساحة واحدة. تركيز أكبر." title="تفرّغ لمشروعك، واترك التفاصيل علينا." description="إطلاق متجر لا يعني جمع أدوات متفرقة. MultiStore يجمع أساسيات البيع والإدارة في تجربة واحدة تساعدك أن تبدأ بخطوات واضحة." />
            <div className="lp-value-points"><div><span className="lp-value-icon"><Layers3 size={19} /></span><div><b>منظومة مترابطة</b><p>المنتجات والطلبات والإعدادات تتقابل في لوحة واحدة.</p></div></div><div><span className="lp-value-icon alt"><Globe2 size={19} /></span><div><b>مصممة لتتكيّف</b><p>لغة وعملة وتجربة قابلة للتهيئة حسب السوق الذي تخدمه.</p></div></div><div><span className="lp-value-icon pale"><Sparkles size={19} /></span><div><b>واجهة بلا ازدحام</b><p>معلومات واضحة وخطوات مباشرة، من غير أدوات تشتت انتباهك.</p></div></div></div>
          </div>
        </section>

        <section className="lp-section lp-features-section" id="features">
          <div className="lp-container"><SectionHeading eyebrow="كل الأساسيات، بتجربة واحدة" title="أدوات عملية لخطواتك اليومية." description="ابدأ بما تحتاجه اليوم، ثم وسّع تجربة متجرك كلما كبر مشروعك." centered /><div className="lp-feature-grid">{features.map(({ icon: Icon, title, description, tone }) => <article className="lp-feature-card" key={title}><span className={`lp-feature-icon tone-${tone}`}><Icon size={21} strokeWidth={1.8} /></span><h3>{title}</h3><p>{description}</p><a href="#workflow" aria-label={`اعرف أكثر عن ${title}`}><ArrowLeft size={17} /></a></article>)}<AnalyticsBentoCard /></div></div>
        </section>

        <section className="lp-section lp-showcase-section" id="showcase">
          <div className="lp-container lp-showcase-grid"><div className="lp-showcase-copy"><p className="lp-eyebrow"><span className="lp-eyebrow-dot" /> متجرك، كما تخيلته</p><h2>واجهة تعكس علامتك<br /><span>من أول نظرة.</span></h2><p className="lp-section-lede">أنشئ مساحة تسوّق متناسقة، اعرض فيها منتجاتك بوضوح، واجعل الوصول إليها سهلاً على عملائك.</p><ul className="lp-check-list"><li><Check size={16} /> تنظيم واضح للفئات والمنتجات</li><li><Check size={16} /> تجربة مريحة على الجوال والكمبيوتر</li><li><Check size={16} /> ألوان وخطوط تعبّر عن هويتك</li></ul><a className="lp-outline-button" href="#global">اكتشف خيارات التخصيص <ArrowLeft size={16} /></a></div>
            <div className="lp-storefront-mock" dir="rtl"><div className="lp-store-top"><span className="lp-store-logo"><i /> نُور</span><div><span>الرئيسية</span><span>المتجر</span><span>قصتنا</span></div><span className="lp-store-bag"><ShoppingBag size={17} /></span></div><div className="lp-store-welcome"><small>اختيارات الموسم</small><b>تفاصيل صغيرة،<br />فرق كبير.</b><span>اكتشفي المجموعة الجديدة</span><i><ArrowLeft size={14} /></i></div><div className="lp-store-items"><ProductCard kind="عناية بالبشرة" name="سيروم الندى" price="١٢٠ ر.س" color="art-sand" shape="bottle" /><ProductCard kind="إكسسوارات" name="حقيبة يومية" price="٢٤٥ ر.س" color="art-blue" shape="bag" /><ProductCard kind="للمنزل" name="شمعة هادئة" price="٨٥ ر.س" color="art-peach" shape="jar" /></div><div className="lp-store-foot"><span><ShieldCheck size={13} /> تسوق بثقة</span><span>توصيل محلي ودولي</span><span>دفع مرن</span></div></div>
          </div>
        </section>

        <section className="lp-section lp-steps-section" id="workflow">
          <div className="lp-container"><SectionHeading eyebrow="ثلاث خطوات إلى البداية" title="فكرة اليوم. متجر جاهز غداً." description="رحلة الإعداد مصممة لتبقي الأمور بسيطة، من معلومات المتجر حتى إطلاق واجهتك." centered /><div className="lp-steps-grid"><article className="lp-step-card"><div className="lp-step-top"><span>01</span><span className="lp-step-icon"><Store size={20} /></span></div><h3>عرّف متجرك</h3><p>أضف اسم المشروع ووسائل التواصل والتفاصيل الأساسية.</p></article><article className="lp-step-card"><div className="lp-step-top"><span>02</span><span className="lp-step-icon"><Package size={20} /></span></div><h3>أضف منتجاتك</h3><p>نظّم المنتجات والفئات وحدد ما يناسب نشاطك.</p></article><article className="lp-step-card"><div className="lp-step-top"><span>03</span><span className="lp-step-icon"><ArrowUpLeft size={20} /></span></div><h3>استعد للانطلاق</h3><p>راجع واجهتك وإعدادات الدفع والشحن قبل استقبال الطلبات.</p></article></div></div>
        </section>

        <section className="lp-section lp-dashboard-section" id="dashboard">
          <div className="lp-container lp-dashboard-promo"><div className="lp-dashboard-promo-copy"><p className="lp-eyebrow"><span className="lp-eyebrow-dot" /> وضوح في كل قرار</p><h2>صورة مشروعك،<br /><span>من دون ضجيج.</span></h2><p className="lp-section-lede">تابع مؤشرات متجرك من لوحة واحدة؛ اعرف ما يحدث، وما يحتاج انتباهك، بخطوات سهلة القراءة.</p><div className="lp-dashboard-benefits"><span><Check size={15} /> ملخص المبيعات والطلبات</span><span><Check size={15} /> عرض مبسط للأداء</span><span><Check size={15} /> وصول سريع للمهام اليومية</span></div></div><div className="lp-dashboard-promo-visual"><div className="lp-dashboard-mini-card"><div className="lp-mini-card-head"><span>حالة المتجر</span><span className="lp-status"><i /> مستقر</span></div><div className="lp-mini-card-title">كل مؤشراتك<br />في مسار واحد</div><div className="lp-mini-bars"><i style={{ height: "34%" }} /><i style={{ height: "47%" }} /><i style={{ height: "40%" }} /><i style={{ height: "65%" }} /><i style={{ height: "57%" }} /><i style={{ height: "82%" }} /><i style={{ height: "71%" }} /><i style={{ height: "100%" }} /></div><div className="lp-mini-card-foot"><span>أسبوع ١</span><span>أسبوع ٨</span></div></div><div className="lp-promo-float"><span className="lp-promo-float-icon"><BadgeCheck size={18} /></span><span><small>مساحة مرتبة</small><b>تفاصيلك في متناولك</b></span></div><span className="lp-dashboard-glow" /></div></div>
        </section>

        <section className="lp-section lp-global-section" id="global">
          <div className="lp-container lp-global-grid"><div className="lp-global-copy"><p className="lp-eyebrow"><span className="lp-eyebrow-dot" /> تجربة تتكيّف مع سوقك</p><h2>قريب من عملائك،<br /><span>أينما كانوا.</span></h2><p className="lp-section-lede">كل سوق له طريقته. جهّز تجربة متجرك لتناسب لغة جمهورك وعملته وتفاصيل العمل المحلية.</p><a className="lp-text-link dark-link" href="#payments">شاهد خيارات الإعداد <ArrowLeft size={16} /></a></div><div className="lp-localization-card"><div className="lp-localization-heading"><span><Globe2 size={19} /></span><div><b>إعدادات متجرك</b><small>خصصها حسب احتياجك</small></div><span className="lp-settings-dots">•••</span></div><div className="lp-setting-row"><span className="lp-setting-icon"><Languages size={17} /></span><span><small>لغة المتجر</small><b>العربية <em>AR</em></b></span><ChevronDown size={16} /></div><div className="lp-setting-row"><span className="lp-setting-icon green-setting"><Wallet size={17} /></span><span><small>العملة الأساسية</small><b>ريال سعودي <em>SAR</em></b></span><ChevronDown size={16} /></div><div className="lp-setting-row"><span className="lp-setting-icon blue-setting"><MapPin size={17} /></span><span><small>المنطقة الزمنية</small><b>الرياض (GMT+3)</b></span><ChevronDown size={16} /></div><div className="lp-localization-note"><Sparkles size={14} /> أمثلة لواجهة الإعداد، والخيارات الفعلية ستُبنى ضمن المنصة.</div></div></div>
        </section>

        <section className="lp-section lp-payments-section" id="payments">
          <div className="lp-container lp-payments-grid"><div className="lp-payments-copy"><p className="lp-eyebrow"><span className="lp-eyebrow-dot" /> خيارات تناسب طريقة عملك</p><h2>إعدادات البيع،<br /><span>على مقاسك.</span></h2><p className="lp-section-lede">اختر طريقة الدفع، رتّب أسلوب التوصيل، وراجع سياسة متجرك من مساحة إعداد واحدة.</p><a className="lp-outline-button" href="#faq">أسئلة شائعة <ArrowLeft size={16} /></a></div><div className="lp-methods-panel"><div className="lp-methods-panel-head"><span>تهيئة طرق الدفع</span><span className="lp-methods-caption">عرض توضيحي</span></div><div className="lp-method-row selected"><span className="lp-method-icon cash-icon"><Wallet size={18} /></span><span><b>الدفع عند الاستلام</b><small>خيار مرن لعملائك</small></span><i><Check size={13} /></i></div><div className="lp-method-row"><span className="lp-method-icon card-icon"><CreditCard size={18} /></span><span><b>البطاقات والمحافظ</b><small>وسائل دفع رقمية</small></span><i /></div><div className="lp-method-row"><span className="lp-method-icon bank-icon"><Layers3 size={18} /></span><span><b>تحويل بنكي</b><small>أضف بيانات حسابك</small></span><i /></div><div className="lp-methods-foot"><ShieldCheck size={15} /> تُحدد الوسائل المتاحة حسب بلدك ومزود الخدمة</div></div></div>
        </section>

        <section className="lp-section lp-faq-section" id="faq">
          <div className="lp-container lp-faq-grid"><div><p className="lp-eyebrow"><span className="lp-eyebrow-dot" /> أسئلة تتكرر</p><h2>قبل أن تبدأ،<br /><span>قد يخطر ببالك.</span></h2><p className="lp-section-lede">إجابات سريعة تساعدك على تصور التجربة.</p></div><div className="lp-faq-list">{faqs.map(({ question, answer }) => <details className="lp-faq-item" key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div></div>
        </section>

        <section className="lp-cta-section" id="contact">
          <div className="lp-container lp-cta-inner"><span className="lp-cta-orb" /><div className="lp-cta-mark"><BrandMark /></div><p className="lp-cta-eyebrow">خطوتك الأولى تبدأ هنا</p><h2>خلّ فكرتك تأخذ<br /><span>مساحتها.</span></h2><p>ابدأ من الأساسيات، وابنِ متجرك بالطريقة التي تناسبك.</p><a className="lp-button lp-button-light" href="#workflow">استكشف خطوات البداية <ArrowLeft size={17} /></a><small>معاينة واجهة الصفحة الرئيسية — بعض الخيارات المعروضة تمثيلية.</small></div>
        </section>
      </main>

      <footer className="lp-footer"><div className="lp-container lp-footer-main"><a className="lp-brand lp-footer-brand" href="#home"><BrandMark /><span>Multi<span>Store</span></span></a><p>مساحة واحدة، لتجارتك كلها.</p><div className="lp-footer-links"><a href="#features">المزايا</a><a href="#workflow">كيف تعمل</a><a href="#faq">الأسئلة الشائعة</a><a href="#home">للأعلى ↑</a></div></div><div className="lp-container lp-footer-bottom"><span>© {new Date().getFullYear()} MultiStore</span><span>معاينة بصرية أولية — لا تمثل بعد لوحة إدارة فعلية.</span></div></footer>
    </div>
  );
}
