const link = (name, slug) => ({ label: `View ${name} details`, href: `/materials/${slug}` });

const materials = {
  Aluminum: ['Aluminum', 'aluminum-cnc-machining'],
  Titanium: ['Titanium', 'titanium-cnc-machining'],
  Invar: ['Invar', 'invar-cnc-machining'],
  Stainless: ['Stainless Steel', 'stainless-steel-cnc-machining'],
  'Stainless Steel': ['Stainless Steel', 'stainless-steel-cnc-machining'],
  Steel: ['Alloy Steel', 'alloy-steel-cnc-machining'],
  'Alloy Steel': ['Alloy Steel', 'alloy-steel-cnc-machining'],
  Copper: ['Copper', 'copper-cnc-machining'],
  Brass: ['Brass', 'brass-cnc-machining'],
  Bronze: ['Bronze', 'bronze-cnc-machining'],
  Magnesium: ['Magnesium', 'magnesium-cnc-machining'],
  Nitinol: ['Nitinol', 'nitinol-cnc-machining'],
  PEEK: ['PEEK', 'peek-cnc-machining'],
  PEI: ['PEI / Ultem', 'ultem-cnc-machining'],
};

function getStandardIndustryMaterialLinks(material) {
  const { tab, name, spec } = material;
  if (tab === 'Invar / Kovar') {
    return [link('Invar', 'invar-cnc-machining'), link('Kovar', 'kovar-cnc-machining')];
  }
  if (tab === 'Copper & Brass' || (tab === 'Copper' && /brass/i.test(name))) {
    return [link('Copper', 'copper-cnc-machining'), link('Brass', 'brass-cnc-machining')];
  }
  if (['Nickel', 'Nickel Alloys', 'Inconel'].includes(tab)) {
    const description = `${name} ${spec}`;
    const grades = ['625', '718'].filter((grade) => description.includes(grade));
    if (grades.length) return grades.map((grade) => link(`Inconel ${grade}`, `inconel-${grade}-cnc-machining`));
    return [link('Inconel', 'inconel-cnc-machining'), link('Nickel', 'nickel-swiss-machining')];
  }
  if (['Plastic', 'Engineering Plastics'].includes(tab)) {
    const options = [
      [/\bPEEK\b/i, 'PEEK', 'peek-cnc-machining'],
      [/\bNylon\b/i, 'Nylon', 'nylon-cnc-machining'],
      [/\bPOM\b/i, 'POM', 'pom-cnc-machining'],
      [/\bPC\b/i, 'Polycarbonate', 'polycarbonate-cnc-machining'],
      [/\bABS\b/i, 'ABS', 'abs-cnc-machining'],
    ];
    const links = options.filter(([pattern]) => pattern.test(spec)).map(([, label, slug]) => link(label, slug));
    if (links.length) return links;
    return [link('Engineering Plastics', 'plastic-cnc-machining')];
  }
  const destination = materials[tab];
  if (!destination) throw new Error(`Missing industry material link: ${tab}`);
  return [link(...destination)];
}


const swissDestinations = {
  'aluminum-cnc-machining': ['Aluminum', 'aluminum-swiss-machining'],
  'titanium-cnc-machining': ['Titanium', 'titanium-swiss-machining'],
  'stainless-steel-cnc-machining': ['Stainless Steel', 'stainless-steel-swiss-machining'],
  'brass-cnc-machining': ['Brass', 'brass-swiss-machining'],
  'peek-cnc-machining': ['PEEK', 'peek-swiss-machining'],
  'inconel-cnc-machining': ['Nickel', 'nickel-swiss-machining'],
  'inconel-625-cnc-machining': ['Nickel', 'nickel-swiss-machining'],
  'inconel-718-cnc-machining': ['Nickel', 'nickel-swiss-machining'],
  'nickel-swiss-machining': ['Nickel', 'nickel-swiss-machining'],
};

export function getIndustryMaterialLinks(material, { process = 'cnc' } = {}) {
  const links = getStandardIndustryMaterialLinks(material);
  if (process !== 'swiss') return links;

  const seen = new Set();
  return links.map((item) => {
    const slug = item.href.replace('/materials/', '');
    const destination = swissDestinations[slug];
    if (!destination) return item;
    const [name, target] = destination;
    return { label: 'View ' + name + ' Swiss Machining', href: '/materials/' + target };
  }).filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}
