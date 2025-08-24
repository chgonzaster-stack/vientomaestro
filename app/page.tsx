'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ArrowRightLeft, ClipboardCopy, Download, Eraser, Upload } from 'lucide-react';

import {
  INSTRUMENTS_DATA,
  type InstrumentInfo,
  concertKeys,
  type ConcertKey,
} from '@/constants/instruments';

import { transposeLine, type Notation } from '@/lib/transposition';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';

// Radix/shadcn Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const tabs = ['instrumento', 'tono'] as const;
type Tab = (typeof tabs)[number];

export default function Page() {
  /* ------------------------------ App state ------------------------------ */
  const [tab, setTab] = useState<Tab>('instrumento');

  const [originInstrument, setOriginInstrument] = useState<InstrumentInfo | null>(null);
  const [targetInstrument, setTargetInstrument] = useState<InstrumentInfo | null>(null);

  const [originKey, setOriginKey] = useState<ConcertKey | null>(null);
  const [targetKey, setTargetKey] = useState<ConcertKey | null>(null);

  const [notation, setNotation] = useState<Notation>('sharps');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  useEffect(() => setYear(new Date().getFullYear()), []);

  /* ------------------------------ Handlers ------------------------------ */
  function handleFilePick() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast({ title: 'Archivo no válido', description: 'Solo .txt', variant: 'destructive' });
      e.currentTarget.value = '';
      return;
    }

    const text = await file.text();
    setInputText(text);
    e.currentTarget.value = '';
    toast({ title: 'Archivo cargado' });
  }

  function doTranspose() {
    setIsLoading(true);
    try {
      if (tab === 'instrumento') {
        if (!originInstrument || !targetInstrument || !inputText.trim()) {
          toast({ title: 'Completa los campos requeridos', variant: 'destructive' });
          return;
        }
        const semitones =
          targetInstrument.transposeSemitones - originInstrument.transposeSemitones;
        const prefersFlats = targetInstrument.prefersFlats ?? false;
        const out = inputText
          .split('\n')
          .map((line) => transposeLine(line, semitones, prefersFlats, notation))
          .join('\n');
        setOutputText(out);
      } else {
        if (!originKey || !targetKey || !inputText.trim()) {
          toast({ title: 'Completa los campos requeridos', variant: 'destructive' });
          return;
        }
        const semitones = targetKey.value - originKey.value;
        const prefersFlats = targetKey.prefersFlats ?? false;
        const out = inputText
          .split('\n')
          .map((line) => transposeLine(line, semitones, prefersFlats, notation))
          .join('\n');
        setOutputText(out);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error de transposición', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyOut() {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({ title: 'Copiado' });
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' });
    }
  }

  function downloadOut() {
    if (!outputText) return;
    const name = prompt('Nombre del archivo .txt', 'transpuesto.txt') || 'transpuesto.txt';
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.endsWith('.txt') ? name : `${name}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: 'Descargado' });
  }

  function clearAll() {
    setTab('instrumento');
    setOriginInstrument(null);
    setTargetInstrument(null);
    setOriginKey(null);
    setTargetKey(null);
    setInputText('');
    setOutputText('');
    toast({ title: 'Campos reiniciados' });
  }

  /* ------------------------------- Render ------------------------------- */
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8 space-y-10">
      {/* =========================== HERO / SEO =========================== */}
      <header className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          🎵 Viento Maestro
        </h1>
        <h2 className="text-lg md:text-xl opacity-90">
          Transpositor de música para instrumentos de viento
        </h2>
        <p className="max-w-3xl mx-auto opacity-80">
          Transpone partituras y acordes para <strong>saxofón, trompeta, clarinete y flauta</strong> en
          segundos. Cambia tonalidades por instrumento o por tono y descarga el resultado en un
          archivo <code>.txt</code>.
        </p>
      </header>

      {/* JSON-LD: SoftwareApplication */}
      <Script id="ld-software" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Viento Maestro',
          applicationCategory: 'MusicApplication',
          operatingSystem: 'Web',
          description:
            'Transpositor de música para instrumentos de viento: saxofón, trompeta, clarinete y flauta.',
          url: 'https://www.vientomaestro.com',
        })}
      </Script>

      {/* =============== Banner de instrumentos (ilustrativo) =============== */}
      <section
        aria-label="Instrumentos compatibles"
        className="rounded-2xl border bg-background/40 p-4 md:p-6"
      >
        <p className="opacity-80 mb-4 text-center">
          Compatible con instrumentos en <strong>C, Bb, Eb y F</strong>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-background p-4 text-center space-y-2">
            <span role="img" aria-label="Saxofón" className="text-3xl md:text-4xl">
              🎷
            </span>
            <p className="text-sm font-medium">Saxofón</p>
          </div>
          <div className="rounded-xl border bg-background p-4 text-center space-y-2">
            <span role="img" aria-label="Trompeta" className="text-3xl md:text-4xl">
              🎺
            </span>
            <p className="text-sm font-medium">Trompeta</p>
          </div>
          <div className="rounded-xl border bg-background p-4 text-center space-y-2">
            <span role="img" aria-label="Clarinete" className="text-3xl md:text-4xl">
              🧰
            </span>
            <p className="text-sm font-medium">Clarinete</p>
          </div>
          <div className="rounded-xl border bg-background p-4 text-center space-y-2">
            <span role="img" aria-label="Flauta" className="text-3xl md:text-4xl">
              🪈
            </span>
            <p className="text-sm font-medium">Flauta</p>
          </div>
        </div>
      </section>

      {/* ============================ Transpositor =========================== */}
      <Card className="mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Transponer</h3>
              <p className="text-sm opacity-80">
                Elige el método de transposición y pega o carga tu archivo <code>.txt</code>.
              </p>
            </div>

            {/* Selector de notación (opcional para el usuario) */}
            <div className="w-44">
              <Select value={notation} onValueChange={(v) => setNotation(v as Notation)}>
                <SelectTrigger aria-label="Seleccionar notación">
                  <SelectValue placeholder="Notación" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="sharps">♯ Sostenidos</SelectItem>
                  <SelectItem value="flats">♭ Bemoles</SelectItem>
                  <SelectItem value="auto">Auto (según destino)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>

            {/* === POR INSTRUMENTO === */}
            <TabsContent value="instrumento" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Instrumento de Origen</label>
                  <Select
                    value={originInstrument?.value ?? ''}
                    onValueChange={(v) =>
                      setOriginInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                    }
                  >
                    <SelectTrigger aria-label="Instrumento de origen">
                      <SelectValue placeholder="Seleccionar origen..." />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {INSTRUMENTS_DATA.map((i) => (
                        <SelectItem key={i.value} value={i.value}>
                          {i.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Instrumento de Destino</label>
                  <Select
                    value={targetInstrument?.value ?? ''}
                    onValueChange={(v) =>
                      setTargetInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                    }
                  >
                    <SelectTrigger aria-label="Instrumento de destino">
                      <SelectValue placeholder="Seleccionar destino..." />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {INSTRUMENTS_DATA.map((i) => (
                        <SelectItem key={i.value} value={i.value}>
                          {i.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* === POR TONO === */}
            <TabsContent value="tono" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Tono Original</label>
                  <Select
                    value={originKey?.name ?? ''}
                    onValueChange={(v) =>
                      setOriginKey(concertKeys.find((k) => k.name === v) ?? null)
                    }
                  >
                    <SelectTrigger aria-label="Tono original">
                      <SelectValue placeholder="Seleccionar tono..." />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {concertKeys.map((k) => (
                        <SelectItem key={k.name} value={k.name}>
                          {k.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tono Deseado</label>
                  <Select
                    value={targetKey?.name ?? ''}
                    onValueChange={(v) =>
                      setTargetKey(concertKeys.find((k) => k.name === v) ?? null)
                    }
                  >
                    <SelectTrigger aria-label="Tono deseado">
                      <SelectValue placeholder="Seleccionar tono..." />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {concertKeys.map((k) => (
                        <SelectItem key={k.name} value={k.name}>
                          {k.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Entrada / salida */}
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">
                  Notas/Acordes Originales (Cifrado Americano)
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilePick}>
                    <Upload size={16} /> Cargar Archivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Ej: C G Am F / Bb Eb Cm F7… o cargue un archivo .txt"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[220px]"
              />
              <p className="mt-1 text-xs opacity-70">
                Separe notas o acordes con espacios, comas o saltos de línea.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Notas/Acordes Transpuestos</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!outputText} onClick={copyOut}>
                    <ClipboardCopy size={16} /> Copiar
                  </Button>
                  <Button variant="outline" size="sm" disabled={!outputText} onClick={downloadOut}>
                    <Download size={16} /> Descargar
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                placeholder="Aquí aparecerá el resultado."
                value={outputText}
                className="min-h-[220px]"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={doTranspose} disabled={isLoading}>
              <ArrowRightLeft size={18} /> {isLoading ? 'Transponiendo…' : 'Transponer'}
            </Button>
            <Button variant="destructive" onClick={clearAll}>
              <Eraser size={18} /> Limpiar Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================== Cómo funciona ========================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cómo funciona</h2>
        <ol className="list-decimal pl-5 space-y-2 opacity-90">
          <li>Elige <strong>Por Instrumento</strong> o <strong>Por Tono</strong>.</li>
          <li>Pega tus acordes/cifrado en el área izquierda o carga un <code>.txt</code>.</li>
          <li>Haz clic en <em>Transponer</em> y copia o descarga el resultado.</li>
        </ol>
      </section>

      {/* =============================== FAQ =============================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>

        <details className="rounded-lg border p-4 bg-background/40">
          <summary className="cursor-pointer font-medium">¿Qué instrumentos soporta?</summary>
          <p className="mt-2 opacity-90">
            Instrumentos en <strong>C, Bb, Eb y F</strong> como saxofón, trompeta, clarinete y flauta.
          </p>
        </details>

        <details className="rounded-lg border p-4 bg-background/40">
          <summary className="cursor-pointer font-medium">¿Qué notación usa?</summary>
          <p className="mt-2 opacity-90">
            Puedes elegir <em>♯ Sostenidos</em>, <em>♭ Bemoles</em> o <em>Auto</em> según el destino.
          </p>
        </details>

        <details className="rounded-lg border p-4 bg-background/40">
          <summary className="cursor-pointer font-medium">¿Puedo usarlo en el móvil?</summary>
          <p className="mt-2 opacity-90">Sí, la aplicación es responsive y funciona en móviles.</p>
        </details>
      </section>

      {/* ========================= Mini artículos/blog ========================= */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Recursos para músicos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border p-4 bg-background/40">
            <h3 className="font-medium">Cómo transportar de C a Bb en segundos</h3>
            <p className="opacity-80 mt-1">
              Guía rápida para saxofón/clarinete en Bb cuando recibes partituras en C.
            </p>
          </article>
          <article className="rounded-xl border p-4 bg-background/40">
            <h3 className="font-medium">Transposición por instrumento vs por tono</h3>
            <p className="opacity-80 mt-1">
              Cuándo conviene cada método y cómo evitar errores comunes.
            </p>
          </article>
        </div>
      </section>

      <footer className="pt-6 text-center text-xs opacity-60">
        © {year ?? ''} Viento Maestro · Diseñado para músicos.
      </footer>
    </main>
  );
}
