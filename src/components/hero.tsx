// src/components/hero.tsx
export default function Hero() {
  const items = [
    { emoji: '🎷', label: 'Saxofón' },
    { emoji: '🎺', label: 'Trompeta' },
    { emoji: '🪈', label: 'Clarinete' },
    { emoji: '🎼', label: 'Teoría' },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="mt-2 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-fuchsia-900/30 p-5 sm:p-7"
    >
      <h2 id="hero-title" className="sr-only">
        Instrumentos soportados
      </h2>
      <p className="mb-3 text-sm text-white/70">
        Transpone partituras y acordes para instrumentos en C, Bb, Eb y F.
      </p>

      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex flex-col items-center justify-center rounded-xl bg-white/5 px-2 py-3 text-center ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <span aria-hidden className="text-2xl sm:text-3xl">
              {it.emoji}
            </span>
            <span className="mt-1 text-xs text-white/80">{it.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
