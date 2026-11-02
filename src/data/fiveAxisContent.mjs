// Factory equipment and quality workflow: supplied Ziyang brochure, pages 9–11.
// Process explanations describe route selection, not unverified machine specifications.
export const fiveAxisSeo = {
  title: '5-Axis CNC Machining Services | CNCPioneer',
  description: '5-axis CNC machining services in China for complex custom parts. Request quotes with your drawings, material, critical tolerances and inspection requirements.',
  canonical: '/services/5-axis-cnc-machining',
  image: '/assets/images/five-axis-multi-face-structural-component.webp',
  type: 'website',
};

export const machiningModes = [
  {id:'indexed', name:'Indexed 3+2', label:'POSITION. LOCK. MACHINE.', title:'Reach an angled face. Then cut.',
   text:'Two rotary axes position the part or tool. The orientation stays fixed while the three linear axes machine the feature.',
   features:['Angled holes and mounting faces','Pockets approached from different directions','Prismatic parts with features on several sides'],
   note:'A practical route when each feature can be machined at a fixed tool orientation.'},
  {id:'simultaneous', name:'Simultaneous 5-Axis', label:'COORDINATED MOTION', title:'Change orientation through the cut.',
   text:'Linear and rotary axes move together during cutting to follow a surface or maintain a suitable tool approach.',
   features:['Continuous contoured surfaces','Changing tool access along a feature','Geometry requiring coordinated rotary motion'],
   note:'The machining route depends on tool access, machine configuration, programming and the part requirements.'},
];

export const engineeringSteps = [
  {title:'Start With the Functional Geometry', text:'Identify the datum system, mating surfaces, bore relationships and dimensions that control the assembly.', detail:'Drawing revision · GD&T · Critical fits'},
  {title:'Plan Access and Workholding', text:'Review tool reach, collision clearance, clamping surfaces and the sequence for features that cannot be reached in one setup.', detail:'Fixture design · Setup sequence · Stock condition'},
  {title:'Program, Simulate and Prove', text:'Prepare the toolpath, check the machining sequence and inspect a first article before moving into the agreed production run.', detail:'Programming · Simulation · First-article inspection'},
  {title:'Inspect the Features That Matter', text:'Use the inspection methods agreed for the drawing. Check parts through production and complete final inspection before packing.', detail:'In-process checks · CMM / optical inspection as required · Final records'},
];

export const materialOptions = [
  {name:'Aluminum Alloys', grades:'6061 · 7075 · 2024 · 5052', text:'For lightweight housings, structural parts and equipment interfaces.', href:'/materials/aluminum-cnc-machining'},
  {name:'Stainless & Alloy Steels', grades:'303 · 304 · 316 / 316L · 17-4PH · 4140 · 4340', text:'For parts where strength, wear or corrosion requirements drive material selection.', href:'/materials'},
  {name:'Titanium', grades:'Grade 2 · Grade 5 / Ti-6Al-4V', text:'For weight-sensitive and corrosion-resistant components, subject to drawing review.', href:'/materials/titanium-cnc-machining'},
  {name:'Engineering Plastics', grades:'POM · PA · PEEK · PEI / ULTEM', text:'For insulating, low-weight or application-specific components.', href:'/materials'},
];

export const fiveAxisFaqs = [
  {question:'What is the difference between 3+2 and simultaneous 5-axis machining?', answer:'In indexed 3+2 machining, the rotary axes position the part or tool and remain fixed while cutting takes place along the linear axes. In simultaneous 5-axis machining, linear and rotary axes move together during the cut. The appropriate route depends on the geometry, tool access and available machine configuration.'},
  {question:'Can every surface be finished in one setup?', answer:'No. The fixture must hold the part, so clamped surfaces and inaccessible features can require another setup. The benefit is often fewer repositioning operations, rather than a guarantee that every part is completed in one setup.'},
  {question:'Does five-axis machining automatically mean tighter tolerances?', answer:'No. Fewer setups can help preserve relationships between features, but accuracy also depends on the material, workholding, tool reach, thermal conditions and inspection method. We confirm tolerances feature by feature against your drawing.'},
  {question:'When is 3-axis machining the better choice?', answer:'If the required features are accessible in practical setups and the drawing can be met, 3-axis machining may offer a simpler and more economical route. Five-axis machining is considered when added tool access or reduced repositioning provides a useful benefit.'},
  {question:'Which materials and surface finishes can I request?', answer:'Send the exact material grade and condition with your drawing. Options include aluminum, stainless and alloy steels, titanium and engineering plastics. Finishes are selected for material compatibility and may include anodizing, hard anodizing, bead blasting, polishing, brushing, passivation, electroless nickel plating, zinc plating, powder coating or black oxide.'},
  {question:'What information is needed for a five-axis machining quote?', answer:'Include a 3D model, dimensioned drawing, material grade, quantity, drawing revision, required finishes and delivery target. Identify critical tolerances, datums, cosmetic surfaces and the inspection documentation you need. The quotation confirms the machining route, achievable requirements and production schedule.'},
];
