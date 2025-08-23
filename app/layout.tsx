// app/layout.tsx
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viento Maestro | Transpositor de música para instrumentos de viento',
  description: 'Transpositor de música para instrumentos de viento. Cambia de tono por instrumento o por tono y descarga el resultado al instante.',
  applicationName: 'Viento Maestro',
  keywords: [
    'transpositor',
    'transponer acordes',
    'instrumentos de viento',
    'saxofón',
    'trompeta',
    'clarinete',
    'cambiar tonalidad',
    'partituras',
  ],
  openGraph: {
    title: 'Viento Maestro | Transpositor de música para instrumentos de viento',
    description:
      'Transpone acordes y notas por instrumento o por tono de manera rápida. Ideal para saxofón, trompeta, clarinete y más.',
    type: 'website',
    siteName: 'Viento Maestro',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Modo web-only (sin PWA install) */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      {/* Fijamos dark mode: si prefieres usar clase .dark en <html>, cámbialo según tu setup */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* ✅ El Toaster envuelve a toda la app para proveer el contexto que usa useToast() */}
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
