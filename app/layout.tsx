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
        {/* Evitar oferta de instalación como app */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="application-name" content="Viento Maestro" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />

        {/* Script de tema antes del primer pintado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var ls = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (ls === 'dark' || (!ls && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Google AdSense */}
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6543167154589234"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      {/* Usa bg/text si ya definiste las variables en globals.css */}
      <body className="min-h-screen antialiased">
        {/* 👉 El Toaster DEBE envolver a children */}
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
