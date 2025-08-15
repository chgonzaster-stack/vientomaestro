export const SHARP_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const FLAT_NOTES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

export type Notation = 'auto' | 'sharps' | 'flats';

function wrap12(i: number) {
  return ((i % 12) + 12) % 12;
}

function parseToken(tok: string) {
  const m = tok.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;
  return { root: m[1].toUpperCase(), acc: m[2] || '', rest: m[3] || '' };
}

function noteIndex(root: string, acc: string) {
  const n = root + acc;
  let i = SHARP_NOTES.indexOf(n);
  if (i !== -1) return i;
  i = FLAT_NOTES.indexOf(n);
  if (i !== -1) return i;
  if (n === 'E#') return SHARP_NOTES.indexOf('F');
  if (n === 'B#') return SHARP_NOTES.indexOf('C');
  if (n === 'Cb') return SHARP_NOTES.indexOf('B');
  if (n === 'Fb') return SHARP_NOTES.indexOf('E');
  return -1;
}

function formatNote(i: number, notation: 'sharps' | 'flats') {
  const idx = wrap12(i);
  return notation === 'flats' ? FLAT_NOTES[idx] : SHARP_NOTES[idx];
}

export function transposeSingleEntry(
  token: string,
  semitones: number,
  preferTargetFlats: boolean,
  notation: Notation = 'auto'
) {
  const p = parseToken(token);
  if (!p) return token;
  const idx = noteIndex(p.root, p.acc);
  if (idx < 0) return token;

  const chosen: 'sharps' | 'flats' =
    notation === 'auto' ? (preferTargetFlats ? 'flats' : 'sharps') : notation;

  const outRoot = formatNote(idx + semitones, chosen);
  return outRoot + p.rest;
}

export function transposeLine(
  line: string,
  semitones: number,
  preferTargetFlats: boolean,
  notation: Notation = 'auto'
) {
  return line.replace(/([A-Ga-g][#b]?[^ \t\n\r]*)/g, (m) =>
    transposeSingleEntry(m, semitones, preferTargetFlats, notation)
  );
}
