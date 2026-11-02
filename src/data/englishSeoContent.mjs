// Reviewed local English SEO edits, 2026-10-22. Whitelisted and reapplied by generated data modules.
// Keep product photos, industry cards, protected titles and route identities outside this scope.
const materialEdits = {
  "brass-cnc-machining": {
    name: "Brass", description: "Brass CNC machining services from CNCPioneer in China. Request quotes for custom fittings, bushings, and contacts with finishing and inspection to your drawings.",
    hero: "Custom brass fittings, bushings and contact components made to your drawings. Send the alloy designation, mating dimensions, finish and quantity for a machining and inspection review.",
    intro: "A brass machining quote should start with the specified alloy and part function. Threaded fittings, electrical contacts and decorative hardware can require different material, surface and inspection choices. Confirm the purchase specification before substituting one brass grade for another.",
    items: ["Specify the brass grade, stock condition and any lead-content or application restrictions.", "Identify thread standards, sealing features, contact surfaces and mating dimensions.", "State plating or polishing requirements, thickness allowances and masked surfaces.", "Provide drawing revision, quantity, material-document requirements and the inspection scope."],
    guide: "/blog/brass-cnc-machining",
    procurement: false,
    learningLinks: [{ href: "/blog/brass-cnc-machining", label: "Brass material selection guide" }],
  },
  "bronze-cnc-machining": {
    name: "Bronze", description: "Bronze CNC machining services from CNCPioneer in China. Request quotes for custom bushings, sleeves, and precision parts made to your drawings and specifications.",
    hero: "Custom bronze bushings, sleeves and machined components to your drawings. Define the bearing interface, material grade and inspection condition before the production route is agreed.",
    intro: "For a bronze bushing or sleeve, the bore, outside diameter and shoulder must be considered with the mating shaft and housing. State the bronze specification, lubrication arrangement and service conditions so the material and fit can be reviewed together. A generic bronze label does not establish a bearing performance rating.",
    items: ["Provide the exact bronze designation and material condition; avoid substituting brass for bronze.", "Dimension the bore, outside diameter, shoulders, grooves and mating fits from defined datums.", "Describe the lubrication arrangement, load, motion and operating environment for application review.", "State the inspection condition, surface finish, order quantity and traceability documents required."],
    guide: "/blog/bronze-cnc-machining",
    procurement: false,
    learningLinks: [{ href: "/blog/bronze-cnc-machining", label: "Bronze material selection guide" }],
  },
  "stainless-steel-cnc-machining": {
    name: "Stainless Steel", description: "Stainless steel CNC machining from CNCPioneer in China. Request quotes for custom parts, with grade selection, finishing, and inspection agreed to your drawings.",
    hero: "Custom stainless steel shafts, fittings and housings made to your drawings. Request a review of the specified grade, material condition, post-processing and critical dimensions.",
    intro: "Stainless steel procurement requires more than a family name. The grade and condition, exposure to chemicals or cleaning, and the mating geometry inform machining and finishing choices. Define any passivation, polishing or heat-treatment requirements on the drawing or purchase specification.",
    items: ["Identify the grade, material standard, stock form and required condition.", "Describe the corrosive medium, cleaning process and operating temperature relevant to material review.", "Specify bores, threads, sealing faces and surface requirements, including post-process dimensional checks.", "Request the material records, critical-feature inspection and quantity needed for the order."],
    guide: "/blog/stainless-steel-cnc-machining",
    procurement: false,
    learningLinks: [{ href: "/blog/stainless-steel-cnc-machining", label: "Stainless Steel material selection guide" }],
  },
  "nylon-cnc-machining": {
    name: "Nylon", description: "Nylon CNC machining services from CNCPioneer in China. Request quotes for custom PA parts, with material condition and inspection reviewed to your drawings.",
    hero: "Custom machined nylon gears, bushings, rollers and wear components. Share the PA grade, material conditioning requirements, drawing and quantity for a manufacturing review.",
    intro: "Nylon parts should be quoted with the exact PA grade, filler and stock condition identified. Agree the moisture conditioning and inspection environment with the drawing so dimensions are assessed under defined conditions. The fit in service needs its own review against the application environment.",
    items: ["Identify the PA grade, filler, stock form and any specified conditioning procedure.", "State operating temperature, humidity, fluids and the mating materials.", "Define dimensional tolerances, inspection temperature and moisture condition, especially for fits.", "Include edge finish, quantity, packaging and material documentation requirements."],
    guide: "/blog/nylon-cnc-machining",
    procurement: false,
    learningLinks: [{ href: "/blog/nylon-cnc-machining", label: "Nylon material selection guide" }],
  },
  "nitinol-cnc-machining": {
    name: "Nitinol", description: "Request Nitinol CNC machining quotes from CNCPioneer in China. Share your drawings, material condition, quantity, and inspection needs for an engineering review.",
    hero: "Request a drawing review for custom nickel-titanium components. Provide the material specification, supplied condition and intended function so the machining and verification scope can be assessed.",
    intro: "Nitinol components require a defined material and functional specification. Specify whether the design relies on superelastic or shape-memory behavior and identify the relevant transformation-temperature and test requirements. Geometry, supplied condition and subsequent processing must be assessed together; a machining quote does not by itself validate device performance.",
    items: ["Provide the NiTi material specification, supplier certificate and supplied condition; do not use an unverified grade label.", "Define the intended function, transformation-temperature requirements and any required functional test.", "Identify critical geometry, surface condition, edge requirements and allowed post-processing.", "State quantity, traceability and acceptance requirements; agree feasibility and inspection before production."],
    guide: null,
    procurement: false,
    quoteFaq: {
      question: "What should I specify for a Nitinol machining quote?",
      answer: "Include the NiTi material specification and supplied condition, intended function, and any transformation-temperature or functional-test requirements. Mark critical features, permitted finishing and acceptance criteria on your drawing.",
    },
    procurement: false,
  },
};

