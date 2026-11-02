// Editorial profiles for distinct industry and Swiss-machining landing pages.
// Numerical capabilities and certification claims require separate verification.
import { satelliteIndustryAdditions } from './satelliteIndustryContent.mjs';
const upload = '/wp-content/uploads/';
const image = (file) => `${upload}${file}`;
const part = (title, file) => ({ title, image: image(file) });
const resources = {
  aerospace: ['CNC Machining for Aerospace', 'cnc-machining-aerospace', '2026/01/cnc-machining-aerospace.jpg', 'Explore aerospace applications, material selection, and machining considerations for complex components.'],
  medical: ['Precision Medical Machining: Processes & Materials', 'precision-medical-machining', '2026/01/precision-medical-machining.jpg', 'Review processes, materials, and documentation considerations for medical device components.'],
  swiss: ['Top 10 Swiss Machining Materials', 'swiss-machining-materials', '2025/12/swiss-machining-materials.jpg', 'Compare material options for small turned parts, including machinability, finishing, and application needs.'],
  shaft: ['Shaft Machining: The Ultimate Guide', 'shaft-machining', '2026/01/shaft-machining.jpg', 'Learn how shaft geometry, material selection, and inspection affect fit and repeatability.'],
  connector: ['Connector Machining: The Ultimate Guide', 'connector-machining', '2026/01/connector-machining.jpg', 'Explore machining considerations for electrical contacts, connector bodies, and interface hardware.'],
  materials: ['CNC Machining Materials: The Ultimate Guide', 'cnc-machining-materials', '2025/12/cnc-machining-materials.png', 'Compare metals and engineering plastics for structural, electrical, thermal, and wear-related requirements.'],
  oilgas: ['Oil and Gas Machining: A Comprehensive Guide', 'oil-and-gas-machining', '2026/01/oil-and-gas-machining.jpg', 'Review machining applications, materials, and design considerations for energy equipment components.'],
  plastics: ['Oil and Gas Plastic Machining: A Comprehensive Guide', 'oil-and-gas-plastic-machining', '2026/01/oil-and-gas-plastic-machining.jpg', 'Explore engineering plastics for guides, insulating parts, and other energy equipment applications.'],
  robotics: ['CNC Machining Robot Parts: The Complete Guide', 'cnc-machining-robot-parts', '2026/09/5-axis-cnc-machining.png', 'Explore machining processes, part categories, and design considerations for robotic assemblies.'],
  humanoid: ['Building a Humanoid Robot with CNC Machined Parts', 'building-a-humanoid-robot', '2026/07/humanoid-robots-structure.jpg', 'Review structural, joint, and assembly considerations for CNC machined humanoid robot components.'],
  hands: ['Complete Engineering Guide to Robot Hands', 'robot-hands', '2026/07/Inspire-RH56DFX-hands.jpg', 'Explore the mechanical architecture and component requirements of articulated robot hands.'],
  semiconductor: ['CNC Machining for Semiconductor Industry', 'cnc-machining-for-semiconductor-industry', '2026/04/semiconductor-cnc-machining-parts.webp', 'Review precision components, material selection, and surface considerations for semiconductor equipment.']
};
const grades = {
  aluminum: ['Aluminum', 'Lightweight', 'Al', 'Aluminum Alloys', '6061 / 7075'],
  titanium: ['Titanium', 'Strength to Weight', 'Ti', 'Titanium Alloys', 'Grade 5 / Grade 23 as specified'],
  stainless: ['Stainless Steel', 'Corrosion Resistance', 'SS', 'Stainless Steel', '316L / 17-4PH as specified'],
  nickel: ['Nickel Alloys', 'Demanding Environments', 'Ni', 'Nickel Alloys', 'Inconel 625 / 718 as specified'],
  steel: ['Alloy Steel', 'Load & Wear', 'Fe', 'Alloy Steel', '4140 / 42CrMo as specified'],
  copper: ['Copper & Brass', 'Electrical & Thermal', 'Cu', 'Copper and Brass', 'C101 / C102 / C360 as specified'],
  plastic: ['Engineering Plastics', 'Insulation & Weight', 'P', 'Engineering Plastics', 'PEEK / POM as specified']
};
const material = ([key, summary, parts, finishing, review]) => {
  const [tab, badge, icon, name, spec] = grades[key];
  return { tab, badge, icon, name, spec, summary, facts: [['Typical Parts', parts], ['Finish Planning', finishing], ['Design Review', review]] };
};
const detail = (config) => ({
  usage: { title: 'How Do You Use Our Machining Services', cards: config.usage.map(([title, text], index) => ({ icon: ['upload', 'gears', 'truck'][index], title, text })) },
  quality: { title: 'Quality Assurance Measures', cards: config.quality.map((text, index) => ({ icon: ['cmm', 'fai', 'certificate', 'surface'][index], label: ['Drawing Verification', 'Production Validation', 'Traceability Planning', 'Surface & Assembly'][index], title: ['Critical Dimension Inspection', 'First Article Review', 'Material & Process Records', 'Application-Specific Checks'][index], text })) },
  materials: { title: 'Recommended Materials & Surface Finishes', subtitle: config.materialIntro, items: config.materials.map(material), finishes: config.finishes.map((label, index) => ({ label, highlight: index === 0 })) },
  parts: { title: config.partsTitle, subtitle: config.partsIntro, items: config.parts, link: config.partsLink },
  resources: config.resources.map(key => { const [title, slug, file, excerpt] = resources[key]; return { title, href: `/blog/${slug}`, image: image(file), excerpt }; })
});

