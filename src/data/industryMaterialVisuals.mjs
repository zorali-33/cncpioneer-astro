// Material-specific examples from the existing material library. Captions name
// the pictured stock or part; they do not certify the grade of a pictured sample.
const photo = (file, caption) => ({ src: `/wp-content/uploads/${file}`, alt: caption, caption });
const library = {
  titanium: [photo('2026/01/material-cnc-machining-titanium.jpg', 'Titanium sheet example')],
  aluminum: [photo('2026/01/6061-aluminum-cnc-machining-material.jpg', 'Aluminum plate example')],
  stainless: [photo('2026/01/stainless-steel-material.jpg', 'Stainless steel sheet example')],
  nickel: [photo('2025/12/material-swiss-machining-nickel.jpg', 'Nickel alloy sheet example')],
  inconel: [photo('2026/01/inconel-718-material.jpg', 'Inconel 718 stock example')],
  steel: [photo('2026/01/alloy-steel-cnc-machining-material.jpg', 'Alloy steel plate example')],
  copper: [photo('2026/01/copper-cnc-machining-material.jpg', 'Copper sheet example')],
  brass: [photo('2026/01/material-cnc-machining-brass.jpg', 'Brass sheet example')],
  peek: [photo('2026/01/peek-cnc-machining-material.jpg', 'PEEK stock example')],
  pei: [photo('2026/01/ultem-cnc-machining-material.jpg', 'PEI / Ultem stock example')],
  magnesium: [photo('2026/01/magnesium-cnc-machining-material.jpg', 'Magnesium plate example')],
  nitinol: [photo('2026/01/nitinol-material.jpg', 'Nitinol sheet example')],
  invar: [photo('2026/01/invar-material.jpg', 'Invar plate example')],
  kovar: [photo('2026/01/kovar-material.jpg', 'Kovar sheet example')],
  bronze: [photo('2026/01/bronze-cnc-machining-material\u200b.jpg', 'Bronze sheet example')],
};

const aliases = {
  Titanium: 'titanium', Aluminum: 'aluminum', Stainless: 'stainless', 'Stainless Steel': 'stainless', Invar: 'invar',
  Nickel: 'nickel', 'Nickel Alloys': 'nickel', Inconel: 'inconel',
  Steel: 'steel', 'Alloy Steel': 'steel', Copper: 'copper', Brass: 'brass',
  Plastic: 'peek', 'Engineering Plastics': 'peek', PEEK: 'peek', PEI: 'pei',
  Magnesium: 'magnesium', Nitinol: 'nitinol',
  Bronze: 'bronze'
};

export function getIndustryMaterialVisual(material) {
  if (material.tab === 'Invar / Kovar') return { key: 'invar-kovar', images: [...library.invar, ...library.kovar] };
  if (material.tab === 'Copper & Brass' || (material.tab === 'Copper' && /brass/i.test(material.name))) {
    return { key: 'copper-brass', images: [...library.copper, ...library.brass] };
  }
  let key = aliases[material.tab];
  if (key === 'nickel' && material.spec === 'Inconel 718') key = 'inconel';
  if (!key) throw new Error(`Missing industry material visual: ${material.tab}`);
  return { key, images: library[key] };
}