export function applyEnglishMaterialContent(pages) {
  for (const page of pages) {
    const edit = materialEdits[page.slug]; if (!edit) continue;
    page.seo = { ...page.seo, description: edit.description, ogDescription: edit.description };
    page.hero = { ...page.hero, description: edit.hero };
    page.material = { ...page.material, heading: `${edit.name} Parts: Material and Drawing Review`, description: edit.intro, bullets: edit.items.slice(0, 3), partsIntro: `Explore representative ${edit.name.toLowerCase()} components below. Material, geometry and acceptance requirements are reviewed for each drawing.` };
    page.capabilitiesHeading = `${edit.name} Machining Process Review`;
    page.capabilityCards = [
      { title: "Turning and Milled Features", text: "Review bores, diameters, threads, flats and cross-holes together with workholding and access. The agreed process depends on the drawing and material condition.", serviceLabel: "CNC Turning and Milling Services", serviceHref: "/services/cnc-turning-and-milling", image: "/wp-content/uploads/2025/12/cnc-turning-and-milling-services-540x260-1.png" },
      { title: "Small Turned Components", text: "For small parts made from bar stock, review diameter, length, slender features and inspection access before selecting a Swiss machining route.", serviceLabel: "Swiss Machining Services", serviceHref: "/services/swiss-machining", image: "/wp-content/uploads/2025/12/swiss-machining-service-540x260-1.png" },
    ];
    page.procurement = edit.procurement === false ? null : { intro: "Provide the following information so material, process, finishing and inspection can be reviewed against your actual part.", items: edit.items, links: edit.guide ? [{ href: edit.guide, label: `${edit.name} material selection guide` }] : [{ href: "/materials", label: "Explore machining materials" }] };
    if (edit.learningLinks) page.learningLinks = edit.learningLinks;
    page.faqs = [
      edit.quoteFaq || { question: `What is needed to quote a ${edit.name.toLowerCase()} part?`, answer: edit.items.join(" ") },
      { question: "How are tolerances and acceptance checks agreed?", answer: "Identify critical dimensions, datums and functional surfaces on the drawing. Feasibility, inspection method, material condition and any post-processing allowances are reviewed before acceptance; no single tolerance applies to every part." },
    ];
  }
}

