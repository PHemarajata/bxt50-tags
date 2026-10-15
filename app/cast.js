// Committee pets for the scanner app, ported from the design system's components/artwork/cast.js.
// Rules carried over from the design system:
//   - one pet per screen, and a different pet on each screen (pets already used are passed as `exclude`)
//   - pick by what the screen is for (PURPOSE), never by hand, rotating so no pet dominates
//   - cuts are transparent with a white keyline baked in: no border or shadow, never clipped by accident
// Mali & Khanom were retired on 9 October 2026 and are not used here.

export const CAST = [
  { key: 'khaitoon', th: 'ไข่ตุ๋น', owner: 'khun Fern' },
  { key: 'jeed', th: 'จี๊ด', owner: 'khun Fern' },
  { key: 'makuea-mangkood', th: 'มะเขือ & มังคุด', owner: 'khun Benz' },
  { key: 'jujee', th: 'จู๋จี๋', owner: 'P' },
  { key: 'raptor', th: 'Raptor', owner: 'khun Eye' },
  { key: 'toom', th: 'ตู้ม', owner: 'khun Fern' },
  { key: 'meow', th: 'เหมียว', owner: 'P' },
];

// Same table as the design system. Only the purposes this app and its user guide use need their poses shipped.
export const PURPOSE = {
  welcome:     ['hello', 'hero'],
  notice:      ['notice', 'sign', 'hero'],
  maintenance: ['repair', 'sign', 'notice'],
  prohibition: ['stop', 'notice'],
  tip:         ['info', 'notice'],
  teaser:      ['peek'],
  neutral:     ['hero', 'sit', 'front'],
};

// Poses shipped in assets/cast/<key>/<pose>.webp (resized from the design system's 103 cuts).
// To add a pose: copy the cut from the design system, save it as WebP here, and list it below.
const SHIPPED = {
  'khaitoon':        ['hello', 'hero', 'notice'],
  'jeed':            ['hello', 'hero', 'notice'],
  'makuea-mangkood': ['hello', 'hero', 'front', 'peek', 'sign'],
  'jujee':           ['hello', 'hero', 'front', 'peek', 'sign'],
  'raptor':          ['hero', 'front', 'repair'],
  'toom':            ['hero'],
  'meow':            ['hello', 'hero', 'info', 'notice', 'sign', 'sit', 'stop'],
};

export function hasPose(key, pose) { return (SHIPPED[key] || []).includes(pose); }
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/** Every (character, pose) that can carry a purpose, best gesture first, then cast order. */
export function candidates(purpose, exclude = []) {
  const wanted = PURPOSE[purpose] || PURPOSE.neutral;
  const skip = new Set(exclude);
  const out = [];
  wanted.forEach((pose, rank) => {
    for (const c of CAST) {
      if (skip.has(c.key) || !hasPose(c.key, pose)) continue;
      if (out.some(o => o.key === c.key)) continue;
      out.push({ key: c.key, pose, th: c.th, name: `${c.key}-${pose}`, rank });
    }
  });
  return out;
}

/** Same as the design system's pickCast(purpose, seq, exclude). */
export function pickCast(purpose, seq = 0, exclude = []) {
  const n = typeof seq === 'number' ? seq : hash(seq);
  const pool = candidates(purpose, exclude);
  if (pool.length) { const p = pool[n % pool.length]; return { ...p, fallback: false }; }
  const order = CAST.filter(c => !exclude.includes(c.key));
  const c = order[n % order.length];
  const pose = PURPOSE.neutral.find(p => hasPose(c.key, p)) || 'hero';
  return { key: c.key, pose, name: `${c.key}-${pose}`, th: c.th, fallback: true };
}

// The app's screens, in the order pets are handed out, and what each screen is for.
// recordOk / recordBad are the two faces of the tag result screen (valid vs. expired, lost or cancelled).
export const SCREENS = [
  ['login', 'welcome'],
  ['scan', 'teaser'],
  ['recordOk', 'welcome'],
  ['recordBad', 'prohibition'],
  ['history', 'notice'],
  ['users', 'neutral'],
  ['edit', 'maintenance'],
];

/** One pet per screen for the given day. The line-up changes every day (Bangkok date). */
export function castForDay(date = new Date()) {
  const bkk = new Date(date.getTime() + 7 * 3600000);
  const seq = Math.floor(bkk.getTime() / 86400000);
  const used = [], out = {};
  for (const [screen, purpose] of SCREENS) {
    const p = pickCast(purpose, seq, used);
    used.push(p.key);
    out[screen] = { ...p, src: `assets/cast/${p.key}/${p.pose}.webp` };
  }
  return out;
}
