import { Download, Sparkles, TrendingUp } from "lucide-react";

const bars = [
  { seven: 32, thirty: 34, ninety: 28 },
  { seven: 45, thirty: 52, ninety: 47 },
  { seven: 39, thirty: 42, ninety: 58 },
  { seven: 61, thirty: 65, ninety: 44 },
  { seven: 49, thirty: 54, ninety: 75 },
  { seven: 76, thirty: 73, ninety: 69 },
  { seven: 92, thirty: 96, ninety: 100 },
];

export function AnalyticsBentoCard() {
  return (
    <article className="lp-feature-card lp-analytics-card" aria-labelledby="analytics-title">
      <div className="lp-analytics-copy">
        <p className="lp-eyebrow"><Sparkles size={14} /> تحليلات ذكية</p>
        <h3 id="analytics-title">افهم أداء متجرك، لا الأرقام فقط.</h3>
        <p>قارن الفترات، راقب اتجاه المبيعات، ونزّل ملخصاً سريعاً لاتخاذ خطوتك التالية.</p>
        <div className="lp-analytics-kpis" aria-live="polite" aria-atomic="true">
          <div><small>المبيعات</small><b data-report-value="sales">١٨٬٤٢٠ ر.س</b></div>
          <div><small>الطلبات</small><b data-report-value="orders">١٢٨</b></div>
        </div>
        <span className="lp-analytics-note"><TrendingUp size={14} /> مؤشرات تجريبية تتبدل مع الفترة المحددة</span>
      </div>

      <div className="lp-analytics-panel">
        <div className="lp-analytics-toolbar">
          <div className="lp-analytics-report-title"><b>تقرير أداء المتجر</b><small data-report-caption>آخر ٧ أيام</small></div>
          <div className="lp-report-controls" role="group" aria-label="اختر فترة التقرير">
            <button type="button" data-report-range="7" aria-pressed="true">٧ أيام</button>
            <button type="button" data-report-range="30" aria-pressed="false">٣٠ يوماً</button>
            <button type="button" data-report-range="90" aria-pressed="false">٩٠ يوماً</button>
          </div>
        </div>
        <div className="lp-analytics-chart" role="img" aria-label="رسم توضيحي للمبيعات، يتغير حسب الفترة المحددة">
          <div className="lp-analytics-grid-lines"><i /><i /><i /><i /></div>
          {bars.map((bar, index) => (
            <span
              key={index}
              data-report-bar
              data-height-7={bar.seven}
              data-height-30={bar.thirty}
              data-height-90={bar.ninety}
              style={{ height: `${bar.seven}%` }}
            />
          ))}
        </div>
        <div className="lp-analytics-axis" aria-hidden="true"><span>بداية الفترة</span><span>منتصفها</span><span>اليوم</span></div>
        <div className="lp-analytics-panel-foot">
          <small>بيانات عرض توضيحي</small>
          <button type="button" className="lp-report-download" data-report-download>
            <Download size={14} /> تنزيل التقرير
          </button>
        </div>
      </div>
    </article>
  );
}
