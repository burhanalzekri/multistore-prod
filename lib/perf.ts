export const PERFORMANCE_BUDGET = {
  lighthousePerformance: 98,
  fcpMs: 800,
  lcpMs: 1_000,
  ttiMs: 1_500,
  inpMs: 50,
  cls: 0.02,
  ttfbMs: 100,
  initialJsGzipBytes: 100_000,
  totalPageBytes: 500_000,
  totalBlockingTimeMs: 100,
  speedIndexMs: 1_500,
} as const;

export type CoreWebVital = "LCP" | "FCP" | "INP" | "CLS" | "TTFB";
