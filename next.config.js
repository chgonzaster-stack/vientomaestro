// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evitamos que el manifest y rutas típicas de SW se “persistan” en caches
  async headers() {
    return [
      // El manifest se sirve, pero sin cache y sin incentivar instalación
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
          // No índices ni sugiera instalación / store listings
          { key: 'X-Robots-Tag', value: 'noindex, noarchive, nofollow' }
        ]
      },

      // En caso de que algún navegador busque service workers por nombres comunes,
      // devolvemos siempre no-store (aunque además los redirigimos más abajo)
      {
        source: '/sw',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      },
      {
        source: '/service-worker.js',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      },
      {
        source: '/workbox-:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      },

      // Opcional: cabeceras de seguridad y de política de permisos
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // No tenemos nada que bloquee explícitamente PWA aquí, pero es buena práctica
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' }
        ]
      }
    ];
  },

  // Cortamos de raíz cualquier intento de acceder a rutas típicas de SW:
  // redirigimos a la home con 308 (permanente).
  async redirects() {
    return [
      { source: '/sw', destination: '/', permanent: true },
      { source: '/sw.js', destination: '/', permanent: true },
      { source: '/service-worker.js', destination: '/', permanent: true },
      { source: '/workbox-:path*', destination: '/', permanent: true }
    ];
  }
};

module.exports = nextConfig;
