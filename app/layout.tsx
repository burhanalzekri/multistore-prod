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
          {`try { if (localStorage.getItem("multistore-theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch {}`}
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
      <body>{children}</body>
    </html>
  );
}
