export const automationSeo = {
  title: 'CNC Machined Parts for Automation Equipment | CNCPioneer',
  description: 'Custom plates, brackets, shafts, fixtures and gripper fingers for special-purpose automation equipment. Send your BOM and drawings for a machining review.',
  canonical: '/industries/automation-equipment', type: 'website',
  image: '/assets/images/automation-parts-hero.webp',
};
export const automationParts = [
  ['base-plates', 'Base & Mounting Plates', 'Tapped patterns, dowel holes and mounting faces.', 'structures', 'Aluminum base plates with precision hole patterns and counterbores'],
  ['motor-mounts', 'Motor Mounts & Brackets', 'Pilot bores, perpendicular faces and fixing holes.', 'structures', 'Machined aluminum motor mounting brackets with circular pilot bores'],
  ['shafts', 'Shafts & Guide Rods', 'Bearing journals, keyways and retaining grooves.', 'shafts', 'Stepped steel shafts with journals and machined grooves'],
  ['pins-bushings', 'Locating Pins & Bushings', 'Locating diameters and mating fits to drawing.', 'bushings', 'Steel dowel pins and flanged bushings with central bores'],
  ['fixtures', 'Fixtures & Nests', 'Aluminum and engineering plastic workholding.', 'structures', 'Black plastic fixture nest mounted on an aluminum pallet'],
  ['gripper-fingers', 'Gripper Fingers', 'Contact profiles shaped around your workpiece.', 'structures', 'Matched aluminum gripper fingers with shaped tips'],
  ['manifolds', 'Manifolds & Valve Blocks', 'Threaded ports and cross-drilled passages.', 'fittings', 'Aluminum pneumatic manifold block with threaded ports'],
  ['bearing-housings', 'Bearing Housings', 'Bearing bores, shoulders and mounting interfaces.', 'housings', 'Aluminum bearing support blocks with precision circular bores'],
].map(([image, title, text, category, alt]) => ({image: `automation-${image}`, title, text, href: `/custom-cnc-parts?type=${category}`, alt}));
export const automationBenefits = [
  {image: 'automation-drawing-review', title: 'One review for your whole BOM', text: 'Share part numbers, revisions and quantities together. We review machining access, materials and critical features before confirming scope and pricing.', alt: 'Engineer comparing a mounting plate with a drawing and caliper'},
  {image: 'automation-inspection', title: 'Check the interfaces that matter', text: 'Identify bearing fits, locating holes and assembly datums on your drawings. Agree the inspection method and report requirements with the quotation.', alt: 'CMM probe inspecting a locating bore on an aluminum tooling plate'},
  {image: 'automation-kitted-parts', title: 'Plan delivery around your build', text: 'Discuss part identification, protective packaging and shipment grouping during review. Confirm which lines are needed first for assembly or trials.', alt: 'Machined automation components separated in protective packaging'},
];
export const automationCapabilities = [
  ['Processes', '3-axis and 5-axis milling, CNC turning and milling, Swiss machining'],
  ['Tolerances', 'Critical fits to drawing; ±0.01 mm features subject to geometry, material and process review'],
  ['Materials', 'Aluminum, stainless steel, carbon and alloy steel, brass, POM and PEEK'],
  ['Finishes', 'Anodizing, black oxide, passivation and plating, subject to material compatibility'],
  ['Inspection', 'CMM, optical measurement and gauges; report scope agreed before production'],
  ['Equipment', '86 CNC machines in the turning & milling register; 122 measurement instruments in the calibration plan'],
];
export const automationSteps = [
  ['Share your BOM', 'Send part numbers, revisions, quantities, models and drawings.'],
  ['Review the quotation', 'Confirm each line’s material, finish, inspection and delivery target.'],
  ['Approve first articles', 'Review samples and agreed measurements before batch production.'],
  ['Receive your parts', 'Complete final checks and pack against the agreed shipment plan.'],
];
export const automationFaqs = [
  {question: 'Can you machine parts for one-off, special-purpose automation machines?', answer: 'Yes. Send the complete BOM, even when quantities differ by line. We review prototypes, single-machine builds and repeat orders individually, and confirm minimum quantities and setup costs in the quotation.'},
  {question: 'How should I specify tolerances on automation parts?', answer: 'Identify the features that control assembly and function: bearing fits, locating holes, mounting faces and datum relationships. Specify the required fits, geometric tolerances and general tolerance standard on the drawing. Avoid applying the tightest tolerance to every surface.'},
  {question: 'Can you quote from 2D drawings only?', answer: 'A complete 2D drawing may be sufficient for straightforward plates, pins and turned components. Include a STEP model for complex pockets, angled features or internal passages, together with the drawing that defines tolerances and finish.'},
  {question: 'Which inspection reports can I request?', answer: 'Request the dimensional or first-article report you need when submitting the RFQ. Mark critical dimensions and datums so we can confirm inspection methods, sampling, documentation and any additional cost before production.'},
  {question: 'Can you machine hardened steel or finish critical-fit parts?', answer: 'State the steel grade, required hardness and heat treatment condition. For coated parts, identify masked areas, coating thickness and whether dimensions apply before or after finishing. Process suitability and any secondary operations are confirmed during drawing review.'},
  {question: 'What lead time should I plan for?', answer: 'Reference production windows are 3–5 working days for samples and 7–15 working days for batches. Final timing depends on material availability, quantity, part complexity, finishing and inspection. The quotation confirms the schedule; shipping time is separate.'},
];