const profiles = {
  'aerospace-swiss-machining': {
    title: 'Aerospace Swiss Machining', parent: ['Aerospace', 'aerospace'],
    description: 'Swiss machining for small aerospace pins, contacts, fittings, and threaded hardware, with drawing-led material selection and inspection planning.',
    usage: [
      ['Review Small-Part Designs', 'Share drawings for slender pins, contacts, and fittings. Define datum relationships, thread details, and the surfaces that control assembly fit before sampling.'],
      ['Validate Prototype Assemblies', 'Compare sample components against mating hardware. Resolve burrs, access for gauging, and finishing allowances before approving a repeat order.'],
      ['Plan Repeat Production', 'Set material, revision, inspection, and packaging requirements for recurring part numbers. Confirm the required documentation package as part of quotation.']
    ],
    quality: ['Prioritize contact diameters, bearing seats, thread geometry, and concentric features against the approved drawing and agreed measurement method.', 'Use first-article results to review the complete turned component, including cross-holes, grooves, threads, and the effect of finishing on fit.', 'Define the required alloy specification, heat or lot identification, and any process certificates at order review. Aerospace program requirements remain customer-specific.', 'Specify edge condition, surface finish, cleanliness, and packaging. Any application qualification or flight approval follows the customer program requirements.'],
    materialIntro: 'Select bar-stock alloys around the part function, operating environment, and approved aerospace drawing.',
    materials: [
      ['titanium', 'A candidate for weight-sensitive fasteners, precision pins, and fittings where the drawing calls for titanium.', 'Pins, threaded inserts, fittings', 'Deburring, polishing, specified coatings', 'Alloy condition, slenderness, thread roots'],
      ['stainless', 'Stainless grades serve corrosion-resistant contacts, sensor bodies, and mechanically loaded small components.', 'Sensor bodies, sleeves, connector hardware', 'Passivation or electropolishing when specified', 'Mating fits and finishing allowances'],
      ['nickel', 'Nickel alloys may be considered for small components exposed to demanding thermal or corrosion conditions.', 'Specialty fittings and small threaded hardware', 'Finishing to the approved process requirement', 'Material specification and tool access']
    ],
    finishes: ['Precision Deburring', 'Passivation', 'Polishing', 'Drawing-Specified Coatings', 'Thread Protection', 'Controlled Packaging'],
    partsTitle: 'Aerospace Swiss Machined Components', partsIntro: 'Examples of small turned components; suitability and acceptance criteria are reviewed against each drawing.',
    parts: [part('Structural Fasteners', '2026/04/structural-fasteners-white-v2.png'), part('Pneumatic Fittings', '2026/04/pneumatic-fittings.jpg'), part('Sensor Housings', '2026/04/sensor-housings-instrumentation-bodies.jpg'), part('Avionics Connector Contacts', '2026/04/avionics-connector-pins-contacts.jpg')],
    resources: ['aerospace', 'swiss', 'shaft']
  },
  'medical-swiss-machining': {
    title: 'Medical Swiss Machining', parent: ['Medical', 'medical'],
    description: 'Swiss machining for small medical device components, instrument shafts, connectors, and threaded parts, with material and inspection requirements defined by your drawings.',
    usage: [
      ['Develop Small Device Components', 'Submit component and assembly drawings for instrument shafts, connectors, sleeves, and threaded parts. Identify critical fits, edge conditions, and intended finishing.'],
      ['Evaluate Engineering Samples', 'Check dimensions and assembly behavior before design freeze. Review thin sections, cross-holes, burr removal, and the effect of finishing on small features.'],
      ['Prepare Controlled Repeat Orders', 'Agree drawing revision, material identification, inspection records, and packaging before production. Device validation and release requirements remain with the device manufacturer.']
    ],
    quality: ['Plan measurement of shaft diameters, thread profiles, small bores, and mating features using drawing-defined datums and suitable inspection methods.', 'Review sample results and assembly feedback before repeating a component design. Include finishing-related dimensional changes in the review.', 'Specify material grade, condition, lot identification, and the documentation required for your device supply chain at quotation.', 'Define burr limits, surface condition, cleaning, and packaging explicitly. Agree device-program validation and cleanliness acceptance criteria before release.'],
    materialIntro: 'Material choice follows the device design and its validation requirements; grade names alone do not establish suitability.',
    materials: [
      ['stainless', 'Specified stainless grades can be considered for instrument shafts, sleeves, and small connector bodies.', 'Instrument shafts, sleeves, connectors', 'Passivation or electropolishing as specified', 'Surface condition and mating fits'],
      ['titanium', 'Titanium grades may be specified for lightweight device hardware and implant-related component development.', 'Small threaded components and device hardware', 'Controlled deburring and specified finishing', 'Grade, condition, and validation requirements'],
      ['plastic', 'Engineering plastics can support insulating, guiding, or lightweight mechanical functions in device assemblies.', 'Guides, spacers, insulating sleeves', 'Burr control and specified cleaning', 'Material identity and dimensional stability']
    ],
    finishes: ['Precision Deburring', 'Passivation', 'Electropolishing', 'Surface Inspection', 'Specified Cleaning', 'Protective Packaging'],
    partsTitle: 'Medical Swiss Machined Components', partsIntro: 'Component examples for development and sourcing; final use and qualification depend on the device program.',
    parts: [part('Medical Connectors', '2025/12/medical-connector.jpg'), part('Surgical Instrument Shafts', '2026/04/surgical-instrument-shafts.jpg'), part('Bone Screw Components', '2026/04/bone-screws-orthopedic-fasteners.jpg'), part('Orthopedic Pins', '2025/12/orthopedic-pin.jpg')],
    resources: ['medical', 'connector', 'swiss']
  },
  'defense-swiss-machining': {
    title: 'Defense Swiss Machining', parent: ['Defense', 'defense'],
    description: 'Swiss machining for precision contacts, sensor bodies, sleeves, and connector hardware used in defense electronics and support equipment.',
    usage: [
      ['Review Electronics Hardware', 'Share drawings for connector contacts, sensor bodies, and small turned support components. Identify interface dimensions and the records required for procurement.'],
      ['Validate Fit and Finish', 'Use engineering samples to evaluate contact seating, threaded interfaces, burr condition, and coating allowances before approving the manufacturing route.'],
      ['Coordinate Repeat Supply', 'Define revision control, material identification, inspection scope, and packaging for recurring hardware. Program-specific acceptance requirements are reviewed before order placement.']
    ],
    quality: ['Focus inspection on contact geometry, connector mating diameters, sensor-body threads, and other drawing-defined interfaces.', 'Confirm sample dimensions and finish allowances against the approved revision before repeating electronics or instrumentation hardware.', 'Agree material identification, finishing records, and document retention requirements with the procurement team. Required certifications are reviewed for each order.', 'Define surface condition, coating thickness allowances, thread protection, and packaging for electrical or instrumentation assembly.'],
    materialIntro: 'Match small hardware materials to electrical, mechanical, and environmental requirements on the approved drawing.',
    materials: [
      ['copper', 'Copper and brass are candidate materials for conductive contacts and small electrical interface components.', 'Contacts and terminal hardware', 'Specified nickel or other contact plating', 'Conductivity, fit, and plating allowance'],
      ['stainless', 'Stainless grades can support durable sensor bodies, sleeves, and connector hardware in exposed environments.', 'Sensor bodies, sleeves, threaded hardware', 'Passivation and controlled deburring', 'Threads and corrosion requirements'],
      ['aluminum', 'Aluminum may be considered for low-mass instrumentation bodies and compact supporting hardware.', 'Instrument bodies and spacers', 'Anodizing or conversion coating as specified', 'Wall thickness and electrical interfaces']
    ],
    finishes: ['Precision Deburring', 'Passivation', 'Specified Contact Plating', 'Anodizing', 'Thread Inspection', 'Protective Packaging'],
    partsTitle: 'Precision Electronics & Instrumentation Hardware', partsIntro: 'Representative turned components for connector, sensing, and support-equipment assemblies.',
    parts: [part('RF Connector Contacts', '2026/04/rf-connector-contacts.jpg'), part('Connector Pins', '2026/04/sonar-connector-pins.jpg'), part('Threaded Sensor Housings', '2026/04/threaded-sensor-housings.jpg'), part('Electrical Contacts', '2025/12/connector-pins.jpg')],
    resources: ['connector', 'swiss', 'shaft']
  },
  'automotive-swiss-machining': {
    title: 'Automotive Swiss Machining', parent: ['Automotive', 'automotive'],
    description: 'Swiss machining for automotive sensor housings, small shafts, pins, and electrical terminals, from engineering samples to repeat component supply.',
    usage: [
      ['Prototype Small Vehicle Components', 'Review drawings for sensor bodies, shafts, pins, and electrical terminals. Identify critical fits and the assembly or test requirements for engineering samples.'],
      ['Validate the Production Route', 'Use sample inspection and assembly feedback to refine turning, cross-drilling, threading, and finishing steps before establishing a repeat manufacturing process.'],
      ['Plan Scheduled Deliveries', 'Discuss batch quantities, forecast changes, revision control, and packaging. Define any customer-specific sample approval or production documentation during quotation.']
    ],
    quality: ['Define key shaft diameters, pin fits, thread details, and connector interfaces against drawing datums rather than applying one general tolerance to every feature.', 'Review first-article dimensions, assembly checks, and finishing effects before repeating automotive part numbers.', 'Set alloy and lot identification requirements, inspection records, and revision control at order review. Required production approval documents are agreed per program.', 'Check burr-sensitive cross-holes, seal-related surfaces, threads, and plated contact interfaces against the specified acceptance criteria.'],
    materialIntro: 'Consider part load, corrosion exposure, electrical function, and the planned production route when choosing a bar-stock grade.',
    materials: [
      ['steel', 'Alloy steels may be specified for pins and small shafts that require controlled strength or wear behavior.', 'Pins and small transmission shafts', 'Heat treatment or protective coating as specified', 'Distortion and post-finish dimensions'],
      ['stainless', 'Stainless grades can support small sensor housings and hardware exposed to moisture or corrosive conditions.', 'Sensor bodies and small sleeves', 'Passivation and controlled deburring', 'Threads, sealing features, and mating fits'],
      ['copper', 'Copper and brass can be considered for terminals and conductive interface components in vehicle electrical assemblies.', 'Terminals and connector contacts', 'Specified electrical contact plating', 'Contact dimensions after plating']
    ],
    finishes: ['Precision Deburring', 'Passivation', 'Specified Heat Treatment', 'Contact Plating', 'Surface Inspection', 'Batch Packaging'],
    partsTitle: 'Automotive Swiss Machined Parts', partsIntro: 'Small turned components for sensor, drivetrain, braking, and electrical component development.',
    parts: [part('Small Transmission Shafts', '2026/04/transmission-shafts.jpg'), part('Automotive Sensor Housings', '2026/04/automotive-sensor-housings.jpg'), part('Braking Pins', '2026/04/braking-pins.jpg'), part('EV Charging Terminals', '2026/04/ev-charging-terminal.jpg')],
    resources: ['shaft', 'connector', 'swiss']
  },
  'oil-gas-swiss-machining': {
    title: 'Oil & Gas Swiss Machining', parent: ['Oil & Gas', 'oil-gas'],
    description: 'Swiss machining for small valve stems, instrumentation pins, fittings, and sensor hardware, with materials and acceptance requirements reviewed for the service environment.',
    usage: [
      ['Define the Service Conditions', 'Supply drawings with the operating environment, material specification, seal interfaces, and any project-specific documentation needed for small energy-equipment components.'],
      ['Validate Functional Interfaces', 'Review sample stem diameters, seating geometry, small passages, and threaded connections. Agree the inspection scope before assembly or equipment testing.'],
      ['Support Repeat & Replacement Parts', 'Coordinate approved revisions, material availability, batch identification, and packaging for recurring supply or maintenance-related component requirements.']
    ],
    quality: ['Prioritize seal diameters, stem straightness, thread geometry, and small passages against drawing-defined acceptance criteria.', 'Compare sample dimensional results with assembly requirements before repeating a valve, fitting, or instrumentation component.', 'Specify alloy condition, heat identification, and required test or finishing records. Sour-service or other specialist requirements need explicit project review.', 'Agree roughness, edge condition, coating allowance, and cleanliness for mating or wetted surfaces. Pressure validation is defined with the equipment program.'],
    materialIntro: 'Select materials for the actual fluid, temperature, pressure, and corrosion conditions stated by the equipment designer.',
    materials: [
      ['stainless', 'Specified stainless grades may be considered for instrumentation fittings, valve stems, and sensor hardware.', 'Stems, fittings, sensor bodies', 'Passivation or electropolishing as specified', 'Fluid compatibility and seal surfaces'],
      ['nickel', 'Nickel alloys are candidates where the service specification requires enhanced corrosion or temperature resistance.', 'Specialist fittings and small valve hardware', 'Drawing-defined finishing and cleaning', 'Alloy condition and acceptance records'],
      ['plastic', 'Engineering plastics may support insulating, guiding, and other non-metallic functions in equipment assemblies.', 'Guides, sleeves, insulating spacers', 'Controlled deburring and specified cleaning', 'Temperature, fluid exposure, and creep']
    ],
    finishes: ['Precision Deburring', 'Passivation', 'Electropolishing', 'Specified Coatings', 'Surface Roughness Review', 'Protective Packaging'],
    partsTitle: 'Small Oil & Gas Equipment Components', partsIntro: 'Representative turned parts for instrumentation, valves, fittings, and associated mechanical assemblies.',
    parts: [part('Valve Stems', '2026/04/valve-stem.jpg'), part('Instrumentation Pins', '2026/04/instrumentation-pins.jpg'), part('Instrument Fittings', '2025/12/instrument-fitting.jpg'), part('Orifice Fittings', '2025/12/orifice-fittings.jpg')],
    resources: ['oilgas', 'plastics', 'swiss']
  },
  robotics: {
    title: 'CNC Machining for Robotics',
    description: 'Precision machined joint housings, robot arm links, shafts, and end-effector hardware for industrial, collaborative, and mobile robot assemblies.',
    usage: [
      ['Develop Motion Assemblies', 'Share drawings for joint housings, links, shafts, and end-effector interfaces. Review bearing seats, locating datums, cable paths, and access for assembly.'],
      ['Iterate Functional Prototypes', 'Evaluate fit, alignment, stiffness, and component weight in prototype assemblies. Use inspection feedback to refine the next mechanical design revision.'],
      ['Move to Repeat Part Sets', 'Coordinate mating components under controlled revisions. Agree material, finishing, inspection, and packaging so repeat sets can be assembled consistently.']
    ],
    quality: ['Measure bearing bores, locating faces, shaft fits, and joint interfaces from a common datum plan to control assembly alignment.', 'Review sample housings, links, and interface parts together where their dimensional relationships affect motion or assembly.', 'Define material identification and revision records for each component in the robotic assembly, including finishing allowances and mating part references.', 'Specify burr removal around cable routes, finish on sliding or bearing interfaces, and any assembly checks required by the robot design.'],
    materialIntro: 'Choose materials around mass, stiffness, joint loading, wear, and the operating environment of the robot.',
    materials: [
      ['aluminum', 'Aluminum is a candidate for robot links, covers, joint housings, and other weight-sensitive structural components.', 'Arm links, covers, joint housings', 'Anodizing or bead blasting as specified', 'Thin walls, datum access, and stiffness'],
      ['steel', 'Alloy steel may be specified for shafts, pins, and load-bearing mechanical interfaces.', 'Shafts, pins, coupling hardware', 'Specified heat treatment and protective finish', 'Bearing fits and finishing distortion'],
      ['plastic', 'Engineering plastics can support lightweight guiding, insulating, and wear-related functions within robot assemblies.', 'Guides, cable supports, spacers', 'Controlled deburring and surface inspection', 'Wear, creep, and assembly clearances']
    ],
    finishes: ['Anodizing', 'Precision Deburring', 'Specified Heat Treatment', 'Passivation', 'Bearing-Fit Inspection', 'Assembly Protection'],
    partsTitle: 'CNC Machined Robotics Components', partsIntro: 'Representative parts for robot joints, structural links, sensing interfaces, and end-of-arm tooling.',
    parts: [part('Joint Bearing Housings', '2026/06/robot-joint-bearing-housing-torque-sensor.jpg'), part('Robot Arm Structural Links', '2026/06/robot-arm-structural-link-fittings.jpg'), part('End-Effector Interfaces', '2026/06/robot-end-effector-tool-changer-robotic.jpg'), part('Joint Drive Components', '2026/06/robot-joint-drive-components.jpg'), part('AMR Drive Hubs & Wheel Interfaces', '2026/06/amr-mobile-robot-drive-parts.jpg'), part('Torque Sensor & Encoder Interfaces', '2026/06/high-volume-cobot-joint-housing-torque-sensor.jpg')],
    resources: ['robotics', 'humanoid', 'shaft']
  },
  server: {
    title: 'CNC Machining for Server & Data Center Hardware',
    description: 'CNC machining for server cooling components, chassis hardware, shielding parts, and connector interfaces, supporting prototype and low-volume equipment builds.',
    usage: [
      ['Prototype Thermal & Chassis Parts', 'Share CAD files for cooling plates, chassis interfaces, brackets, and storage carriers. Identify mounting planes, sealing features, and space constraints.'],
      ['Validate Equipment Integration', 'Use machined samples to review board clearance, rack fit, cooling interfaces, and fastening access before committing to a repeat component design.'],
      ['Support Equipment Revisions', 'Coordinate revision-controlled parts for server prototypes, low-volume systems, and replacement hardware. Specify surface treatment and packaging for electronics assembly.']
    ],
    quality: ['Inspect mounting surfaces, hole patterns, cold-plate interfaces, and chassis datums against the server assembly drawing.', 'Review first-article fit within the intended rack, board, or cooling assembly. Define leak or pressure testing separately when applicable.', 'Specify material identification, drawing revision, and coating records for hardware that interfaces with thermal, electrical, or structural systems.', 'Define burr limits, sealing surface condition, conductive contact areas, and cleanliness for integration with electronics and cooling assemblies.'],
    materialIntro: 'Material choices depend on thermal design, electrical interfaces, corrosion compatibility, and structural constraints.',
    materials: [
      ['aluminum', 'Aluminum can support lightweight chassis hardware, mounting brackets, cooling structures, and equipment covers.', 'Chassis brackets, cooling bodies, covers', 'Anodizing, conversion coating, or bare interfaces', 'Mounting flatness and conductive contact areas'],
      ['copper', 'Copper may be specified for heat spreaders, cooling elements, and electrical interface components.', 'Cold-plate elements, heat spreaders, contacts', 'Specified plating and surface cleaning', 'Thermal interfaces and material compatibility'],
      ['stainless', 'Stainless grades may be selected for durable fittings, fastening hardware, and equipment interfaces.', 'Fittings, small shafts, fastening hardware', 'Passivation and controlled deburring', 'Threads and mating interfaces']
    ],
    finishes: ['Precision Deburring', 'Anodizing', 'Conversion Coating', 'Specified Nickel Plating', 'Surface Flatness Review', 'Protective Packaging'],
    partsTitle: 'Server & Data Center Components', partsIntro: 'Representative hardware for thermal management, rack integration, storage, and electrical interfaces.',
    parts: [part('Server Chassis Hardware', '2026/06/server-chassis-cnc-machining.jpg'), part('GPU Cold Plates', '2026/06/gpu-cold-plate-liquid-cooling.jpg'), part('Rack Structural Hardware', '2026/06/server-rack-structural-hardware.jpg'), part('Storage Drive Carriers', '2026/06/storage-drive-carrier.jpg')],
    resources: ['connector', 'materials', 'semiconductor']
  },
  satellites: {
    title: 'Satellite Component CNC Machining', parent: ['Aerospace', 'aerospace'],
    description: 'CNC machining for satellite frames, mechanism brackets, housings, and connector hardware, with drawing-led control of mass, interfaces, and documentation.',
    usage: [
      ['Develop Spacecraft Interfaces', 'Share drawings for structural frames, brackets, housings, and connector hardware. Identify mass targets, mating datums, fastening interfaces, and documentation requirements.'],
      ['Build Engineering Models', 'Use machined components for fit checks and ground-based assembly development. Review access, alignment, and any finishing changes before the next design revision.'],
      ['Prepare Program-Specific Hardware', 'Agree configuration control, material records, inspection, and packaging for the intended satellite program. Environmental qualification is defined by the customer specification.']
    ],
    quality: ['Define inspection around mounting patterns, structural datums, housing bores, and connector interfaces that control spacecraft assembly fit.', 'Use first-article records to review mass-sensitive features, thin walls, mating parts, and the effect of finishing on interfaces.', 'Agree material specification, lot identification, revision history, and process records required by the satellite program before order acceptance.', 'Specify cleanliness, edge condition, and approved surface treatments. Outgassing, vibration, and thermal qualification require their own program-defined evidence.'],
    materialIntro: 'Select materials and finishes from the approved spacecraft design, including mass, thermal, and environmental requirements.',
    materials: [
      ['aluminum', 'Specified aluminum alloys can support low-mass frames, housings, panels, and mechanism brackets.', 'Frames, housings, brackets', 'Drawing-approved anodizing or conversion coating', 'Thin sections, mounting datums, and mass'],
      ['titanium', 'Titanium may be specified for compact high-load interfaces and weight-sensitive fastening hardware.', 'Fasteners and loaded interface components', 'Approved deburring and finishing processes', 'Alloy condition and mating interfaces'],
      ['stainless', 'Stainless grades can support connector hardware, precision sleeves, and selected mechanism components.', 'Connector bodies, sleeves, shafts', 'Drawing-specified passivation or polishing', 'Surface condition and program compatibility']
    ],
    finishes: ['Drawing-Approved Finishes', 'Precision Deburring', 'Anodizing', 'Conversion Coating', 'Surface Inspection', 'Controlled Packaging'],
    partsTitle: 'Satellite CNC Machined Components', partsIntro: 'Representative structural, mechanism, and interface hardware; environmental qualification remains program-specific.',
    parts: [part('Satellite Structural Frames', '2026/05/satellite-aluminum-structure-frame.jpg'), part('Mechanism Brackets', '2026/05/satellite-mechanism-brackets.jpg'), part('Satellite Connector Bodies', '2026/05/90-degree-satellite-connectors.jpg'), part('Attitude-Control Housings', '2026/05/attitude-control-satellite-housings.jpg')],
    resources: ['aerospace', 'connector', 'swiss']
  },
  'humanoid-robot-cnc-machining': {
    title: 'Humanoid Robot CNC Machining', parent: ['Robotics', 'robotics'],
    description: 'CNC machined actuator housings, limb joints, hand components, and torso hardware for humanoid robot prototypes and evolving mechanical designs.',
    usage: [
      ['Develop Joint & Actuator Parts', 'Review housings, shaft interfaces, bearing locations, and limb structures around joint load paths, assembly access, cable routing, and component mass.'],
      ['Iterate Hands & Limb Assemblies', 'Use sample fingers, pivots, joint parts, and structural links to review fit, motion clearance, and the relationship between small turned and larger milled components.'],
      ['Coordinate Changing Part Sets', 'Maintain drawing revision and mating-part references across actuator, hand, limb, and torso assemblies. Agree inspection and finishing requirements for each iteration.']
    ],
    quality: ['Inspect actuator bores, bearing seats, joint alignment faces, and pivot features using a datum plan that reflects the assembled robot.', 'Review first-article measurements across mating components before repeating a joint or actuator part set.', 'Track approved drawing revisions and material identification across multiple limb or hand variants to reduce assembly mix-ups.', 'Define burr removal at tendon or cable paths, finish at bearing interfaces, and the clearances needed for articulated motion.'],
    materialIntro: 'Balance component mass, stiffness, joint loading, and wear when selecting materials for humanoid robot mechanisms.',
    materials: [
      ['aluminum', 'Aluminum can support lightweight actuator housings, limb links, and torso structures that benefit from machined mounting interfaces.', 'Actuator housings, limb links, torso hardware', 'Anodizing or specified cosmetic finishing', 'Thin walls, stiffness, and mounting datums'],
      ['steel', 'Alloy steel may be specified for compact shafts, pins, and loaded pivot interfaces.', 'Joint shafts, pivot pins, coupling parts', 'Specified heat treatment and protective finish', 'Wear, bearing fits, and distortion'],
      ['plastic', 'Engineering plastics can support cable guidance, insulation, and low-mass spacers within compact articulated assemblies.', 'Cable guides, spacers, insulating components', 'Controlled deburring and surface inspection', 'Clearance, creep, and wear']
    ],
    finishes: ['Anodizing', 'Precision Deburring', 'Specified Heat Treatment', 'Bearing-Fit Inspection', 'Surface Inspection', 'Part Identification'],
    partsTitle: 'Humanoid Robot Machined Components', partsIntro: 'Distinct component groups for actuators, limb joints, dexterous hands, and structural integration.',
    parts: [part('Actuator Components', '2026/07/humanoid-robot-actuator-components.jpg'), part('Leg Joint Components', '2026/07/humanoid-robot-leg-joint-components.jpg'), part('Dexterous Hand Components', '2026/07/humanoid-robot-hand-components.jpg'), part('Torso Frame Components', '2026/07/humanoid-robot-torso-frame-components.jpg')],
    resources: ['humanoid', 'hands', 'robotics']
  },
  evtol: {
    title: 'eVTOL Precision CNC Machining', parent: ['Aerospace', 'aerospace'],
    description: 'CNC machining for eVTOL motor shafts, tilt-system hardware, actuator housings, and structural fittings, supporting development and program-specific component supply.',
    usage: [
      ['Review Propulsion & Airframe Parts', 'Share drawings for motor shafts, actuator housings, tilt interfaces, and structural fittings. Identify bearing locations, assembly datums, and material requirements.'],
      ['Validate Development Assemblies', 'Use machined samples to assess dimensional fit, mass targets, and assembly access. Review thin sections and finishing effects before advancing a component revision.'],
      ['Plan Controlled Component Supply', 'Agree configuration control, material records, inspection scope, and packaging for your eVTOL program. Airworthiness acceptance and qualification are defined by the customer.']
    ],
    quality: ['Set inspection priorities for shaft journals, housing bores, mounting faces, and tilt-system interfaces based on drawing datums.', 'Review first-article results and mating assemblies before repeating development hardware or releasing a component revision.', 'Define alloy and lot identification, revision control, inspection records, and any specified finishing documentation during program review.', 'Specify edge condition and surface requirements for loaded interfaces. Fatigue, balance, and environmental validation are separate program-defined activities.'],
    materialIntro: 'Choose materials around the approved propulsion or airframe design, mass targets, and the required manufacturing route.',
    materials: [
      ['titanium', 'Titanium may be specified for weight-sensitive shafts, fittings, and compact loaded interfaces.', 'Motor shafts and structural fittings', 'Drawing-approved deburring and finishing', 'Alloy condition and loaded interfaces'],
      ['aluminum', 'Aluminum can support lightweight motor housings, actuator bodies, and structural mounting hardware.', 'Motor housings, actuator bodies, brackets', 'Approved anodizing or conversion coating', 'Bearing seats, thin walls, and mounting faces'],
      ['steel', 'Specified steel grades may be considered for shafts, pins, and mechanisms where load or wear requirements govern.', 'Mechanism shafts, pins, coupling hardware', 'Specified heat treatment and protective finish', 'Distortion, fits, and inspection datums']
    ],
    finishes: ['Drawing-Approved Finishes', 'Precision Deburring', 'Anodizing', 'Specified Heat Treatment', 'Surface Inspection', 'Controlled Packaging'],
    partsTitle: 'eVTOL CNC Machined Components', partsIntro: 'Representative propulsion, mechanism, and structural parts for eVTOL engineering and sourcing programs.',
    parts: [part('Motor Shafts', '2026/08/evtol-motor-shaft-tc4.jpg'), part('Tilt Shafts', '2026/08/evtol-tilt-shaft.jpg'), part('Structural Fittings', '2026/08/evtol-structural-fitting.jpg'), part('Motor Stator Housings', '2026/08/evtol-motor-stator-housing.jpg')],
    partsLink: { href: '/custom-cnc-parts/connector-pins#product-application-detail', label: 'View eVTOL Connector Pins & Terminals' },
    resources: ['aerospace', 'shaft', 'materials']
  }
};

