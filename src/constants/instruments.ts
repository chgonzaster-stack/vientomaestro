export type InstrumentInfo = {
  label: string;
  value: string;
  transposeSemitones: number;
  prefersFlats?: boolean;
};

export const INSTRUMENTS_DATA: InstrumentInfo[] = [
  { label: 'C / Concierto (piano, flauta)', value: 'C', transposeSemitones: 0, prefersFlats: false },
  { label: 'Bb / Sib (trompeta, clarinete Bb)', value: 'Bb', transposeSemitones: 2, prefersFlats: true },
  { label: 'Eb / Mib (sax alto, barítono)', value: 'Eb', transposeSemitones: -3, prefersFlats: true },
  { label: 'F (corno)', value: 'F', transposeSemitones: -5, prefersFlats: true },
];

export type ConcertKey = { name: string; value: number; prefersFlats?: boolean };

export const concertKeys: ConcertKey[] = [
  { name: 'C', value: 0 },
  { name: 'Db', value: 1, prefersFlats: true },
  { name: 'D', value: 2 },
  { name: 'Eb', value: 3, prefersFlats: true },
  { name: 'E', value: 4 },
  { name: 'F', value: 5, prefersFlats: true },
  { name: 'Gb', value: 6, prefersFlats: true },
  { name: 'G', value: 7 },
  { name: 'Ab', value: 8, prefersFlats: true },
  { name: 'A', value: 9 },
  { name: 'Bb', value: 10, prefersFlats: true },
  { name: 'B', value: 11 },
];
