'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, ClipboardCopy, Download, Eraser, Upload } from 'lucide-react';

import { INSTRUMENTS_DATA, type InstrumentInfo, concertKeys, type ConcertKey } from '@/constants/instruments';
import { transposeLine, type Notation } from '@/lib/transposition';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import ThemeToggle from '@/components/theme-toggle';
import InstallPWAButton from '@/components/install-pwa';

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
        const semitones = targetInstrument.transposeSemitones - originInstrument.transposeSemitones;
        const prefersFlats = targetInstrument.prefersFlats ?? false;
        const out = inputText.split('\n').map(line => transposeLine(line, semitones, prefersFlats, notation)).join('\n');
        setOutputText(out);
      } else {
        if (!originKey || !targetKey || !inputText.trim()) {
          toast({ title: 'Completa los campos requeridos', variant: 'destructive' }); return;
        }
        const semitones = targetKey.value - originKey.value;
        const prefersFlats = targetKey.prefersFlats ?? false;
        const out = inputText.split('\n').map(line => transposeLine(line, semitones, prefersFlats, notation)).join('\n');
        setOutputText(out);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error de transposición', variant: 'destructive' });
    } finally { setIsLoading(false); }
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
    const a = document.createElement('a'); a.href = url; a.download = name.endsWith('.txt') ? name : name + '.txt';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast({ title: 'Descargado' });
  }
  function clearAll() {
    setTab('instrumento'); setOriginInstrument(null); setTargetInstrument(null);
    setOriginKey(null); setTargetKey(null); setInputText(''); setOutputText('');
    toast({ title: 'Campos reiniciados' });
  }

  return (
    <main className="mx-auto max-w-4xl p-4 md:p-8">
      <Card className="mx-auto my-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-2">🎵 Viento Maestro</h1>
              <p className="text-sm opacity-80">Transpositor de música para instrumentos de viento</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value as Notation)}
                className="rounded-md border px-2 py-1 text-sm"
                title="Notación"
              >
                <option value="sharps">♯ Sostenidos</option>
                <option value="flats">♭ Bemoles</option>
                <option value="auto">Auto (según destino)</option>
              </select>
              <InstallPWAButton/>
              <ThemeToggle/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v)=>setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="instrumento">Por Instrumento</TabsTrigger>
              <TabsTrigger value="tono">Por Tono</TabsTrigger>
            </TabsList>

            <TabsContent value="instrumento">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Instrumento de Origen</label>
                  <Select value={originInstrument?.value ?? ''} onChange={e => setOriginInstrument(INSTRUMENTS_DATA.find(i=>i.value===e.target.value) ?? null)}>
                    <option value="">Seleccionar origen...</option>
                    {INSTRUMENTS_DATA.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Instrumento de Destino</label>
                  <Select value={targetInstrument?.value ?? ''} onChange={e => setTargetInstrument(INSTRUMENTS_DATA.find(i=>i.value===e.target.value) ?? null)}>
                    <option value="">Seleccionar destino...</option>
                    {INSTRUMENTS_DATA.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tono">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Tono Original</label>
                  <Select value={originKey?.name ?? ''} onChange={e => setOriginKey(concertKeys.find(k=>k.name===e.target.value) ?? null)}>
                    <option value="">Seleccionar tono...</option>
                    {concertKeys.map(k => <option key={k.name} value={k.name}>{k.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tono Deseado</label>
                  <Select value={targetKey?.name ?? ''} onChange={e => setTargetKey(concertKeys.find(k=>k.name===e.target.value) ?? null)}>
                    <option value="">Seleccionar tono...</option>
                    {concertKeys.map(k => <option key={k.name} value={k.name}>{k.name}</option>)}
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Notas/Acordes Originales (Cifrado Americano)</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilePick}><Upload size={16}/> Cargar Archivo</Button>
                  <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={onFileChange} />
                </div>
              </div>
              <Textarea placeholder="Ej: C G Am F / Bb Eb Cm F7… o cargue un archivo .txt" value={inputText} onChange={e=>setInputText(e.target.value)} />
              <p className="mt-1 text-xs opacity-70">Separe notas o acordes con espacios, comas o saltos de línea.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Notas/Acordes Transpuestos</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!outputText} onClick={copyOut}><ClipboardCopy size={16}/> Copiar</Button>
                  <Button variant="outline" size="sm" disabled={!outputText} onClick={downloadOut}><Download size={16}/> Descargar</Button>
                </div>
              </div>
              <Textarea readOnly placeholder="Aquí aparecerá el resultado." value={outputText} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={doTranspose} disabled={isLoading}><ArrowRightLeft size={18}/> {isLoading?'Transponiendo…':'Transponer'}</Button>
            <Button variant="destructive" onClick={clearAll}><Eraser size={18}/> Limpiar Todo</Button>
          </div>

          <footer className="mt-6 text-xs opacity-60">© {year ?? ''} Viento Maestro</footer>
        </CardContent>
      </Card>
    </main>
  );
}
