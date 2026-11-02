// Confirmed textual errors only. Route paths, image filenames and proper names are unchanged.
export const spellingCorrections = {
  '/materials/kovar-cnc-machining': [
    [/\bKoval Precision Machining Technology\b/g, 'Kovar Precision Machining Technology'],
  ],
  '/materials/polycarbonate-cnc-machining': [
    [/\bolycarbonate CNC Machining is\b/g, 'Polycarbonate CNC Machining is'],
  ],
  '/blog/aluminum-cnc-machining': [
    [/\bRelative Machining sphing Cost\b/g, 'Relative Machining Cost'],
  ],
  '/blog/cnc-locating-pins': [
    [/\btolerance and fit diagra\b/g, 'tolerance and fit diagram'],
  ],
  '/blog/oil-gas-cnc-machining-parts': [
    [/<strong>Quality Control Sta<\/strong>n<strong>dards<\/strong>/g, '<strong>Quality Control Standards</strong>'],
    [/\bQuality Control Sta n dards\b/g, 'Quality Control Standards'],
  ],
  '/custom-cnc-parts/cnc-machining-drone-parts': [
    [/\bshaft shaft\b/g, 'shaft'],
  ],
  '/blog/nylon-cnc-machining': [
    [/(Tips For Beginners!)\./g, '$1'],
  ],
  '/blog/what-is-a-cnc-lathe': [
    [/(What is CNC Milling\?<\/a>)\./g, '$1'],
  ],
};

export function applySpellingCorrections(html,route) {
  html=html.replace(/Our experts are here for you!\./g,'Our experts are here for you!');
  const pathname=route.replace(/\/index\.html$/, '').replace(/\/$/,'')||'/';
  for(const [match,replacement] of spellingCorrections[pathname]||[])html=html.replace(match,replacement);
  return html;
}
