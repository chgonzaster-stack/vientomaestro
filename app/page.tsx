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

// Select (Radix/Shadcn)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Banner con instrumentos (nuevo)
import Hero from '@/components/hero';

const tabs = ['instrumento', 'tono'] as const;
type Tab = (typeof tabs)[number];

export default function TransposerPage() {
  const [tab, setTab] = useState<Tab>('instrumento');

  // Por instrumento
  const [originInstrument, setOriginInstrument] = useState<InstrumentInfo | null>(null);
  const [targetInstrument, setTargetInstrument] = useState<InstrumentInfo | null>(null);

  // Por tono
  const [originKey, setOriginKey] = useState<ConcertKey | null>(null);
  const [targetKey, setTargetKey] = useState<ConcertKey | null>(null);

  // Entrada / Salida
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Otros
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  // Notación: ♯/♭/auto
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
    <main className="mx-auto max-w-4xl p-4 md:p-8">
      <Card className="mx-auto my-6">
        {/* Cabecera SEO friendly */}
        <CardHeader className="pb-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold">🎵 Viento Maestro</h1>
              {/* H2 con la keyword principal (mejor peso semántico) */}
              <h2 className="mt-1 text-base text-white/80">
                Transpositor de música para instrumentos de viento
              </h2>
            </div>

            {/* Selector de notación a la derecha */}
            <div className="w-48">
              <Select value={notation} onValueChange={(v) => setNotation(v as Notation)}>
                <SelectTrigger>
                  <SelectValue placeholder="Notación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharps">♯ Sostenidos</SelectItem>
                  <SelectItem value="flats">♭ Bemoles</SelectItem>
                  <SelectItem value="auto">Auto (según destino)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Banner con instrumentos */}
        <div className="px-6">
          <Hero />
        </div>

        <CardContent>
          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>

            {/* === POR INSTRUMENTO === */}
            <TabsContent value="instrumento">
              <div className="mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Instrumento de Origen</label>
                    <Select
                      value={originInstrument?.value ?? ''}
                      onValueChange={(v) =>
                        setOriginInstrument(
                          INSTRUMENTS_DATA.find((i) => i.value === v) ?? null,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar origen..." />
                      </SelectTrigger>
                      <SelectContent forceMount>
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
                        setTargetInstrument(
                          INSTRUMENTS_DATA.find((i) => i.value === v) ?? null,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar destino..." />
                      </SelectTrigger>
                      <SelectContent forceMount>
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
              <div className="mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Tono Original</label>
                    <Select
                      value={originKey?.name ?? ''}
                      onValueChange={(v) =>
                        setOriginKey(concertKeys.find((k) => k.name === v) ?? null)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar tono..." />
                      </SelectTrigger>
                      <SelectContent forceMount>
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
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar tono..." />
                      </SelectTrigger>
                      <SelectContent forceMount>
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

            {/* Salida */}
            <div>
              <div className="mb-1 flex items-center justify-between">
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

          {/* Acciones */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={doTranspose} disabled={isLoading}>
              <ArrowRightLeft size={18} /> {isLoading ? 'Transponiendo…' : 'Transponer'}
            </Button>

            <Button variant="destructive" onClick={clearAll}>
              <Eraser size={18} /> Limpiar Todo
            </Button>
          </div>

          <footer className="mt-6 text-xs opacity-60">© {year ?? ''} Viento Maestro</footer>
        </CardContent>
      </Card>
    </main>
  );
}
