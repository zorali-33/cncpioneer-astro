// Consolidated flange copy. Keep these additions when rebuilding product data.
export const flangeSeo = {
  title: "Custom CNC Machined Flanges | CNCPioneer",
  description: "Custom CNC machined flanges from CNCPioneer in China. Request quotes for pipe, robot, vacuum, motor mounting and non-standard flanges made to your drawings.",
  canonical: "/custom-cnc-parts/flanges",
};

const combineByTitle = (items, additions) => [...new Map([...items, ...additions].map(item => [item.title, item])).values()];

export function consolidateFlangeContent(product) {
  return {
    ...product,
    title: "Custom CNC Machined Flanges",
    label: "CNC Machined Flanges",
    h1: "Custom CNC Machined Flanges",
    overviewTitle: "Custom CNC Machined Flanges: Product Overview",
    heroDescription: "Custom CNC machined flanges for pipe connections, robot tool changers, motor mounts, vacuum systems and non-standard assemblies. Send your drawing for material, machining, finishing and inspection review.",
    overview: [
      "A CNC machined flange provides a bolted interface between pipes, shafts, housings or equipment. Turning, milling, boring, drilling and threading control the sealing face, bore, pilot register and bolt pattern around the mating assembly.",
      "Custom flange manufacturing is useful when a catalog part cannot meet the required bore, bolt pattern, mounting geometry, material or sealing arrangement. CNCPioneer reviews standard-based and non-standard designs for piping, robot end-effectors, motor mounts, vacuum equipment and structural connections.",
    ],
    overviewPoints: [
      { title: "Standard-Based and Non-Standard Designs", text: "Provide the applicable standard or drawing, flange geometry, mating interfaces and intended operating conditions." },
      { title: "Common Datums for Critical Features", text: "Review the bore, pilot register, mounting face and bolt circle together to define setup and inspection requirements." },
      { title: "Sealing and Surface Requirements", text: "Specify sealing-face finish, O-ring grooves, flatness and coating allowances for the mating parts." },
      { title: "Material and Documentation Review", text: "Confirm alloy, delivery condition, traceability, dimensional reports and any required production approval records." },
    ],
    benefits: [
      { title: "Custom Flange Engineering Review", text: "Review non-standard bores, bolt patterns, pilot fits, wall sections and mating geometry before selecting the manufacturing route." },
      { title: "Turning and Milling Around Shared Datums", text: "Coordinate face, bore, hub, thread and bolt-circle machining to control alignment between functional features." },
      { title: "Pipe, Robot, Motor and Vacuum Interfaces", text: "Bring pipe connections, tool changer interfaces, shaft couplings, vacuum adapters and structural flange designs into one drawing review." },
      { title: "Material Options for the Application", text: "Select aluminum, stainless steel, carbon or alloy steel, brass, titanium or nickel alloys around the drawing and service environment." },
      { title: "Finishing and Inspection Planning", text: "Account for sealing surfaces, coating thickness and critical dimensions when agreeing the finish and inspection plan." },
      { title: "Prototype and Repeat Production Support", text: "Share the expected quantity, delivery schedule and documentation requirements so the quotation reflects the complete part scope." },
    ],
    portfolio: [
      { title: "Pipe, Process & RTJ Flanges", image: "/wp-content/uploads/2026/05/pipe-flange.jpg", text: "Weld neck, slip-on, blind, threaded and other pipe flanges, including specified RTJ sealing faces. Provide the applicable standard, pressure class, material and drawing.", illustration: false },
      { title: "Custom Aluminum Flanges", image: "/wp-content/uploads/2026/05/aluminum-cnc-machining-flange.jpg", text: "6061-T6 and 7075-T6 aluminum flanges for lightweight equipment, cooling systems and mounting interfaces. Define critical fits and finishing allowances.", illustration: false },
      { title: "Stainless Steel Flanges", image: "/wp-content/uploads/2026/05/stainless-steel-cnc-machining-flange.jpg", text: "Stainless flange bodies for process equipment, piping and precision assemblies, with the grade, sealing finish and inspection requirements confirmed to the drawing.", illustration: false },
      { title: "Precision Brass Flanges", image: "/wp-content/uploads/2026/05/brass-machining-precision-flange.jpg", text: "Brass flanges for pressure gauges, instrumentation, valves and pneumatic connections. Specify ports, threads, mating features and any plating requirements.", illustration: false },
      { title: "Robot Tool Changer & End-Effector Flanges", image: "/wp-content/uploads/2026/08/robot-tool-changer-flange-iso9409-custom.jpg", text: "Robot mounting and tool changer flanges with pilot registers, bolt circles and customer-specific interfaces. Share the mating drawing and any applicable ISO 9409-1 interface requirements.", illustration: false },
      { title: "Motor Mounting & Shaft Coupling Flanges", image: "/wp-content/uploads/2026/08/motor-mounting-shaft-coupling-flanges-custom.jpg", text: "Motor mounting and shaft coupling flanges with controlled pilot fits, shaft clearance and bolt patterns, including customer-defined mounting geometry.", illustration: false },
      { title: "Vacuum & Cleanroom Flanges", image: "/wp-content/uploads/2026/08/vacuum-flanges-conflat-iso-kf-cleanroom.jpg", text: "CF, ISO-KF, ISO-K and custom vacuum interfaces. Define the sealing arrangement, material, surface finish, cleaning and documentation requirements with your drawing.", illustration: false },
      { title: "Hydraulic & Pneumatic Manifold Flanges", image: "/wp-content/uploads/2026/08/hydraulic-sae-j518-manifold-flange-custom.jpg", text: "Manifold and hydraulic connection flanges with specified ports, O-ring grooves and bolt patterns. Confirm the interface standard and inspection scope for the application.", illustration: false },
      { title: "Structural & Non-Standard Flanges", image: "/wp-content/uploads/2026/08/structural-machine-frame-flanges-custom.jpg", text: "Machine frame, base, ring and custom-profile flanges made to the required mounting geometry, with datums, flatness and material condition reviewed before machining.", illustration: false },
    ],
    applications: [
      { title: "Oil, Gas & Process Equipment", industry: "Oil & Gas", href: "/industries/oil-gas", image: "/wp-content/uploads/2026/05/oil-gas.jpg", text: "Pipe connections, manifold interfaces and process equipment flanges, with the material, sealing arrangement and operating requirements reviewed against the drawing." },
      { title: "Robotics & Automation", industry: "Robotics", href: "/industries/robotics", image: "/wp-content/uploads/2026/08/robot-system-integrator.jpg", text: "Robot tool changer, end-effector and motor mounting flanges with coordinated pilot fits, bolt patterns and mechanical interfaces." },
      { title: "Semiconductor & Vacuum Equipment", industry: "Semiconductor", href: "/industries/semiconductor", image: "/wp-content/uploads/2026/08/semiconductor-vacuum.jpg", text: "Vacuum chamber connections, instrument adapters and process equipment interfaces with specified sealing surfaces and cleaning requirements." },
      { title: "Aerospace & Defense", industry: "Aerospace", href: "/industries/aerospace", image: "/wp-content/uploads/2026/05/aerospace.jpg", text: "Lightweight and high-strength flange components for equipment and fluid-system interfaces, with drawing-specific inspection and documentation requirements." },
      { title: "Automotive & Cooling Systems", industry: "Automotive", href: "/industries/automotive", image: "/wp-content/uploads/2026/05/automotive.jpg", text: "Mounting and connection flanges for vehicle equipment, cooling systems and related assemblies, matched to the mating geometry and material specification." },
      { title: "Medical & Pharmaceutical Equipment", industry: "Medical", href: "/industries/medical", image: "/wp-content/uploads/2026/08/medical-pharmaceutical.jpg", text: "Instrument, process and equipment flanges with the material, cleanability, surface finish and documentation agreed for the application." },
    ],
    materials: combineByTitle(product.materials, [
      { title: "42CrMo4 Alloy Steel", tag: "Alloy Steel", category: "metals", text: "An option for high-strength coupling and structural flange designs. Confirm the specified heat treatment and material condition with the drawing." },
      { title: "Ti-6Al-4V Titanium", tag: "Titanium", category: "special-alloys", text: "An option for weight-sensitive or corrosion-resistant flange designs, subject to the specified grade, condition and machining requirements." },
      { title: "Inconel 625", tag: "Nickel Alloys", category: "special-alloys", text: "Nickel-alloy options for demanding flange applications. Confirm the exact alloy, service conditions, material certification and finishing scope." },
    ]),
    finishes: combineByTitle(product.finishes, [
      { title: "DLC & PVD Coating", category: "Functional coatings", use: "Specified wear and surface requirements", specify: "Coating system, masking & acceptance", icon: "layers", tone: "blue", summary: "Review coating compatibility with the flange material, mating surfaces and dimensional allowances before specifying the process." },
    ]),
    faqs: [
      { question: "Which custom CNC machined flanges can you produce?", answer: "The range includes pipe and process flanges, aluminum, stainless steel and brass flanges, robot tool changer interfaces, motor mounts, vacuum flanges, manifold connections and non-standard structural profiles.", points: ["Provide the mating drawing, material and expected quantity."] },
      { question: "Can you machine a non-standard flange from my drawing?", answer: "Yes. Share the bore, bolt pattern, pilot register, sealing arrangement and mounting geometry. These features are reviewed together to define the machining datums, finishing allowances and inspection plan.", points: ["Include a 2D drawing and 3D model where available.", "Identify the dimensions that control fit, sealing or alignment."] },
      { question: "What should I specify for robot and motor mounting flanges?", answer: "Define the mating pilot, bolt circle, mounting face and any shaft or cable clearance. Include the relevant interface standard where applicable and identify customer-specific geometry or positioning requirements." },
      { question: "What information is needed for vacuum or sealing flanges?", answer: "State the mating flange type, sealing method, material, surface finish and any cleaning requirements. Include O-ring grooves, knife-edge geometry or other sealing details on the approved drawing." },
      { question: "Which materials, finishes and inspection records are available?", answer: "Material options include aluminum, stainless steel, carbon and alloy steel, brass, titanium and nickel alloys. Finishing and documentation are agreed for the specific material and application.", points: ["Specify material certificates, dimensional reports and any PPAP or FAIR requirements with the enquiry."] },
      { question: "How do I request a custom flange quote?", answer: "Send your drawing or model, material, quantity, critical tolerances, surface finish and requested delivery date. Include the mating interface and any sealing, cleaning or documentation requirements so the quote covers the full scope." },
    ],
    sourceUrl: "https://www.cncpioneer.com/custom-cnc-parts/flanges",
  };
}
