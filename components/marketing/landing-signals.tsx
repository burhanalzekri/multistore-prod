import { Lightbulb, Sparkles } from "lucide-react";

const moods = [
  { face: "😌", name: "هادئة" },
  { face: "🙂", name: "متوازنة" },
  { face: "🤩", name: "متحمسة" },
  { face: "😎", name: "واثقة" },
];

export function LandingSignals() {
  return (
    <div className="lp-intelligence" aria-label="مساعد تجربة المتجر">
      <article className="lp-signal-card lp-tip-card">
        <span className="lp-signal-icon"><Lightbulb size={17} aria-hidden="true" /></span>
        <div>
          <small>نصيحة اليوم</small>
          <p>اعرض أفضل منتجاتك أولاً، واجعل الوصول إليها واضحاً من الصفحة الرئيسية.</p>
        </div>
      </article>

      <article className="lp-signal-card lp-suggestion-card" aria-live="polite">
        <span className="lp-signal-icon lp-sparkle-icon"><Sparkles size={17} aria-hidden="true" /></span>
        <div>
          <small>اقتراح حسب نشاطك</small>
          <p data-contextual-suggestion>استكشف الأقسام، وسأقترح عليك الخطوة الأقرب لاهتمامك.</p>
        </div>
      </article>

      <div className="lp-mood-card">
        <div className="lp-mood-copy">
          <small>مزاج التجربة الآن</small>
          <b data-mood-label aria-live="polite">متوازنة</b>
        </div>
        <div className="lp-mood-options" role="group" aria-label="اختر مزاج الواجهة">
          {moods.map((option, index) => (
            <button
              type="button"
              key={option.name}
              className={index === 1 ? "is-selected" : ""}
              data-mood-option={option.name}
              aria-label={`اختيار مزاج ${option.name}`}
              aria-pressed={index === 1}
            >
              <span aria-hidden="true">{option.face}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="lp-smart-disclosure">تتغيّر الاقتراحات داخل المتصفح بحسب القسم الذي تستكشفه.</p>
    </div>
  );
}
