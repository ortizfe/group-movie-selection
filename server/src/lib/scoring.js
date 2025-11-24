// server/src/lib/scoring.js
// Option B: continuous movie axes in [-1,+1] and continuous targets from UI [0..1].

function normalize01(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return 0.5;
  return Math.min(1, Math.max(0, x));
}

// Map legacy string vibe to 0..1 UI value (keeps old clients working)
function mapLegacyString(s, type) {
  if (typeof s !== 'string') return 0.5;
  const val = s.toLowerCase();
  if (type === 'tone') {
    if (val === 'light') return 1;
    if (val === 'heavy') return 0;
  } else if (type === 'pace') {
    if (val === 'calm') return 1;
    if (val === 'fast') return 0;
  } else if (type === 'feel') {
    if (val === 'comforting') return 1;
    if (val === 'challenging') return 0;
  }
  return 0.5; // neutral
}

// Convert UI value in [0,1] to target in [-1,+1]
function uiToTarget(x01) {
  return (normalize01(x01) * 2) - 1;
}

// Genre sets for each end of each axis (tweak as needed)
const GENRES = {
  tone: {
    pos: new Set(['Comedy','Animation','Family','Adventure','Romance']),
    neg: new Set(['Drama','Crime','War','History','Biography'])
  },
  pace: {
    pos: new Set(['Drama','Romance','Documentary']),
    neg: new Set(['Action','Thriller','Horror','Mystery','Adventure'])
  },
  feel: {
    pos: new Set(['Family','Comedy','Romance']),
    neg: new Set(['History','War','Mystery','Science Fiction','Sci-Fi'])
  }
};

// Compute a movie axis value in [-1,+1] by counting genres on both ends
function axisFromGenres(genres, axisKey) {
  const gs = GENRES[axisKey];
  if (!gs) return 0;
  const list = Array.isArray(genres) ? genres : [];
  let pos = 0, neg = 0;
  for (const g of list) {
    if (gs.pos.has(g)) pos++;
    if (gs.neg.has(g)) neg++;
  }
  const total = pos + neg;
  if (total === 0) return 0;
  return (pos - neg) / total;
}

// Per-axis match in [0,1]
function axisMatch(target, movieVal) {
  return 1 - (Math.abs(target - movieVal) / 2);
}

export function scoreMovie(genres, popularity, vibe) {
  const tone01 = (typeof vibe.tone === 'number') ? vibe.tone : mapLegacyString(vibe.tone, 'tone');
  const pace01 = (typeof vibe.pace === 'number') ? vibe.pace : mapLegacyString(vibe.pace, 'pace');
  const feel01 = (typeof vibe.feel === 'number') ? vibe.feel : mapLegacyString(vibe.feel, 'feel');

  const toneTarget = uiToTarget(tone01);
  const paceTarget = uiToTarget(pace01);
  const feelTarget = uiToTarget(feel01);

  const toneVal = axisFromGenres(genres, 'tone');
  const paceVal = axisFromGenres(genres, 'pace');
  const feelVal = axisFromGenres(genres, 'feel');

  const toneM = axisMatch(toneTarget, toneVal);
  const paceM = axisMatch(paceTarget, paceVal);
  const feelM = axisMatch(feelTarget, feelVal);

  const pop = Math.min(1, (popularity ?? 0) / 100); // tiny familiarity boost

  return 0.4 * toneM + 0.3 * paceM + 0.3 * feelM + 0.1 * pop;
}

// Optional: helper to expose internals for "Why this?"
export function debugExplain(genres, popularity, vibe) {
  const tone01 = (typeof vibe.tone === 'number') ? vibe.tone : mapLegacyString(vibe.tone, 'tone');
  const pace01 = (typeof vibe.pace === 'number') ? vibe.pace : mapLegacyString(vibe.pace, 'pace');
  const feel01 = (typeof vibe.feel === 'number') ? vibe.feel : mapLegacyString(vibe.feel, 'feel');

  const toneTarget = uiToTarget(tone01);
  const paceTarget = uiToTarget(pace01);
  const feelTarget = uiToTarget(feel01);

  const toneVal = axisFromGenres(genres, 'tone');
  const paceVal = axisFromGenres(genres, 'pace');
  const feelVal = axisFromGenres(genres, 'feel');

  const toneM = axisMatch(toneTarget, toneVal);
  const paceM = axisMatch(paceTarget, paceVal);
  const feelM = axisMatch(feelTarget, feelVal);

  return {
    target: { tone: toneTarget, pace: paceTarget, feel: feelTarget },
    axis:   { tone: toneVal, pace: paceVal, feel: feelVal },
    matches:{ tone: toneM, pace: paceM, feel: feelM },
    pop: Math.min(1, (popularity ?? 0) / 100)
  };
}