const searchDescriptions = {
  'aerospace-swiss-machining': 'Aerospace Swiss machining for small pins, contacts, fittings, and threaded hardware, with drawing-led material selection and inspection planning.',
  'medical-swiss-machining': 'Medical Swiss machining for instrument shafts, connectors, sleeves, and small threaded components, with drawing-led materials and inspection.',
  'defense-swiss-machining': 'Swiss machining for connector contacts, sensor bodies, sleeves, and precision support hardware for defense electronics and instrumentation.',
  'automotive-swiss-machining': 'Automotive Swiss machining for sensor housings, shafts, pins, and electrical terminals, supporting engineering samples and repeat component supply.',
  'oil-gas-swiss-machining': 'Oil and gas Swiss machining for valve stems, instrumentation pins, fittings, and sensor hardware, with material and inspection requirements reviewed.',
  robotics: 'CNC machining for robotics: joint housings, arm links, shafts, and end-effector hardware for industrial, collaborative, and mobile robot assemblies.',
  server: 'CNC machining for server and data center hardware, including cooling components, chassis parts, shielding hardware, and connector interfaces.',
  satellites: 'Satellite component CNC machining for frames, brackets, housings, and connector hardware, with drawing-led interfaces and documentation planning.',
  'humanoid-robot-cnc-machining': 'Humanoid robot CNC machining for actuator housings, limb joints, hand components, and torso hardware, supporting prototypes and design iterations.',
  evtol: 'eVTOL CNC machining for motor shafts, tilt-system hardware, actuator housings, and structural fittings, supporting program-specific component supply.'
};

export const industrySpecializations = Object.fromEntries(Object.entries(profiles).map(([slug, config]) => [slug, {
  detail: detail(config),
  hero: { title: config.title, description: config.description },
  seo: { title: `${config.title} | CNCPioneer`, description: searchDescriptions[slug] },
  parent: config.parent ? { label: config.parent[0], href: `/industries/${config.parent[1]}` } : null
}]));

// Retain the satellite industry workflow while adding the consolidated product
// range, material requirements and FAQ at its single overview URL.
industrySpecializations.satellites = {
  ...industrySpecializations.satellites,
  ...satelliteIndustryAdditions,
  detail: { ...industrySpecializations.satellites.detail, ...satelliteIndustryAdditions.detail },
};


