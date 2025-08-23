// app/page.tsx
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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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

  // Entrada/Salida
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Otros
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  // Notación
  const [notation, setNotation] = useState<Notation>('sharps');

  // Dropdown abierto (para no superponer: agregamos espaciador)
  const [originOpen, setOriginOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [originKeyOpen, setOriginKeyOpen] = useState(false);
  const [targetKeyOpen, setTargetKeyOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => setYear(new Date().getFullYear()), []);

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
      <Card className="mx-auto my-6 overflow-visible">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                🎵 Viento Maestro
              </h1>
              <h2 className="mt-1 text-sm opacity-80">
                Transpositor de música para instrumentos de viento
              </h2>
            </div>

            <div className="w-44">
              <Select value={notation} onValueChange={(v) => setNotation(v as Notation)}>
                <SelectTrigger>
                  <SelectValue placeholder="Notación" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={8} align="start" className="z-[9999]">
                  <SelectItem value="sharps">♯ Sostenidos</SelectItem>
                  <SelectItem value="flats">♭ Bemoles</SelectItem>
                  <SelectItem value="auto">Auto (según destino)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* HERO con iconos (Clarinete en SVG + Flauta SVG) */}
          <div className="mt-5 rounded-xl bg-muted/30 px-4 py-3">
            <p className="text-sm opacity-90 mb-3">
              Transpone partituras y acordes para instrumentos en C, Bb, Eb y F.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Saxofón */}
              <div className="rounded-lg bg-background/60 border px-4 py-3">
                <div className="text-2xl">🎷</div>
                <div className="mt-2 text-sm font-medium">Saxofón</div>
              </div>

              {/* Trompeta */}
              <div className="rounded-lg bg-background/60 border px-4 py-3">
                <div className="text-2xl">🎺</div>
                <div className="mt-2 text-sm font-medium">Trompeta</div>
              </div>

              {/* Clarinete (SVG simple) */}
              <div className="rounded-lg bg-background/60 border px-4 py-3">
                <svg
                  viewBox="0 0 140 24"
                  className="h-6 w-[140px] text-foreground/80"
                  aria-label="Clarinete"
                >
                  {/* cuerpo */}
                  <rect x="8" y="9" width="120" height="6" rx="3" className="fill-current opacity-80" />
                  {/* campana */}
                  <path d="M130 9 h6 c2 0 2 6 0 6 h-6 z" className="fill-current opacity-80" />
                  {/* boquilla */}
                  <path d="M8 9 l-6 2 6 2 z" className="fill-current opacity-80" />
                  {/* llaves */}
                  <circle cx="28" cy="12" r="2" className="fill-background" />
                  <circle cx="46" cy="12" r="2" className="fill-background" />
                  <circle cx="64" cy="12" r="2" className="fill-background" />
                  <circle cx="82" cy="12" r="2" className="fill-background" />
                  <circle cx="100" cy="12" r="2" className="fill-background" />
                  <circle cx="118" cy="12" r="2" className="fill-background" />
                </svg>
                <div className="mt-2 text-sm font-medium">Clarinete</div>
              </div>

              {/* Flauta (SVG simple) */}
              <div className="rounded-lg bg-background/60 border px-4 py-3">
                <svg
                  viewBox="0 0 120 24"
                  className="h-6 w-[120px] text-foreground/80"
                  aria-label="Flauta"
                >
                  <rect x="2" y="9" width="116" height="6" rx="3" className="fill-current opacity-80" />
                  <circle cx="24" cy="12" r="2" className="fill-background" />
                  <circle cx="44" cy="12" r="2" className="fill-background" />
                  <circle cx="64" cy="12" r="2" className="fill-background" />
                  <circle cx="84" cy="12" r="2" className="fill-background" />
                  <circle cx="104" cy="12" r="2" className="fill-background" />
                </svg>
                <div className="mt-2 text-sm font-medium">Flauta</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-visible">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>

            {/* === POR INSTRUMENTO === */}
            <TabsContent value="instrumento">
              <div className="mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {/* Origen */}
                  <div className="relative overflow-visible">
                    <label className="text-sm font-medium">Instrumento de Origen</label>
                    <Select
                      open={originOpen}
                      onOpenChange={setOriginOpen}
                      value={originInstrument?.value ?? ''}
                      onValueChange={(v) =>
                        setOriginInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                      }
                    >
                      <SelectTrigger />
                      <SelectContent position="popper" sideOffset={8} align="start" className="z-[9999]">
                        {INSTRUMENTS_DATA.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* espaciador mientras el dropdown está abierto */}
                    {originOpen && <div className="h-44" />}
                  </div>

                  {/* Destino */}
                  <div className="relative overflow-visible">
                    <label className="text-sm font-medium">Instrumento de Destino</label>
                    <Select
                      open={targetOpen}
                      onOpenChange={setTargetOpen}
                      value={targetInstrument?.value ?? ''}
                      onValueChange={(v) =>
                        setTargetInstrument(INSTRUMENTS_DATA.find((i) => i.value === v) ?? null)
                      }
                    >
                      <SelectTrigger />
                      <SelectContent position="popper" sideOffset={8} align="start" className="z-[9999]">
                        {INSTRUMENTS_DATA.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {targetOpen && <div className="h-44" />}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* === POR TONO === */}
            <TabsContent value="tono">
              <div className="mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="relative overflow-visible">
                    <label className="text-sm font-medium">Tono Original</label>
                    <Select
                      open={originKeyOpen}
                      onOpenChange={setOriginKeyOpen}
                      value={originKey?.name ?? ''}
                      onValueChange={(v) =>
                        setOriginKey(concertKeys.find((k) => k.name === v) ?? null)
                      }
                    >
                      <SelectTrigger />
                      <SelectContent position="popper" sideOffset={8} align="start" className="z-[9999]">
                        {concertKeys.map((k) => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {originKeyOpen && <div className="h-44" />}
                  </div>

                  <div className="relative overflow-visible">
                    <label className="text-sm font-medium">Tono Deseado</label>
                    <Select
                      open={targetKeyOpen}
                      onOpenChange={setTargetKeyOpen}
                      value={targetKey?.name ?? ''}
                      onValueChange={(v) =>
                        setTargetKey(concertKeys.find((k) => k.name === v) ?? null)
                      }
                    >
                      <SelectTrigger />
                      <SelectContent position="popper" sideOffset={8} align="start" className="z-[9999]">
                        {concertKeys.map((k) => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {targetKeyOpen && <div className="h-44" />}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Entrada / salida */}
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {/* Entrada */}
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

            {/* Salida */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">
                  Notas/Acordes Transpuestos
                </label>
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
