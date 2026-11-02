// Unique application and procurement topics retained from the retired pages.
// Performance, certification, and cleanroom claims need order-specific confirmation.
export const industryConsolidation = {
  defense: {
    title: 'Defense Precision CNC Machining Services',
    seoTitle: 'Defense Precision CNC Machining Services | CNCPioneer',
    description: 'Get defense precision cnc machining services for complex components, with CNC turning, milling, Swiss machining, material traceability, and inspection support.',
    applications: [
      ['Electronics & Instrumentation', 'Connector bodies, sensor enclosures, equipment brackets, and electrical interface hardware combine turned features with milled mounting faces. Define mating geometry, coating allowances, and grounding surfaces on the drawing.'],
      ['Environmental Material Selection', 'Review strength, corrosion resistance, magnetic behavior, and weight for the intended equipment environment. Match the specified alloy and condition to finishing requirements; confirm material identification and process records at quotation.'],
      ['Configuration & Supply Records', 'Keep drawing revisions, approved changes, first-article results, and material and finishing records linked to each part number. Agree the documentation and retention requirements for repeat supply and equipment maintenance.']
    ],
    faqs: [
      ['Which machining process fits my component?', 'Swiss machining suits small turned contacts, sleeves, and sensor bodies. CNC turning and milling support larger enclosures, mounting plates, and parts with multiple interfaces. The drawing review determines the manufacturing route.'],
      ['How are surface-treatment requirements specified?', 'Provide the required process specification and revision, coating thickness, masking areas, and acceptance criteria. Confirm process availability and supporting records before placing the order.'],
      ['What should accompany a quote request?', 'Send the CAD model, controlled drawing, material and finish requirements, quantities, and requested inspection documents. Identify any procurement or program-specific requirements so they can be reviewed before acceptance.']
    ]
  },
  robotics: {
    title: 'CNC Machining for Robotics',
    description: 'CNC machined robot joint housings, arm links, shafts, end-effector hardware, and sensor interfaces for industrial, collaborative, and mobile robot assemblies.',
    production: {
      title: 'High-Volume CNC Machining for Robotics',
      description: 'Plan repeat production for harmonic-drive components, joint bearing housings, AMR drive hubs, collaborative-robot housings, and structural fittings. Review the component family, annual demand, release quantities, and required records before committing to a production schedule.',
      items: [
        ['Production Planning & Drawing Control', 'Provide controlled drawings, mating-part references, forecast quantities, and delivery dates. Review machining setups, fixtures, material availability, and finishing allowances for each component family. Use prototype and first-article feedback to agree the production revision.'],
        ['First-Article & Process Validation', 'Agree critical characteristics such as bearing fits, bore alignment, shaft journals, and mounting interfaces. Define gauges, measurement-system checks, sampling or full inspection, and any SPC or process-capability study needed for the order. Confirm PPAP or FAIR scope where requested.'],
        ['Batch Traceability & Scheduled Supply', 'Link material lots, drawing revisions, machining and finishing records, and inspection results to each delivery batch. Agree release quantities, packaging for precision interfaces, change notification, and replenishment dates so repeat part sets support the customer’s assembly schedule.']
      ]
    },
    applications: [
      ['Joint & Drive Interfaces', 'Bearing housings, shafts, and drive-interface hardware depend on relationships between mating features. Define datums, bore and journal requirements, and the inspection method needed to evaluate the assembled joint.'],
      ['Sensors & End Effectors', 'Torque-sensor bodies, encoder mounts, gripper fingers, and tool-changer hardware combine sensing or gripping features with cable access and mounting interfaces. Identify sensor-beam geometry, encoder locating bores, gripper guide fits, and coating masks on the drawing; agree CMM or bore measurement records for critical features.'],
      ['Mobile & Collaborative Robots', 'AMR drive hubs and mobile robot chassis parts combine motor mounting faces, encoder bores, wheel interfaces, and cable routes. Collaborative robot arm links may include tube insertion bores and joint attachment flanges. Review locating datums, component mass, mating materials, and environmental protection for the complete assembly.']
    ],
    faqs: [
      ['How should robot bearing features be inspected?', 'Identify the critical diameters, form, and datum relationships on the drawing. Agree suitable dimensional or form measurement methods during review; component measurements alone do not establish complete robot positioning performance.'],
      ['Can prototypes and production use the same drawing?', 'Use a controlled revision for each build and record design changes after assembly trials. Review first-article results and finishing allowances before releasing repeat production.'],
      ['How do I choose a robot component finish?', 'Consider wear at contact interfaces, corrosion exposure, electrical grounding, and optical reflection around vision systems. Specify coating thickness and masked surfaces wherever the finish affects fit or function.'],
      ['What information is needed for a high-volume robotics quote?', 'Provide the drawing revision, CAD model, material and finish, annual forecast, quantity per release, delivery schedule, and inspection requirements. Highlight mating features and part families that must be supplied together. Capacity, pricing, and lead time are confirmed for the specific program.'],
      ['How is repeat-production consistency verified?', 'Agree a first-article review and a control plan for drawing-critical features. Specify measurement methods, inspection frequency, traceability, and any process-capability study. Capability targets and full-inspection requirements must be validated for the particular geometry and process.'],
      ['Can I request a coordinated set of robot parts?', 'Yes. Submit the assembly drawing and individual part drawings for arm links, joint hardware, drive hubs, sensor bodies, or end-effector components. Identify mating parts, common datums, cable paths, mass limits, and finish allowances. Confirm the inspection and material records required for each part number before manufacture.'],
      ['Can robot components be supplied in scheduled batches?', 'Request a release schedule with forecast demand, batch sizes, packaging, and required documentation. Material procurement, production slots, replenishment timing, and drawing-change handling are reviewed before the delivery plan is accepted.']
    ]
  },
  semiconductor: {
    title: 'Semiconductor CNC Machining Services',
    description: 'Explore semiconductor cnc machining services for vacuum chambers, gas manifolds, and wafer handling parts, with material traceability and precision inspection.',
    applications: [
      ['Gas Delivery & Flow Components', 'Gas manifold bodies, fittings, valve seats, and orifice components need drawing-defined interfaces and surface requirements. Identify gas-wetted surfaces and specify material, finish, cleaning, and acceptance criteria before manufacture.', { href: '/custom-cnc-parts/stainless-steel-machining-semiconductor-parts', label: 'Stainless Steel Semiconductor Parts' }],
      ['Vacuum & Process Chambers', 'Chamber hardware, flanges, and supporting fixtures combine sealing interfaces with dimensional and material requirements. Review flatness, sealing geometry, coating compatibility, and cleaning access against the equipment design.'],
      ['Wafer Handling & Metrology', 'Handling fixtures, guides, and positioning-stage components support wafer movement and measurement. Select materials around thermal stability, stiffness, insulation, and particle-control requirements, with inspection tied to the relevant datums.']
    ],
    faqs: [
      ['What material information should I specify?', 'State alloy, grade, condition, and any required melt practice or material certification. For gas or vacuum service, review compatibility with the process environment and cleaning chemicals; a generic grade name is not a complete specification.'],
      ['How are finishing and cleanliness requirements agreed?', 'Identify surface roughness limits, electropolishing or passivation requirements, and the required cleaning and verification methods. Confirm availability and acceptance criteria during quotation rather than assuming every component follows one cleaning process.'],
      ['What packaging and records should be requested?', 'Specify protection for sealing surfaces, port caps, bagging, labeling, and any controlled-environment packaging requirements. Agree the material certificates, dimensional reports, finishing records, and cleanliness evidence needed for release.']
    ]
  }
};
