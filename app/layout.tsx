// app/layout.tsx
import '../src/app/globals.css';        // antes decía './src/app/globals.css'
import { Toaster } from '@/components/ui/toast';     // quitar '/src'
import SWRegister from '@/components/sw-register';   // quitar '/src'


export const metadata = { title: 'Viento Maestro', description: 'Transpositor de música para instrumentos de viento' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1e40af" />
<link rel="icon" href="/icons/icon-192.png" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen antialiased">
        <Toaster>
          <SWRegister />
          {children}
        </Toaster>
      </body>
    </html>
  );
}
