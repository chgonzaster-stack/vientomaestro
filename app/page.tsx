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
type Tab = typeof tabs[number];

export default function TransposerPage() {
  const [tab, setTab] = useState<Tab>('instrumento');

  const [originInstrument, setOriginInstrument] = useState<InstrumentInfo | null>(null);
  const [targetInstrument, setTargetInstrument] = useState<InstrumentInfo | null>(null);

  const [originKey, setOriginKey] = useState<ConcertKey | null>(null);
  const [targetKey, setTargetKey] = useState<ConcertKey | null>(null);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  const [notation, setNotation] = useState<Notation>('sharps');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => setYear(new Date().getFullYear()), []);

  function handleFilePick() { fileInputRef.current?.click(); }

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
          toast({ title: 'Completa los campos requeridos', variant: 'destructive' }); return;
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
          toast({ title: 'Completa los campos requeridos', variant: 'destructive' }); return;
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
    try { await navigator.clipboard.writeText(outputText); toast({ title: 'Copiado' }); }
    catch { toast({ title: 'No se pudo copiar', variant: 'destructive' }); }
  }

  function downloadOut() {
    if (!outputText) return;
    const name = prompt('Nombre del archivo .txt', 'transpuesto.txt') || 'transpuesto.txt';
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name.endsWith('.txt') ? name : `${name}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
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
      <Card className="mx-auto my-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                🎵 Viento Maestro <span className="opacity-60">🎶</span>
              </h1>
              <h2 className="text-base opacity-90 font-medium">
                Transpositor de música para instrumentos de viento
              </h2>
            </div>

            {/* Notación */}
            <div className="w-44">
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

          {/* Banner de instrumentos (emojis) */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <div className="text-3xl leading-none">🎷</div>
              <div className="mt-2 text-sm font-medium">Saxofón</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <div className="text-3xl leading-none">🎺</div>
              <div className="mt-2 text-sm font-medium">Trompeta</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              {/* si tienes otro emoji de clarinete, cámbialo aquí */}
              <div className="text-3xl leading-none">🎼</div>
              <div className="mt-2 text-sm font-medium">Clarinete</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <div className="text-3xl leading-none">🎶</div>
              <div className="mt-2 text-sm font-medium">Flauta</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>

            {/* === POR INSTRUMENTO === */}
            <TabsContent value="instrumento">
              <div className="grid gap-3 md:grid-cols-2 mt-4">
                <div>
                  <label className="text-sm font-medium">Instrumento de Origen</label>
                  <Select
                    value={originInstrument?.value ?? ""}
                    onValueChange={(v) =>
                      setOriginInstrument(INSTRUMENTS_DATA.find(i => i.value === v) ?? null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar origen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENTS_DATA.map(i => (
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
                    value={targetInstrument?.value ?? ""}
                    onValueChange={(v) =>
                      setTargetInstrument(INSTRUMENTS_DATA.find(i => i.value === v) ?? null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar destino..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENTS_DATA.map(i => (
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
            <TabsContent value="tono">
              <div className="grid gap-3 md:grid-cols-2 mt-4">
                <div>
                  <label className="text-sm font-medium">Tono Original</label>
                  <Select
                    value={originKey?.name ?? ""}
                    onValueChange={(v) =>
                      setOriginKey(concertKeys.find(k => k.name === v) ?? null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tono..." />
                    </SelectTrigger>
                    <SelectContent>
                      {concertKeys.map(k => (
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
                    value={targetKey?.name ?? ""}
                    onValueChange={(v) =>
                      setTargetKey(concertKeys.find(k => k.name === v) ?? null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tono..." />
                    </SelectTrigger>
                    <SelectContent>
                      {concertKeys.map(k => (
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
