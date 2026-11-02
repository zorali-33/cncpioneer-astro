// Group by the component's form and function, rather than its material or industry.
export const partCategories = [
  {id:'pins',label:'Pins & Contacts',pattern:/\b(pins?|terminals?|contacts?|connectors?|probes?)\b/i},
  {id:'shafts',label:'Shafts & Drive Components',pattern:/\b(shafts?|gears?|gearbox|wheels?|pulleys?|splines?)\b/i},
  {id:'bushings',label:'Bushings & Sleeves',pattern:/\b(bushings?|sleeves?|bearings?)\b/i},
  {id:'fittings',label:'Fittings, Flanges & Valves',pattern:/\b(fittings?|flanges?|valves?|adapters?|couplings?|nipples?|nozzles?)\b/i},
  {id:'housings',label:'Housings & Enclosures',pattern:/\b(housings?|enclosures?|chassis|cases?|covers?|shells?|chambers?)\b/i},
  {id:'fasteners',label:'Fasteners & Washers',pattern:/\b(fasteners?|nuts?|bolts?|screws?|washers?)\b/i},
  {id:'structures',label:'Structural & Motion Parts',pattern:/\b(brackets?|structures?|structural|arms?|links?|rails?|plates?|joints?|linkages?|pistons?|actuators?)\b/i},
  {id:'components',label:'Custom Machined Components'},
];

// Explicitly reviewed cases where an old slug or a broad term hid the part type.
export const partCategoryOverrides = {
  'ev-charging-gun':'pins',
  'ev-charging-plug':'pins',
  'liquid-cooling-connectors':'fittings',
  'cnc-custom-aluminum-shift-knob':'shafts',
  'cnc-propeller-machining':'shafts',
  'heat-sinks':'structures',
  'hydraulic-cylinder-components-machining':'structures',
  'hydraulic-cylinder-piston-machining':'structures',
  'humanoid-robot-leg-components':'structures',
};
export function classifyPart(page) {
  const override=partCategoryOverrides[page.slug];
  if(override)return partCategories.find(category=>category.id===override);
  const text=(page.catalogIdentity||page.slug).replaceAll('-',' ').replace(/swiss screw(?: machined| machining)?/i,'swiss');
  // Specific housings/sleeves take priority over the mechanisms they surround.
  const priority=['housings','bushings','fittings','pins','shafts','fasteners','structures'];
  return priority.map(id=>partCategories.find(category=>category.id===id)).find(category=>category.pattern.test(text))||partCategories.at(-1);
}
export const partCategoryHref = id => `/custom-cnc-parts?type=${encodeURIComponent(id)}`;
