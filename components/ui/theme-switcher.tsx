"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { key: "light", icon: "☀️", label: "النهار" },
  { key: "dark", icon: "🌙", label: "الليل" },
  { key: "rain", icon: "🌧️", label: "المطر" },
  { key: "sunset", icon: "🌅", label: "الغروب" },
] as const;

type ThemeKey = (typeof THEMES)[number]["key"];

const STORAGE_KEY = "multistore-theme";

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeKey>("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY) as ThemeKey) || "light";
      setCurrent(saved);
    } catch {
      // ignore
    }
  }, []);

  function apply(theme: ThemeKey) {
    setCurrent(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    const root = document.documentElement;
    if (theme === "light") {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", theme);
      root.classList.remove("dark");
    }
    setTimeout(() => setOpen(false), 200);
  }

  const currentIcon = THEMES.find((t) => t.key === current)?.icon || "🎨";

  return (
    <div className="ms-theme-switcher" id="msThemeSwitcher">
      <div
        className={`ms-theme-menu ${open ? "open" : ""}`}
        id="msThemeMenu"
      >
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`ms-theme-option ${current === t.key ? "active" : ""}`}
            onClick={() => apply(t.key)}
          >
            <span className="ms-theme-option-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="ms-theme-toggle"
        id="msThemeToggle"
        aria-label="تبديل الأوضاع"
        onClick={() => setOpen((v) => !v)}
      >
        {currentIcon}
      </button>
    </div>
  );
}
