export function scoreMovie(genres, popularity, vibe) {
    const toneLight = new Set(['Comedy','Animation','Family','Adventure']);
    const toneHeavy = new Set(['Drama','Crime','War','History','Biography']);
    const paceCalm  = new Set(['Drama','Romance','Documentary']);
    const paceFast  = new Set(['Action','Thriller','Horror','Mystery']);
    const feelComf  = new Set(['Family','Comedy','Romance']);
    const feelChal  = new Set(['History','War','Mystery','Science Fiction','Sci-Fi']);

    const has = (set) => genres?.some(g => set.has(g)) ? 1 : 0;

    const tone = has(toneLight) - has(toneHeavy);
    const pace = has(paceCalm) - has(paceFast);
    const feel = has(feelComf) - has(feelChal);

    const toneTarget = vibe.tone === 'light' ? 1 : vibe.tone === 'heavy' ? -1 : 0;
    const paceTarget = vibe.pace === 'calm' ? 1 : vibe.pace === 'fast' ? -1 : 0;
    const feelTarget = vibe.feel === 'comforting' ? 1 : vibe.feel === 'challenging' ? -1 : 0;

    const match = (t, v) => 1 - Math.abs(t - v);
    const toneMatch = match(toneTarget, tone);
    const paceMatch = match(paceTarget, pace);
    const feelMatch = match(feelTarget, feel);
    const pop = Math.min(1, (popularity ?? 0) / 100); // tiny familiarity boost
  
    return 0.4*toneMatch + 0.3*paceMatch + 0.3*feelMatch + 0.1*pop;
  }