// app/layout.tsx
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import Script from 'next/script';

export const metadata = {
  title: 'Viento Maestro',
  description: 'Transpositor de música para instrumentos de viento',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* ❌ Deshabilita comportamiento PWA */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="application-name" content="Viento Maestro" />
        <meta name="theme-color" content="#ffffff" />

        {/* Favicon clásico */}
        <link rel="icon" href="/favicon.ico" />

        {/* 🌓 Inicializa tema ANTES del primer paint */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var ls = localStorage.getItem('theme');                        // 'dark' | 'light' | null
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var useDark = ls === 'dark' || (!ls && prefersDark);           // si no hay LS, usa preferencia del SO
    var root = document.documentElement;                           // <html>
    if (useDark) root.classList.add('dark'); else root.classList.remove('dark');
  } catch (e) {}
})();
          `.trim(),
          }}
        />

        {/* ✅ Script global de Google AdSense */}
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6543167154589234"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      {/* Clases base para que el cambio claro/oscuro sea visible de inmediato */}
      <body className="min-h-screen antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
