// app/layout.tsx
import './globals.css'
import Script from 'next/script'
import { Toaster } from '@/components/ui/toast'

export const metadata = {
  title: 'Viento Maestro',
  description: 'Transpositor de música para instrumentos de viento',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Forzamos modo oscuro
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="application-name" content="Viento Maestro" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="icon" href="/favicon.ico" />

        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6543167154589234"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="min-h-screen antialiased">
        {/* ⬇️ IMPORTANTE: el provider debe envolver a children */}
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  )
}
