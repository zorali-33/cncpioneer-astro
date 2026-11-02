// Reviewed 2026-10-27: replace repeated benefit text with feature-specific drawing and acceptance guidance.
export const productBenefitCorrections = {
  "5-axis-cnc-machining-for-humanoid-robots": [
    {
      "matchTitle": "True-Surface Topology-Optimized Lightweight Structures",
      "title": "Lightweight Structural Features",
      "text": "Define the ribs, webs and weight-reduction pockets that must remain after machining. Share load-bearing interfaces and any geometry that may be changed during manufacturability review."
    },
    {
      "matchTitle": "Thin-Wall Monocoque Shell Machining",
      "title": "Thin-Wall Shell Support",
      "text": "Identify minimum walls, unsupported spans and surfaces prone to distortion. Review stock condition, workholding and the inspection state before approving the shell design."
    },
    {
      "matchTitle": "Deep Cavity & Undercut Access in Complex Robot Housings",
      "title": "Deep Pockets and Undercuts",
      "text": "Check cutter reach, entry direction and clearance around deep cavities. Identify inaccessible undercuts early so the drawing can allow a different tool approach or separate component."
    }
  ],
  "aluminum-cnc-turning-parts": [
    {
      "matchTitle": "PCD Tooling",
      "title": "Tooling for Aluminum Features",
      "text": "Review alloy, chip evacuation and the finish required on each turned surface before selecting cutting tools. Separate roughing allowances from the final dimensional requirements."
    },
    {
      "matchTitle": "CBN Precision Cylindrical Grinding",
      "title": "Secondary Finishing Review",
      "text": "Identify journals or sealing surfaces that may need grinding or another finishing operation. Confirm suitability for the aluminum alloy and quote these operations separately where required."
    }
  ],
  "aluminum-shafts-cnc-turning": [
    {
      "matchTitle": "MAZAK Mill-Turn & Swiss CNC Dual Platform",
      "title": "Turning and Milled Shaft Features",
      "text": "Review bearing journals together with flats, cross-holes and drive features. The shaft length, stock diameter and feature access determine the proposed turning and milling route."
    },
    {
      "matchTitle": "24-Hour Robot Output Shaft DFM Review",
      "title": "Drawing Review Before Quotation",
      "text": "Supply the shaft drawing, mating fits and annual or batch quantity. Review slender sections, setup references and any missing acceptance criteria before price and delivery are agreed."
    }
  ],
  "brass-nipple": [
    {
      "matchTitle": "Long Nipple Straightness ±0.020mm/100mm",
      "title": "Long Nipple Alignment",
      "text": "Specify overall length, bore alignment and the thread relationship at both ends. Review how the part will be held and measured without assuming one straightness limit suits every size."
    },
    {
      "matchTitle": "PTFE Pre-Applied Thread Sealant on Both Ends",
      "title": "Thread Sealant Requirements",
      "text": "Identify whether pre-applied sealant is required, the approved product and the surfaces to keep clear. Agree application, curing, packaging and inspection separately from machining."
    }
  ],
  "brass-pipe-fittings": [
    {
      "matchTitle": "MAZAK Mill-Turn C-Axis ±0.020°",
      "title": "Turned and Milled Fitting Geometry",
      "text": "Review thread axes, wrench flats, cross-passages and sealing faces together. Define their datum relationships so the proposed setup supports the required assembly alignment."
    },
    {
      "matchTitle": "Complete Fitting Type Portfolio from One IATF 16949 Source",
      "title": "Fitting Family Coordination",
      "text": "Group elbows, adapters and straight fittings by drawing revision and material. State the thread standard, sealing method and quantity for each item to prevent substitutions across the set."
    }
  ],
  "brass-turning-milling-parts": [
    {
      "matchTitle": "Swiss CNC C-Axis for Small Brass Precision Parts",
      "title": "Small Brass Part Feature Access",
      "text": "Specify which holes, flats or slots must align with the turned diameter. Review bar size and tool access before choosing a Swiss or mill-turn setup."
    },
    {
      "matchTitle": "Knurl Engineering",
      "title": "Knurl Pattern and Grip",
      "text": "Define straight or diamond knurling, the controlled diameter and the required grip area. Identify cosmetic boundaries and mating clearances affected by the knurled surface."
    }
  ],
  "cnc-machined-flange": [
    {
      "matchTitle": "Custom Flange Adapter CNC as Design-Engineering Partnership",
      "title": "Flange Adapter Interface Review",
      "text": "Identify both mating interfaces, bolt patterns and the locating diameter. Resolve conflicting datums or inaccessible features before selecting stock and planning the machining sequence."
    },
    {
      "matchTitle": "Custom Aluminum CNC Machining",
      "title": "Aluminum Grade and Condition",
      "text": "Specify the aluminum alloy, temper and stock form. Review thin sections, finishing allowances and assembly loads before accepting a material alternative for the flange."
    },
    {
      "matchTitle": "Sealing Face Ra 0.8μm Direct from CNC Turning",
      "title": "Sealing Face Requirements",
      "text": "State the sealing arrangement, controlled surface finish and permitted lay on the drawing. Distinguish gasket contact areas from faces that only provide mounting clearance."
    },
    {
      "matchTitle": "Documentation and Production Support",
      "title": "Order Documentation",
      "text": "List the material records, dimensional results and drawing revision required with delivery. Agree the inspection coverage and record format before production begins."
    }
  ],
  "cnc-machinery-parts": [
    {
      "matchTitle": "Liftfork CNC Machinery Part Engineering",
      "title": "Material-Handling Component Interfaces",
      "text": "For forklift-related parts, identify mounting bores, locating faces and wear interfaces. Provide the applicable component drawing and inspection requirements for the intended assembly."
    },
    {
      "matchTitle": "Swiss CNC Precision for Small Machinery Parts",
      "title": "Small Turned Machinery Parts",
      "text": "Pins, bushings and spacers need defined mating fits and accessible inspection features. Review slender sections, grooves and thread runouts against the proposed bar-stock route."
    },
    {
      "matchTitle": "MAZAK Mill-Turn for Complex Multi-Feature Machinery Parts",
      "title": "Multi-Feature Machinery Components",
      "text": "Review pockets, cross-holes, flats and turned surfaces as one component. Decide which datum relationships require a shared setup and which features allow separate operations."
    }
  ],
  "cnc-prototyping-humanoid-robot-parts": [
    {
      "matchTitle": "Speed Matched to Humanoid Iteration Cadence",
      "title": "Prototype Revision Planning",
      "text": "Identify the design revision and the questions each prototype must answer. Separate urgent fit checks from features that require the final production material or finish."
    },
    {
      "matchTitle": "Production Accuracy on Prototype Quantities",
      "title": "Critical Prototype Dimensions",
      "text": "Mark the dimensions needed to evaluate joint fit, motion or assembly. Agree practical inspection methods so prototype feedback distinguishes geometry issues from measurement differences."
    },
    {
      "matchTitle": "Same-Day DFM Accelerating Design Convergence",
      "title": "Manufacturability Feedback",
      "text": "Submit the model with critical datums, tool-access concerns and permitted design changes. Review thin walls, deep pockets and small internal radii before the next design release."
    },
    {
      "matchTitle": "Seamless Prototype-to-Production Continuity",
      "title": "Prototype-to-Production Handover",
      "text": "Record accepted changes, material condition and inspection results from the prototype. Reconfirm tooling, setup and acceptance requirements when quantities move to repeat production."
    }
  ],
  "cnc-turning-humanoid-robot-components": [
    {
      "matchTitle": "Complete Actuator Shaft Portfolio",
      "title": "Actuator Shaft Feature Definition",
      "text": "Specify bearing journals, coupling seats, shoulders and retention grooves. Show their relationships to the functional axis instead of dimensioning each feature independently."
    },
    {
      "matchTitle": "Robot Actuator Engineering Fluency",
      "title": "Actuator Assembly Context",
      "text": "Provide the mating bearing, reducer or motor interface where available. Reviewing the assembly stack helps identify fits and clearances that need confirmation before machining."
    }
  ],
  "cnc-turning-precision-washers": [
    {
      "matchTitle": "Swiss CNC Guide Bushing Precision Foundation",
      "title": "Thin Washer Workholding",
      "text": "State washer thickness, diameter and material condition. Review support during machining and deburring to limit distortion of thin sections and avoid damage during inspection."
    },
    {
      "matchTitle": "Single-Setup OD-Bore-Face Geometric Accuracy",
      "title": "Face, Bore and Diameter Relationships",
      "text": "Define the datum face and the required relationship between bore and outside diameter. Separate thickness variation, flatness and runout requirements on the drawing."
    }
  ],
  "compression-tube-fitting": [
    {
      "matchTitle": "Complete Fitting Type Portfolio from One AS9100D / IATF 16949 Source",
      "title": "Coordinated Fitting Components",
      "text": "Identify the body, nut and ferrule as separate drawing items. Confirm tube dimensions, material combinations and mating features before treating them as an interchangeable set."
    },
    {
      "matchTitle": "Work-Hardening Prevention",
      "title": "Material Condition and Cutting Route",
      "text": "Specify alloy and stock condition for each fitting part. Review tool engagement, chip removal and finishing allowances where work hardening may affect threads or sealing features."
    }
  ],
  "custom-electrical-contacts": [
    {
      "matchTitle": "Swiss CNC for Miniature Precision Contact Manufacturing",
      "title": "Miniature Contact Geometry",
      "text": "Define the contact tip, retention features and rear termination from common datums. Review fine grooves, small bores and accessible measuring surfaces before selecting a turning route."
    },
    {
      "matchTitle": "Custom Engineered Contact Assembly Programs",
      "title": "Contact Assembly Interfaces",
      "text": "Provide mating-part dimensions and the required plated condition. Identify press fits, crimp or joining features and distinguish component inspection from electrical assembly validation."
    }
  ],
  "cylinder-head-machining": [
    {
      "matchTitle": "Deck Surface Flatness 0.010mm/300mm",
      "title": "Deck Face Acceptance",
      "text": "Specify deck flatness, surface texture and the inspection condition using the engine design requirements. Review clamping and measuring support before establishing the machining allowance."
    },
    {
      "matchTitle": "Complete CNC Cylinder Head Machining Sequence",
      "title": "Cylinder Head Operation Planning",
      "text": "Identify valve seats, guides, threaded ports and deck features from the supplied design. Review operation order, datum transfer and any specialist work included in the quotation."
    }
  ],
  "ev-housing-cnc-machining": [
    {
      "matchTitle": "MAZAK Mill-Turn",
      "title": "Housing Setup and Datum Planning",
      "text": "Review bores, mounting faces and connector features together. Define which relationships must be preserved in one setup and which surfaces may use a secondary reference."
    },
    {
      "matchTitle": "O-Ring Groove ±0.02mm for IP67/IP68 EV Housing",
      "title": "Seal Groove Geometry",
      "text": "Specify seal type, groove dimensions, surface finish and mating conditions. Any enclosure ingress rating requires assembly validation beyond dimensional inspection of the machined housing."
    },
    {
      "matchTitle": "Complete EV Housing CNC Machining Single-Source Supply",
      "title": "Machining and Secondary Operations",
      "text": "List the supplied housing features, required coatings and agreed inspection records. Identify inserts, joining and assembly work separately so the quotation covers the intended component scope."
    }
  ],
  "heat-sinks": [
    {
      "matchTitle": "Multi-Process Heat Sink Machining in Single-Source Supply",
      "title": "Heat Sink Manufacturing Route",
      "text": "Identify the starting form and the features requiring CNC machining. Review turning, milling and any separately sourced operations around the proposed fin and base geometry."
    },
    {
      "matchTitle": "CNC Skiving Heatsink Ultra-High Fin Density",
      "title": "Fin Geometry and Starting Form",
      "text": "Define fin thickness, spacing, height and base attachment. Review whether the design starts from machined, extruded or skived stock before agreeing the CNC machining scope."
    },
    {
      "matchTitle": "5 Axis Machining Heat Sink Factory",
      "title": "Multi-Face Machining Access",
      "text": "Show angled mounting faces, side features and restricted areas in the model. Review cutter access and workholding before selecting a multi-axis machining sequence."
    },
    {
      "matchTitle": "Wholesale Aluminum Machining Heatsinks Programs",
      "title": "Repeat-Order Requirements",
      "text": "Specify batch sizes, forecast demand and drawing revision controls. Agree packaging, surface protection and inspection coverage to support repeat heat sink orders."
    }
  ],
  "humanoid-robot-finger-joints": [
    {
      "matchTitle": "Complete End-Effector Kitting",
      "title": "Finger Joint Kit Definition",
      "text": "List pins, bushings and link components by item number and revision. Define which mating features must be checked together before parts are packed as a kit."
    },
    {
      "matchTitle": "Prototype Delivery & Production Support",
      "title": "Prototype and Repeat-Batch Planning",
      "text": "State the trial quantity, assembly test needs and expected follow-on batches. Record approved changes so a later production order uses the same accepted joint definition."
    }
  ],
  "humanoid-robot-hand-finger-parts": [
    {
      "matchTitle": "Swiss CNC from Ø0.8mm",
      "title": "Miniature Finger Components",
      "text": "Provide the smallest diameters, thin sections and mating clearances on the drawing. Review tool access, burr removal and suitable measurement methods before confirming feasibility."
    },
    {
      "matchTitle": "Complete Hand BOM, One Relationship",
      "title": "Hand Component Coordination",
      "text": "Supply a bill of materials linking each finger part to its drawing and material. Identify shared datums, matched components and packing requirements for the hand assembly."
    }
  ],
  "humanoid-robot-joint-components": [
    {
      "matchTitle": "Joint-Level Scope, Not Component-Level Scope",
      "title": "Joint Component Scope",
      "text": "Identify the shafts, housings, spacers or other individual parts included in the enquiry. Distinguish machined components from complete joint assemblies and purchased actuators."
    },
    {
      "matchTitle": "Inter-Part Dimensional Relationship Control",
      "title": "Mating Feature Relationships",
      "text": "Show bearing fits, locating diameters and axial stack dimensions across mating parts. Agree which relationships require coordinated measurements instead of independent part checks."
    },
    {
      "matchTitle": "Build-Synchronized Kit Delivery",
      "title": "Build-Sequence Packaging",
      "text": "Group approved parts by joint position or assembly stage. State kit identification, quantity checks and protective packaging requirements so components reach the correct build."
    },
    {
      "matchTitle": "Prototype-to-Volume Continuity",
      "title": "Prototype Revision Transfer",
      "text": "Carry the approved prototype revision, material and acceptance criteria into the next batch. Review changes to stock, workholding or finishing when the production quantity increases."
    },
    {
      "matchTitle": "China Robot Joints Supplier Cost Advantage",
      "title": "Drawing-Based Cost Review",
      "text": "Compare quotations against the same materials, geometry, quantities and document scope. Identify noncritical features that can be simplified before selecting a production plan."
    }
  ],
  "hydraulic-cylinder-components-machining": [
    {
      "matchTitle": "Complete 7-Component Manufacturing from One Source",
      "title": "Cylinder Component Scope",
      "text": "List the piston, rod, gland, end cap and other required parts separately. Provide mating dimensions and clarify which purchased seals or assembly operations are excluded."
    },
    {
      "matchTitle": "Piston Rod Chrome Coordination",
      "title": "Rod Coating Allowance",
      "text": "Specify the rod material, coating system and final diameter condition. Agree grinding, masking and thickness allowances with the finishing provider before machining the rod blank."
    }
  ],
  "industrial-robot-arms": [
    {
      "matchTitle": "Plate Flatness 0.005mm",
      "title": "Mounting Plate Flatness",
      "text": "Identify the locating face and how the plate is supported during inspection. Review thickness, pocket layout and finishing condition before setting the required flatness tolerance."
    },
    {
      "matchTitle": "Rail Mounting Straightness 0.010mm/500mm",
      "title": "Linear Guide Mounting References",
      "text": "Specify the guide mounting datum, hole pattern and shoulder relationship. Define alignment requirements over the actual mounting length and state the measurement setup."
    },
    {
      "matchTitle": "EOAT Machining",
      "title": "End-of-Arm Tooling Interfaces",
      "text": "Provide gripper, tool and robot-side mounting details. Review locating pins, threaded holes, cable clearances and replaceable wear features for the individual tooling component."
    }
  ],
  "introducer-needles": [
    {
      "matchTitle": "Introducer Needle 18G",
      "title": "Gauge and Wall Definition",
      "text": "Specify the needle gauge system, outside diameter, inside diameter and usable length. Gauge alone does not define wall thickness or the fit of the intended inner component."
    },
    {
      "matchTitle": "Introducer Needle 19G",
      "title": "Tube Material and Condition",
      "text": "State the required tubing specification and delivery condition. Review straightness, wall consistency and the documentation needed for the component manufacturing order."
    },
    {
      "matchTitle": "Introducer Needle 20G",
      "title": "Tip and Bevel Geometry",
      "text": "Define the tip profile, bevel orientation and edge acceptance from the approved design. Separate geometric inspection from clinical performance or complete-device validation."
    },
    {
      "matchTitle": "Introducer Needle 21G",
      "title": "Hub and Mating Interfaces",
      "text": "Provide the hub, cannula or stylet interface dimensions where applicable. Identify insertion depth, retention features and the datum used to check the assembled relationship."
    },
    {
      "matchTitle": "Introducer Needle 22G",
      "title": "Surface and Cleanliness Requirements",
      "text": "Specify burr acceptance, surface finish and agreed cleaning or packaging requirements. Identify any downstream sterilization or medical-device processing as a separate responsibility."
    }
  ],
  "liquid-cooling-connectors": [
    {
      "matchTitle": "Complete Custom Liquid Cooling Connector Assembly",
      "title": "Connector Component Boundaries",
      "text": "Define the machined connector body, sleeve and retention parts in the bill of materials. Clarify whether seals, valves and assembly operations are part of the requested supply."
    },
    {
      "matchTitle": "Liquid Cooling Charging Connector Dielectric Isolation Precision",
      "title": "Coolant and Electrical Interfaces",
      "text": "Identify coolant passages, insulating components and nearby electrical contacts in the design. Review critical spacing and sealing dimensions without treating part inspection as dielectric validation."
    }
  ],
  "liquid-cooling-plate": [
    {
      "matchTitle": "5-Axis Microchannel Machining",
      "title": "Channel Geometry and Tool Access",
      "text": "Specify channel width, depth, corner radii and the remaining wall thickness. Review cutter reach, chip clearance and the interfaces needed for later closure or joining."
    },
    {
      "matchTitle": "IATF 16949 & AS9100D Dual Certification",
      "title": "Inspection and Traceability Plan",
      "text": "Agree material records, dimensional checks and any required pressure or leak test separately. State the drawing revision and record format needed with the cooling plate components."
    }
  ],
  "metal-enclosures": [
    {
      "matchTitle": "AS9100D Certified for Defense & Aerospace Enclosures",
      "title": "Enclosure Drawing and Records",
      "text": "Identify the controlled enclosure features, required material documentation and inspection scope. Include any customer-specific quality or traceability requirements with the enquiry."
    },
    {
      "matchTitle": "EMI/RFI Shielded Enclosure Precision",
      "title": "Shielding-Related Interfaces",
      "text": "Specify lid contact faces, fastening patterns, coating masks and gasket grooves. Shielding performance depends on the assembled enclosure and must be validated to its application requirements."
    }
  ],
  "metric-thread-adapter": [
    {
      "matchTitle": "Single-Setup MAZAK Mill-Turn for Thread Axis Coaxiality ±0.010mm",
      "title": "Thread Axis Relationships",
      "text": "Define the relationship between the two thread axes and any sealing or locating faces. Show common datums so the setup and inspection plan address the actual assembly alignment."
    },
    {
      "matchTitle": "Swiss CNC Guide Bushing for Small Metric Adapters in the M5",
      "title": "Small Adapter Feature Access",
      "text": "Supply major diameters, bore sizes, thread runouts and wrench features. Review bar-stock support and measuring access for small metric adapter geometries."
    },
    {
      "matchTitle": "Complete Metric Thread Gauge Inventory",
      "title": "Thread Acceptance Requirements",
      "text": "State the thread standard, pitch, tolerance class and required gauging method. Confirm the acceptance condition after plating or other finishing before ordering gauges."
    },
    {
      "matchTitle": "Metric-to-BSP Thread Form DFM",
      "title": "Metric-to-BSP Interfaces",
      "text": "Identify the standard and sealing method at each end of the adapter. Parallel and tapered thread forms require different mating and sealing details on the approved drawing."
    },
    {
      "matchTitle": "ODM Design from Port Specifications + 40",
      "title": "Port-to-Adapter Drawing Review",
      "text": "Provide port drawings, installation clearances and service conditions. Resolve seal location, wrench access and permitted material alternatives before releasing the adapter design."
    }
  ],
  "rail-machining": [
    {
      "matchTitle": "CNC Cross Roller Slide Rail Producer Completeness",
      "title": "Rail Component Boundaries",
      "text": "Identify the individual rails, mounting blocks or related parts to be machined. Distinguish the supplied parts from complete guide assemblies, rollers and purchased motion elements."
    },
    {
      "matchTitle": "Multi-Configuration CNC Slide Rail Portfolio",
      "title": "Rail Configuration and Mounting",
      "text": "Specify length, cross-section, hole pattern and locating surfaces for each rail variant. Use separate drawing identifiers for configurations that are not interchangeable."
    },
    {
      "matchTitle": "24-Hour Rail Machining DFM & Quotation",
      "title": "Rail Drawing and Quantity Review",
      "text": "Submit critical straightness, mounting relationships and inspection support conditions with the quantity. Review workholding and acceptance methods before price or delivery is confirmed."
    }
  ],
  "reducer-hex-nipple": [
    {
      "matchTitle": "Hex Bar vs C-Axis Milled Hex",
      "title": "Wrench Flat Manufacturing Route",
      "text": "Specify across-flats size, corner form and its relationship to the threaded axis. Review whether hex stock or milled flats best suit the material, geometry and quantity."
    },
    {
      "matchTitle": "Complete Size Matrix",
      "title": "Reducer Size Definition",
      "text": "Identify both end sizes, thread forms and the through-bore for each reducer. Keep drawing and item numbers separate where different size combinations share a similar appearance."
    }
  ],
  "reducer-shaft": [
    {
      "matchTitle": "Swiss CNC",
      "title": "Small Shaft Turning Route",
      "text": "Review slender sections, grooves and fine turned features against the shaft material and length. Select bar support and measurement methods around the critical journals."
    },
    {
      "matchTitle": "MAZAK Mill-Turn",
      "title": "Combined Turning and Milling",
      "text": "Identify keyways, flats, cross-holes and coupling features relative to the shaft axis. Review setup transfer where their position must match the turned bearing seats."
    },
    {
      "matchTitle": "IATF 16949 PPAP Level 3",
      "title": "Production Approval Records",
      "text": "State any required first-article, sample approval or production documentation with the enquiry. Agree submission content and inspection coverage for the specific shaft order."
    }
  ],
  "rf-connectors": [
    {
      "matchTitle": "Center Conductor Diameter ±0.003mm",
      "title": "Center Conductor Fit",
      "text": "Define the conductor diameters, shoulders and mating contact geometry from the connector design. Include plating allowances and the acceptance condition for final dimensions."
    },
    {
      "matchTitle": "Millimeter-Wave Miniature Capability",
      "title": "Miniature RF Component Access",
      "text": "Review small bores, thin walls and contact retention features for tool and gauge access. Electrical frequency performance requires validation of the complete connector assembly."
    }
  ],
  "rf-test-probes": [
    {
      "matchTitle": "GSG Tip Geometry ±3μm",
      "title": "Probe Tip Arrangement",
      "text": "Define signal and ground contact locations, tip profiles and the alignment datum. Agree how the contact geometry will be measured before machining the individual probe parts."
    },
    {
      "matchTitle": "Ra 0.2μm Signal Path Finish",
      "title": "Signal Path Surface Requirements",
      "text": "Identify the surfaces requiring controlled texture, edge condition and coating. Specify inspection parameters without assuming a surface finish alone establishes RF performance."
    }
  ],
  "robot-actuator-housings": [
    {
      "matchTitle": "Complete Actuator Integration Features in One Housing",
      "title": "Housing Integration Features",
      "text": "Show bearing seats, cable passages, mounting faces and any seal grooves in one model. Define the interfaces that must align with the reducer, motor and supporting structure."
    },
    {
      "matchTitle": "Multi-Architecture Robot Actuator Housing Capability",
      "title": "Actuator Architecture Interfaces",
      "text": "Identify whether the housing mates with a harmonic, planetary or other actuator arrangement. Provide the relevant mating drawings instead of treating different architectures as interchangeable."
    },
    {
      "matchTitle": "Custom Robot Actuator Housing DFM from First Inquiry",
      "title": "Housing Manufacturability Review",
      "text": "Submit the housing model with critical bores, thin walls and permitted design changes. Review cutter access, clamping surfaces and the inspection datum before finalizing the drawing."
    },
    {
      "matchTitle": "IATF 16949 Volume Production Infrastructure",
      "title": "Repeat-Batch Process Control",
      "text": "Record the approved drawing, material condition and inspection plan for repeated housing orders. Reconfirm these requirements after changes to stock, tooling or finishing."
    },
    {
      "matchTitle": "Robot Actuator Housing in China Cost Advantage",
      "title": "Housing Quotation Inputs",
      "text": "State initial and repeat quantities, finishing and document needs. Compare manufacturing options against the same functional interfaces and acceptance requirements."
    }
  ],
  "semiconductor-connector": [
    {
      "matchTitle": "UHP Cleanliness Protocol",
      "title": "Cleanliness Specification",
      "text": "State the required cleanliness, cleaning method and packaging condition for the component. Agree residue checks or other acceptance evidence rather than assuming all connectors need one protocol."
    },
    {
      "matchTitle": "Complete Connector Type Portfolio",
      "title": "Connector Geometry Definition",
      "text": "Separate contact bodies, sleeves and fluid-interface parts by drawing item. Identify their mating dimensions, material specifications and required finishing for each connector type."
    }
  ],
  "semiconductor-wet-etch-spray-nozzle": [
    {
      "matchTitle": "Swiss CNC Orifice Accuracy as the Nozzle Foundation",
      "title": "Orifice Geometry and Inspection",
      "text": "Specify orifice diameter, length, entry form and burr acceptance. Review available tool access and the agreed measuring method for the nozzle's smallest features."
    },
    {
      "matchTitle": "Chemical Compatibility DFM as a Design Competency",
      "title": "Process Chemical Compatibility",
      "text": "Provide the process chemistry, concentration and operating temperature with the selected material. The equipment designer must confirm compatibility before a machining substitution is approved."
    },
    {
      "matchTitle": "Complete Wet Etch Nozzle Portfolio From One Manufacturer",
      "title": "Nozzle Pattern and Mounting",
      "text": "Define each nozzle type by outlet pattern, mounting thread and orientation. Identify spray or flow testing separately from the dimensional inspection of the machined part."
    }
  ],
  "server-components": [
    {
      "matchTitle": "Complete Server Hardware BOM in Single OEM Relationship",
      "title": "Server Hardware Component List",
      "text": "Identify standoffs, fasteners, cooling interfaces and other machined items by drawing revision. Distinguish the component order from complete server equipment or assembled cooling systems."
    },
    {
      "matchTitle": "MAZAK Mill-Turn + Swiss CNC Dual Process Platform",
      "title": "Turning and Milling Feature Review",
      "text": "Review threaded diameters, mounting flats, pockets and cross-holes together. Select the proposed machining route around each component's size, material and quantity."
    }
  ],
  "stainless-steel-cnc-turning-parts": [
    {
      "matchTitle": "MAZAK Mill-Turn",
      "title": "Turned and Milled Stainless Features",
      "text": "Specify journals, bores, threads and cross-features using functional datums. Review stock condition, cutting access and chip removal before agreeing the operation sequence."
    },
    {
      "matchTitle": "Electropolishing & Passivation",
      "title": "Stainless Surface Treatment",
      "text": "Identify whether passivation, electropolishing or another finish is required. State controlled surfaces, masking and the final dimensional acceptance condition with the drawing."
    },
    {
      "matchTitle": "IATF 16949 + AS9100D Dual Certification",
      "title": "Quality Records for the Order",
      "text": "List material certificates, dimensional reports and any customer-specific approval records. Agree document content and inspection coverage for the actual stainless steel components."
    }
  ]
};

export function applyProductBenefitCorrections(content) {
  for (const [slug, edits] of Object.entries(productBenefitCorrections)) {
    const product = content[slug];
    if (!product) throw new Error(`Missing reviewed product: ${slug}`);
    for (const edit of edits) {
      const card = product.benefits.find(card => card.title === edit.matchTitle || card.title === edit.title);
      if (!card) throw new Error(`Missing reviewed benefit: ${slug}: ${edit.matchTitle}`);
      Object.assign(card, { title: edit.title, text: edit.text });
    }
  }
}
