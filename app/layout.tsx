import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./landing.css";
export const metadata: Metadata = {
  title: "MultiStore | متجرك الإلكتروني في مكان واحد",
  description: "أنشئ متجرك الإلكتروني وأدر منتجاتك وطلباتك من تجربة واحدة مرنة.",
  applicationName: "MultiStore",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            var t = localStorage.getItem("multistore-theme") || "light";
            if (t !== "light") document.documentElement.setAttribute("data-theme", t);
            if (t === "dark") document.documentElement.classList.add("dark");
          } catch {}`}
        </Script>
        <link
          rel="preload"
          href="/fonts/IBMPlexSansArabic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/IBMPlexSansArabic-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Script id="theme-manager" strategy="afterInteractive">
          {`(function(){
            var KEY = "multistore-theme";
            var ICONS = { light: "☀️", dark: "🌙", rain: "🌧️", sunset: "🌅" };
            function apply(t) {
              document.documentElement.setAttribute("data-theme", t === "light" ? "" : t);
              document.documentElement.classList.toggle("dark", t === "dark");
              try { localStorage.setItem(KEY, t); } catch(e){}
              document.querySelectorAll("[data-ms-theme]").forEach(function(b){
                b.classList.toggle("active", b.getAttribute("data-ms-theme") === t);
              });
              var tog = document.getElementById("msThemeToggle");
              if (tog) tog.textContent = ICONS[t] || "🎨";
            }
            window.msApplyTheme = apply;
            var cur = "light";
            try { cur = localStorage.getItem(KEY) || "light"; } catch(e){}
            if (cur !== "light") document.documentElement.setAttribute("data-theme", cur);
            if (cur === "dark") document.documentElement.classList.add("dark");
            document.addEventListener("click", function(e){
              var tog = e.target.closest("#msThemeToggle");
              if (tog) { e.preventDefault(); var m = document.getElementById("msThemeMenu"); if (m) m.classList.toggle("open"); return; }
              var opt = e.target.closest("[data-ms-theme]");
              if (opt) { e.preventDefault(); apply(opt.getAttribute("data-ms-theme")); var m = document.getElementById("msThemeMenu"); if (m) setTimeout(function(){ m.classList.remove("open"); }, 200); return; }
              if (!e.target.closest("#msThemeSwitcher")) { var m = document.getElementById("msThemeMenu"); if (m) m.classList.remove("open"); }
            });
            document.addEventListener("DOMContentLoaded", function(){
              var tog = document.getElementById("msThemeToggle");
              if (tog) tog.textContent = ICONS[cur] || "🎨";
              document.querySelectorAll("[data-ms-theme]").forEach(function(b){
                b.classList.toggle("active", b.getAttribute("data-ms-theme") === cur);
              });
            });
          })();`}
        </Script>
        <ThemeSwitcher />
      </body>
    </html>
  );
}
