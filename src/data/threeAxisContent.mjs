// Owner-confirmed capabilities, 2026-10-29. Photo-based examples below are illustrative.
export const threeAxisSeo = {
  title: '3-Axis CNC Machining Services | CNCPioneer',
  description: '3-axis CNC machining services in China for custom metal and plastic parts. Send drawings for a quote on materials, tolerances, finishes and production needs.',
  canonical: '/services/3-axis-cnc-machining',
  image: '/assets/images/cnc-aluminum-pocket-milling-process.webp',
  type: 'website',
};

export const materialGroups = [
  {id:'metals', label:'Metals', count:'07', items:[
    {name:'Aluminum', grades:'6061 · 7075 · 2024 · 5052', href:'/materials/aluminum-cnc-machining'},
    {name:'Stainless Steel', grades:'303 · 304 · 316 / 316L · 17-4PH', href:'/materials/stainless-steel-cnc-machining'},
    {name:'Carbon & Alloy Steel', grades:'45 Steel · 40Cr · 4140 · 4340'},
    {name:'Brass', grades:'C360'},
    {name:'Copper', grades:'C110 · C101', href:'/materials/copper-cnc-machining'},
    {name:'Titanium', grades:'Grade 2 · Grade 5 (Ti-6Al-4V)', href:'/materials/titanium-cnc-machining'},
    {name:'Tool & Mold Steel', grades:'P20 · H13 · A2 · D2'},
  ]},
  {id:'plastics', label:'Engineering Plastics', count:'04', items:[
    {name:'POM / Acetal', grades:'POM · Selected Delrin grades', href:'/materials/pom-cnc-machining'},
    {name:'Nylon / PA', grades:'PA6 · PA66'},
    {name:'Other Engineering Plastics', grades:'ABS · PC · PMMA · HDPE · PTFE'},
    {name:'High-Performance Plastics', grades:'PEEK · PEI / ULTEM'},
  ]},
];

export const partExamples = [
  {name:'Arc-Shaped Mounting Plate', image:'arc-shaped-aluminum-mounting-plate.webp', alt:'Machined arc-shaped mounting plate with holes and slots', feature:'PROFILE / SLOTS / HOLES', size:'160 × 85 × 12 mm', quantity:'50 parts', tolerance:'Hole spacing ±0.05 mm', roughness:'Ra 3.2 μm', finish:'Clear anodizing', text:'Profile milling and drilling with attention to hole spacing, consistent thickness and clean mounting edges.'},
  {name:'Dual-Pocket Fixture Plate', image:'dual-pocket-aluminum-fixture-plate.webp', alt:'Machined plate with two open pockets and a central circular island', feature:'POCKETS / STEPS / BORES', size:'240 × 100 × 20 mm', quantity:'20 parts', tolerance:'Pocket width / depth ±0.05 mm', roughness:'Ra 1.6 μm', finish:'As machined, deburred', text:'Open-pocket milling with a central island. Tool access, internal radii and pocket depth guide the machining plan.'},
  {name:'U-Shaped Equipment Frame', image:'u-shaped-aluminum-equipment-frame.webp', alt:'U-shaped metal equipment frame with mounting holes', feature:'CONTOURS / MOUNTING HOLES', size:'220 × 160 × 12 mm', quantity:'100 parts', tolerance:'Hole spacing ±0.05 mm', roughness:'Ra 3.2 μm', finish:'Color anodizing', text:'Contour milling and drilling for an open frame, with workholding planned to support its arms and mounting features.'},
];

export const finishes = ['Anodizing','Hard Anodizing','Bead Blasting','Polishing','Brushing','Passivation','Electroless Nickel Plating','Zinc Plating','Powder Coating','Black Oxide'];

export const processSteps = [
  {title:'Review', text:'Check the drawing revision, material, functional dimensions and finish.'},
  {title:'Plan', text:'Define the machining route, datum scheme, fixtures and tool access.'},
  {title:'Prove', text:'Set up the part and inspect the first article before batch production.'},
  {title:'Produce', text:'Machine the batch with in-process checks and agreed finishing.'},
  {title:'Inspect & Pack', text:'Complete final checks, protect the parts and prepare them for shipment.'},
];

export const industries = [
  {title:'Robotics & Automation', text:'Mounting plates, connecting brackets, fixtures and equipment frames.', href:'/industries/robotics'},
  {title:'Semiconductor Equipment', text:'Equipment baseplates, covers, mounting blocks and accessible pocketed parts.', href:'/industries/semiconductor'},
  {title:'Automotive & EV Equipment', text:'Test fixtures, assembly tooling and equipment mounting brackets.', href:'/industries/automotive'},
  {title:'Electronics & Instrumentation', text:'Enclosures, panels, covers and mounting interfaces.', href:'/industries/consumer-electronics'},
];

export const threeAxisFaqs = [
  {question:'What parts are suitable for 3-axis CNC machining?', answer:'Plates, brackets, open pockets, slots, drilled features and tool-accessible surfaces are common candidates. Features on multiple faces may need additional setups. We review the drawing to determine a suitable machining route.'},
  {question:'What tolerances and surface roughness can you support?', answer:'Dimensional tolerances are typically ±0.05–±0.10 mm, depending on material, feature size and part geometry. Surface roughness is Ra 0.8–6.3 μm, depending on material, part geometry and machining conditions. Mark critical dimensions, geometric tolerances and required surfaces on the drawing for review.'},
  {question:'Can you machine both metals and plastics?', answer:'Yes. Material options include aluminum, stainless steel, carbon and alloy steel, brass, copper, titanium, tool steel and engineering plastics such as POM, nylon, PEEK and PEI. Specify the grade and condition when requesting a quote.'},
  {question:'Can you supply parts with surface finishing?', answer:'Yes. We provide machining and surface finishing through one point of contact. Options include anodizing, hard anodizing, bead blasting, polishing, brushing, passivation, electroless nickel plating, zinc plating, powder coating and black oxide. Availability depends on material compatibility and part requirements.'},
  {question:'When should I choose 3-axis rather than 5-axis machining?', answer:'Three-axis machining is a strong candidate when cutting tools can reach the required features with practical setups. Angled features, complex surfaces or demanding relationships between faces may benefit from a different approach. We assess access, setup count and total cost against your drawing.'},
  {question:'What affects lead time, and what should I send for a quote?', answer:'Reference production windows are 3–5 working days for samples and 7–15 working days for batches. The quotation confirms the schedule based on material availability, quantity, complexity, finishing and inspection; transit time is separate. Send a 3D model, dimensioned drawing, material grade, quantity, required finish, inspection needs and target date.'},
];
