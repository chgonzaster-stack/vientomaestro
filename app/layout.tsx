// app/layout.tsx
import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';

const siteUrl = 'https://www.vientomaestro.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Viento Maestro | Transpositor de música para instrumentos de viento',
    template: '%s | Viento Maestro',
  },
  description:
    'Transpositor de música para instrumentos de viento. Cambia tonalidad de acordes y partituras para instrumentos en C, Bb, Eb y F.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Viento Maestro',
    title: 'Viento Maestro | Transpositor de música para instrumentos de viento',
    description:
      'Cambia tonalidades y transpón acordes para instrumentos en C, Bb, Eb y F de forma rápida.',
    images: [
      {
        url: '/og-image.jpg', // (opcional) pon una imagen 1200x630 en public
        width: 1200,
        height: 630,
        alt: 'Viento Maestro: transpositor de música',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viento Maestro | Transpositor de música para instrumentos de viento',
    description:
      'Herramienta web para transponer tonalidades y acordes para instrumentos en C, Bb, Eb y F.',
    images: ['/og-image.jpg'], // opcional
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Viento Maestro',
    applicationCategory: 'Multimedia',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'Transpositor de música para instrumentos de viento. Cambia tonalidad de canciones y acordes.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Transposición por instrumento',
      'Transposición por tono',
      'Copia y descarga del resultado',
    ],
    inLanguage: 'es',
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Forzar sitio como solo-web (sin PWA install) */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <link rel="canonical" href={siteUrl} />
        <Script
          id="jsonld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* AdSense */}
        <Script
          id="adsense-script"
          async
          crossOrigin="anonymous"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6543167154589234"
        />
      </head>
      <body className="min-h-screen bg-[#0b1220] text-white antialiased">{children}</body>
    </html>
  );
}
