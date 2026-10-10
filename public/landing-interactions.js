(() => {
  const themeButton = document.querySelector("[data-theme-toggle]");
  const applyTheme = (theme, persist = false) => {
    const selected = theme === "dark" ? "dark" : "light";
    if (selected === "dark") document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    themeButton?.setAttribute("aria-pressed", String(selected === "dark"));
    if (persist) {
      try {
        localStorage.setItem("multistore-theme", selected);
      } catch {}
    }
  };

  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeButton?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });

  const root = document.querySelector(".lp");
  if (!root) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = "IntersectionObserver" in window;
  const numberFormat = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });

  if (!reducedMotion && supportsObserver) {
    const revealItems = document.querySelectorAll(
      ".lp-audience, .lp-offer-strip, .lp-section, .lp-cta-section",
    );
    revealItems.forEach((item) => item.classList.add("lp-reveal"));
    root.classList.add("lp-motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          const endValue = Number(element.dataset.countUp);
          if (!Number.isFinite(endValue)) {
            observer.unobserve(element);
            return;
          }

          const startedAt = performance.now();
          const duration = 820;
          const tick = (now) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            element.textContent = numberFormat.format(Math.round(endValue * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          element.textContent = numberFormat.format(0);
          requestAnimationFrame(tick);
          observer.unobserve(element);
        });
      },
      { threshold: 0.65 },
    );
    document.querySelectorAll("[data-count-up]").forEach((item) => counterObserver.observe(item));
  }

  const suggestions = {
    value: "ابدأ بتحديد ما يميز متجرك، ثم اختر الأدوات التي تدعم أولويتك الآن.",
    features: "جرّب استكشاف المزايا، ثم اختر ميزة واحدة تجعل خطوتك الأولى أسهل.",
    showcase: "تخيّل شكل علامتك داخل المتجر؛ وضوح الصور والألوان يصنع فرقاً من أول نظرة.",
    workflow: "اقتراح البداية: جهّز اسم المتجر وأضف أول ثلاثة منتجات قبل ضبط التفاصيل الثانوية.",
    dashboard: "راجع مؤشرات المبيعات والطلبات معاً لتعرف أين تركز جهدك في الخطوة التالية.",
    global: "اختر لغة وعملة جمهورك أولاً، فهما أساس تجربة محلية واضحة.",
    payments: "قارن طرق الدفع والشحن التي تناسب سوقك قبل تفعيلها لعملائك.",
    faq: "اقرأ الإجابات الشائعة لتتضح لك حدود المعاينة وما سيأتي في المراحل التالية.",
  };
  const suggestion = document.querySelector("[data-contextual-suggestion]");
  const updateSuggestion = (id) => {
    if (suggestion && suggestions[id]) suggestion.textContent = suggestions[id];
  };

  if (supportsObserver) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        if (current?.target.id) updateSuggestion(current.target.id);
      },
      { threshold: [0.28, 0.52], rootMargin: "-14% 0px -42% 0px" },
    );
    document
      .querySelectorAll("#value, #features, #showcase, #workflow, #dashboard, #global, #payments, #faq")
      .forEach((section) => sectionObserver.observe(section));
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href^="#"]');
    if (link?.hash) updateSuggestion(link.hash.slice(1));
  });

  const moodLabel = document.querySelector("[data-mood-label]");
  document.querySelectorAll("[data-mood-option]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-mood-option]").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      if (moodLabel) moodLabel.textContent = button.dataset.moodOption;
    });
  });

  const reportData = {
    7: { caption: "آخر ٧ أيام", sales: "١٨٬٤٢٠ ر.س", orders: "١٢٨", csvSales: "18420", csvOrders: "128" },
    30: { caption: "آخر ٣٠ يوماً", sales: "٧٢٬٨٠٠ ر.س", orders: "٤١٦", csvSales: "72800", csvOrders: "416" },
    90: { caption: "آخر ٩٠ يوماً", sales: "١٩٦٬٤٠٠ ر.س", orders: "١٬١٠٤", csvSales: "196400", csvOrders: "1104" },
  };
  const reportCard = document.querySelector(".lp-analytics-card");
  let activeReport = "7";
  const setReportRange = (range) => {
    const data = reportData[range];
    if (!data || !reportCard) return;
    activeReport = range;
    reportCard.querySelectorAll("[data-report-range]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.reportRange === range));
    });
    reportCard.querySelector('[data-report-value="sales"]')?.replaceChildren(data.sales);
    reportCard.querySelector('[data-report-value="orders"]')?.replaceChildren(data.orders);
    const caption = reportCard.querySelector("[data-report-caption]");
    if (caption) caption.textContent = data.caption;
    reportCard.querySelectorAll("[data-report-bar]").forEach((bar) => {
      const height = bar.getAttribute(`data-height-${range}`);
      if (height) bar.style.height = `${height}%`;
    });
  };

  reportCard?.querySelectorAll("[data-report-range]").forEach((button) => {
    button.addEventListener("click", () => setReportRange(button.dataset.reportRange));
  });
  reportCard?.querySelector("[data-report-download]")?.addEventListener("click", () => {
    const data = reportData[activeReport];
    if (!data) return;
    const csv = `\uFEFFالفترة,المبيعات (ريال),الطلبات\n${data.caption},${data.csvSales},${data.csvOrders}\nملاحظة,بيانات تجريبية للمعاينة,`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `multistore-demo-report-${activeReport}d.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
