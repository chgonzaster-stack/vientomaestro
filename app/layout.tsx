// app/layout.tsx
import './globals.css';
import { Toaster } from '../src/components/ui/toast'; // ruta relativa a src
import Script from 'next/script';

export const metadata = {
  title: 'Viento Maestro',
  description: 'Transpositor de música para instrumentos de viento',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Evitar prompt de instalación como app */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="application-name" content="Viento Maestro" />
        <meta name="theme-color" content="#ffffff" />

        <link rel="icon" href="/favicon.ico" />

        {/* Script global de AdSense */}
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6543167154589234"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="min-h-screen antialiased">
        {/* 👇 Aquí el cambio importante: Proveedor envolviendo todo */}
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
