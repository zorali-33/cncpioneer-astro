// Product families and inspection equipment supported by the owner-supplied
// Richconn company profile. Planning ranges below are general industry references,
// not verified limits of the owner's machine register. Keep that distinction visible.
export const swissSeo = {
  title: 'Swiss CNC Machining Services | CNCPioneer',
  description: 'Custom Swiss CNC machining services from a manufacturer in China. Precision pins, shafts and connector components with finishing and inspection. Request quotes.',
  canonical: '/services/swiss-machining',
  image: '/assets/images/swiss-cnc-turned-pins-shafts-terminals-transparent.webp',
  type: 'website',
};
export const swissParts = [
  {name:'Connector Pins & Terminals',image:'brass-swiss-contact-pin-studio-v1.webp',alt:'Single brass contact pin with stepped diameters on a light background',href:'/custom-cnc-parts/connector-pins',feature:'CONTACT DIAMETERS / GROOVES',text:'Stepped contacts with locating shoulders and retention grooves.'},
  {name:'Precision Shafts & Pins',image:'stainless-swiss-shaft-studio-v1.webp',alt:'Slender stainless steel stepped shaft on a light background',href:'/custom-cnc-parts/cnc-machined-pins',feature:'SHAFT DIAMETERS / SHOULDERS',text:'Slender shafts with bearing seats and stepped diameters.'},
  {name:'EV Charging Terminals',image:'custom-ev-charging-contact-pins.webp',alt:'Turned EV charging contacts with hollow and stepped features',href:'/custom-cnc-parts/precision-turned-ev-charging-pins',feature:'CONTACT SURFACES / BORES',text:'Charging contacts with axial bores and mounting features.'},
  {name:'POGO Pin Components',image:'brass-contact-pins.webp',alt:'Small brass contact pins with stepped turned profiles',href:'/custom-cnc-parts/pogo-contact-pins',feature:'PLUNGERS / BARRELS',text:'Machined plungers, barrels and contact components.'},
  {name:'Sensor Housings & Sleeves',image:'aluminum-sensor-housings-white-v1.webp',alt:'Machined cylindrical sensor housing, sleeve and cover',href:'/custom-cnc-parts/sensor-housings',feature:'BORES / WALLS / THREADS',text:'Cylindrical housings with bores and threaded interfaces.'},
  {name:'Threaded Components',image:'stainless-swiss-bushing-studio-v1.webp',alt:'Machined stainless steel threaded bushing with hexagonal shoulder',href:'/custom-cnc-parts/metric-thread-adapter',feature:'THREADS / END FACES',text:'Bushings and adapters made to your thread specification.'},
];
export const swissPlanningRanges = [
  {label:'Bar Diameter',value:'Ø1–32',unit:'mm',note:'Bar-stock diameter for initial review.'},
  {label:'Part Length',value:'≤200',unit:'mm',note:'Longer parts require setup review.'},
  {label:'Dimensional Tolerance',value:'±0.01–0.05',unit:'mm',note:'Feature-specific; tighter fits reviewed.'},
  {label:'Surface Roughness',value:'Ra 0.8–3.2',unit:'μm',note:'Depends on material and geometry.'},
];
export const swissCapabilities = [
  ['Turning','Stepped diameters, shoulders, tapers and grooves'],
  ['Drilling & Boring','Axial holes, internal bores and counterbores'],
  ['Threading','Internal and external threads to the specified standard and class'],
  ['Milling & Cross Features','Flats, slots and cross holes, subject to machine configuration'],
];
export const swissMaterials = [
  {name:'Stainless Steel',grades:'303 · 304 · 316 / 316L · 17-4PH',href:'/materials/stainless-steel-swiss-machining'},
  {name:'Brass',grades:'C360',href:'/materials/brass-swiss-machining'},
  {name:'Copper',grades:'C110 · C101',href:'/materials/copper-cnc-machining'},
  {name:'Aluminum',grades:'6061 · 7075',href:'/materials/aluminum-swiss-machining'},
  {name:'Carbon & Alloy Steel',grades:'45 Steel · 40Cr · 4140 · 4340'},
  {name:'Titanium',grades:'Grade 2 · Grade 5',href:'/materials/titanium-swiss-machining'},
  {name:'Nickel Alloys',grades:'Specify the grade and supply condition',href:'/materials/nickel-swiss-machining'},
];
export const swissPlastics = [
  {name:'POM / Acetal',grades:'Specify the grade and stock condition',href:'/materials/pom-cnc-machining'},
  {name:'PEEK',grades:'Unfilled or specified filled grade',href:'/materials/peek-swiss-machining'},
];
export const swissFinishes = [
  ['Passivation','Surface treatment for suitable stainless steel components.'],
  ['Electroless Nickel Plating','Define thickness, masked areas and finished dimensions.'],
  ['Anodizing & Hard Anodizing','For suitable aluminum grades; review dimensional allowance.'],
  ['Zinc Plating & Black Oxide','Protection and appearance for compatible steel parts.'],
  ['Polishing, Brushing & Blasting','Specify appearance and protect functional surfaces.'],
];
export const swissProcess = [
  {title:'Review',text:'Drawing revision, material, quantity and functional requirements.'},
  {title:'Plan & Quote',text:'Machining route, finishing, inspection scope and timing.'},
  {title:'Approve Samples',text:'Review samples and agree acceptance before the batch.'},
  {title:'Produce',text:'Run the agreed process with planned in-process checks.'},
  {title:'Inspect & Deliver',text:'Final checks, protective packaging and shipment.'},
];
export const swissFaqs = [
  {question:'When should I choose Swiss machining over conventional turning?',answer:'Swiss machining is a useful option for slender bar-stock parts and small components with several turned features. Guide-bushing support helps control deflection close to the cut. Conventional turning may be more economical for other geometries; material, quantity and setup cost determine the best route.'},
  {question:'What part sizes and tolerances can you machine?',answer:'For initial planning, the capability section shows typical industry reference ranges: Ø1–32 mm bar diameter, part lengths up to 200 mm, dimensional tolerances of ±0.01–±0.05 mm and surface roughness of Ra 0.8–3.2 μm. These are not confirmed limits of our equipment. Send your drawing and material grade so we can confirm capacity, feature-specific tolerances, finish and inspection with your quotation.'},
  {question:'Can I order samples before a production batch?',answer:'Yes. Our process includes samples and trial batches before repeat production. Include your initial quantity and expected annual demand so setup, tooling and material costs can be considered together. Sample and batch delivery dates are confirmed in the quotation.'},
  {question:'Can you handle finishing and inspection documentation?',answer:'We coordinate machining and compatible surface finishes through one point of contact. State coating thickness, masked areas, final dimensions and required records when requesting a quote. Inspection methods, sampling and documentation are agreed before production.'},
  {question:'What should I send for a Swiss machining quote?',answer:'Upload a dimensioned drawing and any available 3D model. Include material grade, quantity, critical tolerances, surface finish, inspection requirements and target date. Add packaging requirements or expected repeat demand where relevant.'},
];