export function applyEnglishPartMetadata(pages) {
  const page = pages.find(p => p.slug === "cnc-machining-drone-parts");
  if (page) page.seo = { ...page.seo, title: "Custom CNC Machined Drone Parts | CNCPioneer", description: "Get quotes for custom CNC machined drone parts from CNCPioneer in China. Share drawings for UAV housings, brackets, and structural parts with inspection needs." };
}

export function applyEnglishProductContent(content) {
  const heat = content["heat-sinks"];
  if (heat) {
    heat.heroDescription = "Custom CNC machined heat sinks made to your drawing. Review the material, fin geometry, thermal contact face, mounting interfaces and finish before production.";
    heat.overview = ["A machined heat sink combines heat-transfer geometry with the mechanical interfaces needed for installation. Share the fin arrangement, base thickness, contact-face requirements and mounting details so machining access and inspection can be reviewed.", "Thermal performance depends on the full assembly and operating conditions. Provide the selected material, airflow or cooling arrangement and any thermal validation requirements; machining acceptance is agreed against the approved drawing."];
    heat.overviewPoints = [
      { title: "Material and manufacturing route", text: "Specify the alloy and starting form; confirm which surfaces and fin features require machining." },
      { title: "Fin geometry and access", text: "Review fin spacing, height, wall thickness and tool access with the proposed geometry." },
      { title: "Thermal contact and mounting", text: "Define contact-face flatness, finish, holes and datums from the mating assembly." },
      { title: "Finishing and inspection", text: "Identify coated surfaces, masking and required measurements after finishing." },
    ];
    heat.procurement = { intro: "Attach the current drawing and identify the thermal and mechanical interfaces that matter to your assembly.", items: ["Material grade, starting form, fin layout and required quantity.", "Base flatness, contact finish, mounting-hole locations and critical datums.", "Coating or anodizing specification, masking and dimensional acceptance after finishing.", "Operating conditions and separate thermal validation requirements, where applicable."], links: [{ href: "/materials/aluminum-cnc-machining", label: "Aluminum machining" }, { href: "/materials/copper-cnc-machining", label: "Copper machining" }] };
  }
  const drone = content["cnc-machining-drone-parts"];
  if (drone) {
    drone.title = drone.h1 = drone.label = "Custom CNC Machined Drone Parts";
    drone.heroDescription = "Custom CNC machined UAV brackets, housings, motor mounts and structural parts. Send your drawings, material, quantity and inspection requirements for a manufacturing review.";
    drone.procurement = { intro: "Describe the component's role in the UAV assembly so its lightweight geometry and interfaces can be reviewed together.", items: ["Drawing revision, 3D model, alloy and material condition.", "Wall thickness, mass target, mating datums and motor or payload mounting interfaces.", "Finish, masked contact surfaces and dimensional checks after coating.", "Prototype or production quantity, traceability and inspection requirements."], links: [{ href: "/materials/aluminum-cnc-machining", label: "Aluminum machining" }, { href: "/services/cnc-turning-and-milling", label: "Turning and milling services" }] };
  }
  const probe = content["semiconductor-test-probes"];
  if (probe) {
    probe.heroDescription = "Custom machined probe pins, contact bodies and test-socket components to your drawing. Share the contact function, material, finish, assembly features and inspection scope for review.";
    probe.procurement = { intro: "Define the machined component and its role in the probe assembly; component dimensions alone do not validate electrical or lifecycle performance.", items: ["Drawing and model identifying the tip, barrel, shoulder, thread and assembly datums.", "Specified material condition, coating stack, thickness and masked areas.", "Contact, motion and assembly requirements; identify electrical or lifecycle testing separately.", "Quantity, critical dimensions, inspection methods and traceability requirements."], links: [{ href: "/services/swiss-machining", label: "Swiss machining" }, { href: "/materials/brass-cnc-machining", label: "Brass machining" }] };
  }
}
