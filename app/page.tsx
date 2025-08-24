'use client';

import { useEffect, useRef, useState } from 'react';
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

// Select (shadcn/Radix)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const tabs = ['instrumento', 'tono'] as const;
type Tab = (typeof tabs)[number];

/** Pequeña tarjeta visual del héroe */
function InstrumentCard({
  emoji,
  label,
}: {
  emoji: string;
  label: string;
}) {
  return (
    <div
      className="flex w-36 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center backdrop-blur-sm transition hover:bg-white/[0.05]"
      aria-label={label}
    >
      <div className="text-3xl">{emoji}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

export default function TransposerPage() {
  const [tab, setTab] = useState<Tab>('instrumento');

  // Por instrumento
  const [originInstrument, setOriginInstrument] = useState<InstrumentInfo | null>(null);
  const [targetInstrument, setTargetInstrument] = useState<InstrumentInfo | null>(null);

  // Por tono
  const [originKey, setOriginKey] = useState<ConcertKey | null>(null);
  const [targetKey, setTargetKey] = useState<ConcertKey | null>(null);

  // Entrada/Salida
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Otros
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  // Notación: ♯/♭/auto (se usa en transposeLine)
  const [notation, setNotation] = useState<Notation>('sharps');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => setYear(new Date().getFullYear()), []);

  /** Abrir picker de archivo */
  function handleFilePick() {
    fileInputRef.current?.click();
  }

  /** Leer archivo .txt */
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

  /** Ejecutar transposición */
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
        // por tono
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

  /** Copiar salida */
  async function copyOut() {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({ title: 'Copiado' });
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' });
    }
  }

  /** Descargar salida */
  function downloadOut() {
    if (!outputText) return;
    const name =
      prompt('Nombre del archivo .txt', 'transpuesto.txt') || 'transpuesto.txt';

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

  /** Limpiar todo */
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

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      {/* HERO con gradiente */}
      <section
        className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-blue-950/60 p-5 md:p-6"
        aria-label="Introducción a Viento Maestro"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">🎵 Viento Maestro</h1>
            {/* H2 SEO con keyword principal */}
            <h2 className="mt-1 text-sm opacity-90">
              Transpositor de música para instrumentos de viento
            </h2>
          </div>

          {/* Selector de notación */}
          <div className="w-44">
            <Select
              value={notation}
              onValueChange={(v) => setNotation(v as Notation)}
            >
              <SelectTrigger aria-label="Seleccionar notación">
                <SelectValue placeholder="Notación" />
              </SelectTrigger>
              <SelectContent className="z-50" position="popper" modal={false}>
                <SelectItem value="sharps">♯ Sostenidos</SelectItem>
                <SelectItem value="flats">♭ Bemoles</SelectItem>
                <SelectItem value="auto">Auto (según destino)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-4 text-sm opacity-80">
          Transpone partituras y acordes para instrumentos en C, Bb, Eb y F.
        </p>

        {/* Tarjetas de instrumentos */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <InstrumentCard emoji="🎷" label="Saxofón" />
          <InstrumentCard emoji="🎺" label="Trompeta" />
          <InstrumentCard emoji="🎶" label="Clarinete" />
          <InstrumentCard emoji="🪈" label="Flauta" />
        </div>
      </section>

      <Card className="mx-auto">
        <CardHeader>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} aria-label="Modo de transposición">
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Bloque corto SEO informativo */}
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            Convierte fácilmente partituras y cifras para <strong>saxofón, trompeta, clarinete y flauta</strong>.
            Elige instrumento de origen y destino, pega tus acordes (o carga un archivo .txt) y obtén la progresión
            transpuesta en segundos.
          </p>
        </CardHeader>

        <CardContent>
          {/* Tabs content */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            {/* === POR INSTRUMENTO === */}
            <TabsContent value="instrumento">
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {/* Origen */}
                <div>
                  <label className="text-sm font-medium" htmlFor="select-origen">
                    Instrumento de Origen
                  </label>
                  <div className="relative z-40">
                    <Select
                      value={originInstrument?.value ?? ''}
                      onValueChange={(v) =>
                        setOriginInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                      }
                    >
                      <SelectTrigger id="select-origen" aria-label="Seleccionar instrumento de origen">
                        <SelectValue placeholder="Seleccionar origen..." />
                      </SelectTrigger>
                      <SelectContent className="z-50" position="popper" modal={false}>
                        {INSTRUMENTS_DATA.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Destino */}
                <div>
                  <label className="text-sm font-medium" htmlFor="select-destino">
                    Instrumento de Destino
                  </label>
                  <div className="relative z-40">
                    <Select
                      value={targetInstrument?.value ?? ''}
                      onValueChange={(v) =>
                        setTargetInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                      }
                    >
                      <SelectTrigger id="select-destino" aria-label="Seleccionar instrumento de destino">
                        <SelectValue placeholder="Seleccionar destino..." />
                      </SelectTrigger>
                      <SelectContent className="z-50" position="popper" modal={false}>
                        {INSTRUMENTS_DATA.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* === POR TONO === */}
            <TabsContent value="tono">
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="select-tono-origen">
                    Tono Original
                  </label>
                  <div className="relative z-40">
                    <Select
                      value={originKey?.name ?? ''}
                      onValueChange={(v) =>
                        setOriginKey(concertKeys.find((k) => k.name === v) ?? null)
                      }
                    >
                      <SelectTrigger id="select-tono-origen" aria-label="Seleccionar tono original">
                        <SelectValue placeholder="Seleccionar tono..." />
                      </SelectTrigger>
                      <SelectContent className="z-50" position="popper" modal={false}>
                        {concertKeys.map((k) => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="select-tono-destino">
                    Tono Deseado
                  </label>
                  <div className="relative z-40">
                    <Select
                      value={targetKey?.name ?? ''}
                      onValueChange={(v) =>
                        setTargetKey(concertKeys.find((k) => k.name === v) ?? null)
                      }
                    >
                      <SelectTrigger id="select-tono-destino" aria-label="Seleccionar tono destino">
                        <SelectValue placeholder="Seleccionar tono..." />
                      </SelectTrigger>
                      <SelectContent className="z-50" position="popper" modal={false}>
                        {concertKeys.map((k) => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Entrada / salida */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Entrada */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="textarea-entrada">
                  Notas/Acordes Originales (Cifrado Americano)
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFilePick}
                    aria-label="Cargar archivo .txt"
                  >
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
                id="textarea-entrada"
                placeholder="Ej: C G Am F / Bb Eb Cm F7… o cargue un archivo .txt"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[220px]"
              />
              <p className="mt-1 text-xs opacity-70">
                Separe notas o acordes con espacios, comas o saltos de línea.
              </p>
            </div>

            {/* Salida */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="textarea-salida">
                  Notas/Acordes Transpuestos
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!outputText}
                    onClick={copyOut}
                    aria-label="Copiar resultado"
                  >
                    <ClipboardCopy size={16} /> Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!outputText}
                    onClick={downloadOut}
                    aria-label="Descargar resultado"
                  >
                    <Download size={16} /> Descargar
                  </Button>
                </div>
              </div>

              <Textarea
                id="textarea-salida"
                readOnly
                placeholder="Aquí aparecerá el resultado."
                value={outputText}
                className="min-h-[220px]"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={doTranspose} disabled={isLoading} aria-label="Transponer">
              <ArrowRightLeft size={18} />{' '}
              {isLoading ? 'Transponiendo…' : 'Transponer'}
            </Button>

            <Button variant="destructive" onClick={clearAll} aria-label="Limpiar todo">
              <Eraser size={18} /> Limpiar Todo
            </Button>
          </div>

          <footer className="mt-6 text-xs opacity-60">© {year ?? ''} Viento Maestro</footer>
        </CardContent>
      </Card>
    </main>
  );
}
