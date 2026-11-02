import { satellitePartsContent } from './satellitePartsContent.mjs';

// One satellite overview at /industries/satellites. Product-specific pages stay
// independent; the former general product pages redirect to this industry page.
const title = 'Satellite Component CNC Machining';
const description = 'Satellite component CNC machining from CNCPioneer in China. Get quotes for custom spacecraft structures, housings, mechanisms, RF hardware and CubeSat parts.';
const related = [
  { title: 'Satellite Brackets', href: '/custom-cnc-parts/satellite-brackets', text: 'Equipment mounts, instrument supports and mechanism brackets.' },
  { title: 'Satellite Housings', href: '/custom-cnc-parts/satellite-housings', text: 'Electronics, sensor, RF and mechanism enclosures.' },
  { title: 'Satellite Structures', href: '/custom-cnc-parts/satellite-structures', text: 'Frames, panel fittings, rails and structural interfaces.' },
  { title: 'Satellite Arms', href: '/custom-cnc-parts/satellite-arms', text: 'Joint components, arm links and deployment hardware.' },
];
const materials = [
  { tab: 'Aluminum', badge: 'Structural & equipment parts', icon: 'Al', name: 'Aluminum Alloys', spec: '6061-T6 / 7075-T6 / 2024 / 6082', summary: 'Drawing-specified alloys for frames, housings, rails, RF bodies and mounting plates. Confirm the exact grade, temper and product form.', facts: [['Typical Parts', 'Frames, housings, brackets and inserts'], ['Finish Planning', 'Specified anodizing or conversion coating; masked interfaces'], ['Design Review', 'Mounting datums, thin sections, grain direction and mass']] },
  { tab: 'Titanium', badge: 'Specified titanium hardware', icon: 'Ti', name: 'Titanium Alloys', spec: 'Ti-6Al-4V Grade 5 / ELI Grade 23', summary: 'For titanium interfaces, joints and propulsion hardware specified by the spacecraft design. Include the material condition and required process records.', facts: [['Typical Parts', 'Loaded interfaces, joints and fitting bodies'], ['Finish Planning', 'Approved deburring and surface processes'], ['Design Review', 'Alloy condition, mating geometry and critical sections']] },
  { tab: 'Stainless Steel', badge: 'Interfaces & mechanisms', icon: 'SS', name: 'Stainless Steel', spec: '303 / 316L / 17-4PH', summary: 'For specified shafts, sleeves, housings and fluid-system parts. State the required grade, heat-treatment condition and any magnetic acceptance criteria.', facts: [['Typical Parts', 'Shafts, sleeves, connector bodies and valve elements'], ['Finish Planning', 'Drawing-specified passivation, cleaning and masking'], ['Design Review', 'Bore fits, shaft journals and final surface condition']] },
  { tab: 'Nickel Alloys', badge: 'Program-specified alloys', icon: 'Ni', name: 'Inconel Alloys', spec: 'Inconel 625 / 718', summary: 'For specified nickel-alloy valve, fitting and mechanism components. Confirm the exact alloy, delivery condition and any heat-treatment requirements.', facts: [['Typical Parts', 'Valve bodies, fittings and mechanism hardware'], ['Finish Planning', 'Approved process and final dimensional acceptance'], ['Design Review', 'Material specification, tool access and inspection scope']] },
  { tab: 'Invar', badge: 'Instrument reference structures', icon: 'Fe-Ni', name: 'Invar Alloys', spec: 'Invar 36 / drawing-specified grades', summary: 'For instrument supports and reference structures where the approved design specifies an Invar alloy. Confirm the exact grade, condition and acceptance requirements.', facts: [['Typical Parts', 'Instrument supports, optical interfaces and reference parts'], ['Finish Planning', 'Drawing-approved protection and controlled handling'], ['Design Review', 'Reference faces, alignment features and inspection condition']] },
];
const finishes = ['Type II / III Anodizing', 'Conversion Coating', 'Stainless Passivation', 'Gold Plating', 'Specified DLC Coating', 'Cleaning & Vacuum Bake-Out'];

export const satelliteIndustryAdditions = {
  hero: {
    title,
    description: 'CNCPioneer machines custom satellite parts for spacecraft structures, mechanisms, propulsion, payloads and CubeSat assemblies. Review component drawings, material, finishing and delivery records from engineering models through repeat orders.',
  },
  seo: { title: `${title} | CNCPioneer`, description, canonical: '/industries/satellites' },
  detail: {
    materials: {
      title: 'Materials & Surface Processing for Satellite Parts',
      subtitle: 'Select the grade, condition and processing route from the approved spacecraft design. Confirm the required certificates, test evidence and final interface dimensions.',
      items: materials,
      finishes: finishes.map(label => ({label})),
      finishesNote: 'Specify coating thickness, masked contact areas, cleanliness, packaging and any approved-source processing. Outgassing evidence, bake-out and environmental qualification follow the individual program requirements.',
    },
    parts: {
      title: satellitePartsContent.portfolioTitle,
      subtitle: satellitePartsContent.portfolioIntro,
      layout: 'grid',
      items: satellitePartsContent.portfolio.map(({title, image, text}) => ({title, image, text})),
      relatedTitle: 'Explore Specific Satellite Components',
      related,
    },
  },
  faqTitle: 'Satellite CNC Machining FAQ',
  faqs: satellitePartsContent.faqs,
};

export const satelliteIndustryNativeContent = {
  seo: { ...satelliteIndustryAdditions.seo, image: '/wp-content/uploads/2026/05/satellite-machining-services.jpg' },
  hero: { ...satelliteIndustryAdditions.hero, image: '/wp-content/uploads/2026/05/satellite-machining-services.jpg' },
  sections: [
    { heading: 'Satellite Machining Overview', text: satellitePartsContent.overview.join(' '), items: satellitePartsContent.overviewPoints.map(item => `${item.title}: ${item.text}`), image: satellitePartsContent.overviewImage },
    { heading: satellitePartsContent.portfolioTitle, text: satellitePartsContent.portfolioIntro, items: satellitePartsContent.portfolio.map(item => `${item.title}: ${item.text}`), image: satellitePartsContent.portfolio[0].image },
    { heading: satelliteIndustryAdditions.detail.materials.title, text: satelliteIndustryAdditions.detail.materials.subtitle, items: materials.map(item => `${item.name}: ${item.spec}. ${item.summary}`), image: '' },
    { heading: 'Surface Processing & Cleanliness', text: satelliteIndustryAdditions.detail.materials.finishesNote, items: finishes, image: '' },
    { heading: satellitePartsContent.qualityTitle, text: satellitePartsContent.qualityIntro, items: satellitePartsContent.controls.map(item => `${item.title}: ${item.check} ${item.record}`), image: '' },
  ],
  galleryHeading: satellitePartsContent.portfolioTitle,
  gallery: satellitePartsContent.portfolio.map(item => ({image: item.image, alt: item.title, name: item.title})),
  faqs: satellitePartsContent.faqs.map(item => ({question: item.question, answer: [item.answer, ...(item.points || [])].join(' ')})),
};
