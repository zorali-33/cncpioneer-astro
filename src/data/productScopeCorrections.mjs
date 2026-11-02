// T2 reviewed product scope, 2026-10-23. User confirmed: components only; no large structural flanges.
import { isRemovedProductRoute } from './productRemovals.mjs';
export const productScopeCorrections = {
  "ev-charging-gun": {
    "title": "EV Charging Gun Contact Pins",
    "h1": "EV Charging Gun Contact Pins",
    "label": "EV Charging Gun Contact Pins",
    "hero": "/wp-content/uploads/2026/08/ev-charging-gun-cucrzr-dc-contact-pin-swiss-machining.jpg",
    "heroAlt": "Individual machined contact component examples",
    "heroDescription": "Custom machined contact pins for charging-gun assemblies. Review contact profiles, locating shoulders, cable-side termination features and plating requirements.",
    "overviewTitle": "Component Scope and Drawing Review",
    "overview": [
      "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
      "This page focuses on cable-side charging-gun contact pins: their front contact profile, locating shoulders and rear termination features.",
      "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings."
    ],
    "overviewImage": "/wp-content/uploads/2026/08/ev-charging-gun-cucrzr-dc-contact-pin-swiss-machining.jpg",
    "overviewImageAlt": "Individual machined contact component examples",
    "overviewPoints": [
      {
        "title": "Contact profile",
        "text": "Define the contact length, leading geometry and diameters from the mating assembly."
      },
      {
        "title": "Location in the carrier",
        "text": "Dimension shoulders, grooves and retention features from a common datum."
      },
      {
        "title": "Rear termination",
        "text": "Specify the cable-side hole, thread or joining interface; identify any assembly operation separately."
      },
      {
        "title": "Plated condition",
        "text": "State which contact surfaces are plated and how final dimensions will be accepted."
      }
    ],
    "benefitsTitle": "Plan the Machining and Acceptance Requirements",
    "benefitsIntro": "Review the individual component before confirming the production route, price and schedule.",
    "benefits": [
      {
        "title": "Geometry and access",
        "text": "Review diameters, bores, threads, shoulders and milled features together. Restricted access or thin sections may require changes to the proposed process."
      },
      {
        "title": "Material and condition",
        "text": "State the exact material specification, stock condition and permitted alternatives. Confirm availability and any treatment before ordering."
      },
      {
        "title": "Finish and final dimensions",
        "text": "Identify functional surfaces, masked areas and the condition in which dimensions are accepted. Include any required measurements after finishing."
      },
      {
        "title": "Quantity and documentation",
        "text": "Share initial and repeat quantities, the target date and required records. Inspection coverage and delivery timing are confirmed with the quotation."
      }
    ],
    "heroTrust": [
      "Swiss machining and CNC turning/milling",
      "Machined components to an approved drawing",
      "Critical features and finish reviewed per order",
      "Inspection and delivery scope agreed before production"
    ],
    "portfolioTitle": "Component Examples to Specify",
    "portfolioIntro": "Examples illustrate individual machined parts. The accepted drawing defines the supplied item and its inspection requirements.",
    "portfolio": [
      {
        "title": "Power contact pins",
        "text": "Specify the contact profile, locating shoulder and rear termination on the individual pin drawing.",
        "image": "/wp-content/uploads/2026/08/ev-charging-gun-ac-contact-pins.jpg",
        "illustration": false
      },
      {
        "title": "Stepped contact pins",
        "text": "Identify changes in diameter, retention features and any internal bore before choosing the machining route.",
        "image": "/wp-content/uploads/2026/08/ev-charging-gun-dc-power-pins.jpg",
        "illustration": false
      },
      {
        "title": "Pilot and signal pins",
        "text": "Define small-diameter features, edge conditions and inspection access; the electrical function belongs to the assembly specification.",
        "image": "/wp-content/uploads/2026/08/ev-charging-gun-signal-contacts.jpg",
        "illustration": false
      }
    ],
    "applications": [
      {
        "title": "EV Charging Equipment Applications",
        "industry": "Automotive",
        "href": "/industries/automotive",
        "image": "/wp-content/uploads/2026/08/ev-charging-gun.jpg",
        "text": "Machined components are integrated into charging assemblies by the equipment manufacturer. The component drawing and quotation define our supply scope.",
        "imageAlt": "EV charging equipment application context",
        "linkLabel": "Explore automotive component machining"
      }
    ],
    "applicationsIntro": "Application images show the assembly environment. The supply scope is the individual machined component defined in the quotation.",
    "materialsTitle": "Material Options for Drawing Review",
    "materialsIntro": "Specify the exact grade and condition selected for the component. Availability, finishing compatibility and suitability require project review.",
    "materials": [
      {
        "title": "Copper and specified copper alloys",
        "text": "Provide the exact alloy and condition selected for the contact or terminal. Include the finish stack and required material records.",
        "href": "/materials/copper-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Brass",
        "text": "Specify the grade, contact or mechanical function, and any plating requirements. Confirm the material selection against the assembly design.",
        "href": "/materials/brass-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Stainless steel",
        "text": "For specified mechanical sleeves, locating parts or fasteners, identify the grade, fit and required surface condition.",
        "href": "/materials/stainless-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      }
    ],
    "finishesTitle": "Define the Finish on the Drawing",
    "finishesIntro": "Include the finish specification, surfaces covered, masking and post-process dimensions. Process availability and documentation are confirmed for the order.",
    "finishes": [
      {
        "title": "Deburring and edge requirements",
        "summary": "Identify edges that contact seals, cables or mating parts. State permitted edge breaks and burr limits rather than relying on a generic deburr note.",
        "category": "Drawing requirement",
        "use": "Functional edges and assembly interfaces",
        "specify": "Burr limits, edge break and protected features",
        "tone": "blue"
      },
      {
        "title": "Surface condition",
        "summary": "Specify the required texture or coating for each functional surface. The drawing should distinguish cosmetic areas from fits and contact regions.",
        "category": "Drawing requirement",
        "use": "Specified contact, sealing and mating surfaces",
        "specify": "Surface texture, coating and masking areas",
        "tone": "blue"
      },
      {
        "title": "Final inspection condition",
        "summary": "Define whether acceptance applies before or after treatment. Include any coating-thickness, appearance and dimensional records needed.",
        "category": "Drawing requirement",
        "use": "Parts accepted after treatment",
        "specify": "Acceptance condition and required records",
        "tone": "blue"
      }
    ],
    "capacityTitle": "Production Planning",
    "capacityIntro": "Process selection, batch planning and inspection are reviewed for your drawing. Machine allocation and delivery timing are confirmed with the quotation.",
    "stats": [
      [
        "DFM",
        "Drawing and process review"
      ],
      [
        "Drawing",
        "Feature limits"
      ],
      [
        "QC",
        "Inspection plan"
      ],
      [
        "RFQ",
        "Quantity and delivery review"
      ]
    ],
    "qualityTitle": "Inspection and Order Documentation",
    "qualityIntro": "Agree the features to inspect, the measurement method and the records required for acceptance.",
    "qualityMetrics": [
      {
        "value": "Drawing",
        "label": "Feature-specific limits"
      },
      {
        "value": "Agreed",
        "label": "Inspection coverage"
      }
    ],
    "qualityStandards": [],
    "qualityReferenceNote": "No universal tolerance or certification is implied. Supplier qualification, material records and inspection requirements must be confirmed for the specific order.",
    "controls": [
      {
        "title": "Material and Revision",
        "check": "Drawing revision, material grade and supplied condition.",
        "verify": "Review the purchase specification and agreed material documentation.",
        "record": "Drawing revision and material records required by the order."
      },
      {
        "title": "Critical Geometry",
        "check": "Mating diameters, bores, threads, datums and positional relationships.",
        "verify": "Agree suitable measuring methods and inspection access for each feature.",
        "record": "Specified critical-feature measurements and any first-article report."
      },
      {
        "title": "Finish and Edges",
        "check": "Surface requirements, burr limits and dimensions after treatment.",
        "verify": "Inspect in the acceptance condition defined by the drawing.",
        "record": "Agreed finish and post-process inspection results."
      },
      {
        "title": "Release to Delivery",
        "check": "Quantity, marking, cleanliness, packaging and required records.",
        "verify": "Review the agreed release criteria before shipment.",
        "record": "Inspection and delivery documents included in the quotation."
      }
    ],
    "faqs": [
      {
        "question": "Do you supply complete charging equipment?",
        "answer": "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
        "points": []
      },
      {
        "question": "What is the focus of this component page?",
        "answer": "This page focuses on cable-side charging-gun contact pins: their front contact profile, locating shoulders and rear termination features.",
        "points": []
      },
      {
        "question": "Does a machined component have an electrical or sealing rating?",
        "answer": "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings.",
        "points": []
      },
      {
        "question": "How should plating and mating dimensions be specified?",
        "answer": "Identify the substrate, finish specification, coated and masked surfaces, and whether each controlled dimension applies before or after plating. Include the mating-part drawing where it affects acceptance.",
        "points": []
      },
      {
        "question": "What is required for a quotation?",
        "answer": "Send the current component drawing, available model, material grade and condition, quantity, finish, critical dimensions and required records. Price, feasibility, any secondary operations and delivery timing are confirmed for that scope.",
        "points": []
      }
    ],
    "faqTitle": "EV Charging Gun Contact Pins Questions",
    "relatedSlugs": [
      "ev-charging-plug",
      "ev-charging-connector",
      "ev-charger-manufacturing"
    ],
    "procurement": {
      "intro": "Send the component drawing and clarify the supplied item before requesting pricing.",
      "items": [
        "2D drawing and available 3D CAD with matching revision.",
        "Exact material grade, condition, quantity and repeat-order expectations.",
        "Critical fits, datums, threads, edge limits and finishing requirements.",
        "Inspection records, target date and any component qualification requirements."
      ],
      "links": [
        {
          "href": "/services/swiss-machining",
          "label": "Swiss machining for small bar-stock parts"
        },
        {
          "href": "/services/cnc-turning-and-milling",
          "label": "CNC turning and milling for combined features"
        },
        {
          "href": "/industries/automotive-swiss-machining",
          "label": "Automotive component applications"
        }
      ]
    },
    "ctaTitle": "Request a Component Machining Quote",
    "ctaDescription": "Custom machined contact pins for charging-gun assemblies. Review contact profiles, locating shoulders, cable-side termination features and plating requirements. Share the drawing revision, material, quantity, finish and required inspection records.",
    "ctaTrustLine": "Drawing Review → Component Machining Plan → Agreed Inspection and Delivery",
    "sourceUrl": "https://www.cncpioneer.com/custom-cnc-parts/ev-charging-gun"
  },
  "ev-charging-plug": {
    "title": "EV Charging Plug Contact Components",
    "h1": "EV Charging Plug Contact Components",
    "label": "EV Charging Plug Contact Components",
    "hero": "/wp-content/uploads/2026/08/ev-charging-cucrzr-dc-contact-pin-swiss-cnc.jpg",
    "heroAlt": "Individual machined contact component examples",
    "heroDescription": "CNC-machined contact components for EV charging plugs, reviewed around mating dimensions, insertion depth, termination geometry and final plated condition.",
    "overviewTitle": "Component Scope and Drawing Review",
    "overview": [
      "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
      "This page focuses on the fit and acceptance requirements for plug-side contact components: mating dimensions, insertion depth, termination details and inspection after plating.",
      "Charging gun and charging plug can describe overlapping cable-side assemblies. This page covers the component interface and acceptance plan; the charging-gun page covers contact-pin machining features.",
      "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings."
    ],
    "overviewImage": "/wp-content/uploads/2026/08/ev-charging-cucrzr-dc-contact-pin-swiss-cnc.jpg",
    "overviewImageAlt": "Individual machined contact component examples",
    "overviewPoints": [
      {
        "title": "Mating-part information",
        "text": "Include the mating contact drawing or controlled interface specification alongside the part drawing."
      },
      {
        "title": "Insertion and retention",
        "text": "Define the shoulder-to-tip distance, engagement length and retention features from clear datums."
      },
      {
        "title": "Assembly allocation",
        "text": "Separate tolerances on the machined part from variation introduced by carriers, plating and assembly."
      },
      {
        "title": "Acceptance method",
        "text": "Agree dimensions, gauges or sample-fit checks without treating a sample fit as complete electrical validation."
      }
    ],
    "benefitsTitle": "Plan the Machining and Acceptance Requirements",
    "benefitsIntro": "Review the individual component before confirming the production route, price and schedule.",
    "benefits": [
      {
        "title": "Geometry and access",
        "text": "Review diameters, bores, threads, shoulders and milled features together. Restricted access or thin sections may require changes to the proposed process."
      },
      {
        "title": "Material and condition",
        "text": "State the exact material specification, stock condition and permitted alternatives. Confirm availability and any treatment before ordering."
      },
      {
        "title": "Finish and final dimensions",
        "text": "Identify functional surfaces, masked areas and the condition in which dimensions are accepted. Include any required measurements after finishing."
      },
      {
        "title": "Quantity and documentation",
        "text": "Share initial and repeat quantities, the target date and required records. Inspection coverage and delivery timing are confirmed with the quotation."
      }
    ],
    "heroTrust": [
      "Swiss machining and CNC turning/milling",
      "Machined components to an approved drawing",
      "Critical features and finish reviewed per order",
      "Inspection and delivery scope agreed before production"
    ],
    "portfolioTitle": "Component Examples to Specify",
    "portfolioIntro": "Examples illustrate individual machined parts. The accepted drawing defines the supplied item and its inspection requirements.",
    "portfolio": [
      {
        "title": "Power contact mating profiles",
        "text": "Review tip geometry, contact diameters and the final condition used for fit inspection.",
        "image": "/wp-content/uploads/2026/08/ev-charging-dc-power-contact-pins.jpg",
        "illustration": false
      },
      {
        "title": "Shouldered plug contacts",
        "text": "Control the relationship between the locating shoulder, exposed contact section and rear interface.",
        "image": "/wp-content/uploads/2026/08/ev-charging-ac-contact-pins.jpg",
        "illustration": false
      },
      {
        "title": "Pilot contact interfaces",
        "text": "Identify the fine features and protrusion length that must be checked against the assembly drawing.",
        "image": "/wp-content/uploads/2026/08/ev-charging-pilot-contact-pins.jpg",
        "illustration": false
      }
    ],
    "applications": [
      {
        "title": "EV Charging Equipment Applications",
        "industry": "Automotive",
        "href": "/industries/automotive",
        "image": "/wp-content/uploads/2026/08/ev-charging-plug-oem-components.jpg",
        "text": "Machined components are integrated into charging assemblies by the equipment manufacturer. The component drawing and quotation define our supply scope.",
        "imageAlt": "EV charging equipment application context",
        "linkLabel": "Explore automotive component machining"
      }
    ],
    "applicationsIntro": "Application images show the assembly environment. The supply scope is the individual machined component defined in the quotation.",
    "materialsTitle": "Material Options for Drawing Review",
    "materialsIntro": "Specify the exact grade and condition selected for the component. Availability, finishing compatibility and suitability require project review.",
    "materials": [
      {
        "title": "Copper and specified copper alloys",
        "text": "Provide the exact alloy and condition selected for the contact or terminal. Include the finish stack and required material records.",
        "href": "/materials/copper-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Brass",
        "text": "Specify the grade, contact or mechanical function, and any plating requirements. Confirm the material selection against the assembly design.",
        "href": "/materials/brass-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Stainless steel",
        "text": "For specified mechanical sleeves, locating parts or fasteners, identify the grade, fit and required surface condition.",
        "href": "/materials/stainless-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      }
    ],
    "finishesTitle": "Define the Finish on the Drawing",
    "finishesIntro": "Include the finish specification, surfaces covered, masking and post-process dimensions. Process availability and documentation are confirmed for the order.",
    "finishes": [
      {
        "title": "Deburring and edge requirements",
        "summary": "Identify edges that contact seals, cables or mating parts. State permitted edge breaks and burr limits rather than relying on a generic deburr note.",
        "category": "Drawing requirement",
        "use": "Functional edges and assembly interfaces",
        "specify": "Burr limits, edge break and protected features",
        "tone": "blue"
      },
      {
        "title": "Surface condition",
        "summary": "Specify the required texture or coating for each functional surface. The drawing should distinguish cosmetic areas from fits and contact regions.",
        "category": "Drawing requirement",
        "use": "Specified contact, sealing and mating surfaces",
        "specify": "Surface texture, coating and masking areas",
        "tone": "blue"
      },
      {
        "title": "Final inspection condition",
        "summary": "Define whether acceptance applies before or after treatment. Include any coating-thickness, appearance and dimensional records needed.",
        "category": "Drawing requirement",
        "use": "Parts accepted after treatment",
        "specify": "Acceptance condition and required records",
        "tone": "blue"
      }
    ],
    "capacityTitle": "Production Planning",
    "capacityIntro": "Process selection, batch planning and inspection are reviewed for your drawing. Machine allocation and delivery timing are confirmed with the quotation.",
    "stats": [
      [
        "DFM",
        "Drawing and process review"
      ],
      [
        "Drawing",
        "Feature limits"
      ],
      [
        "QC",
        "Inspection plan"
      ],
      [
        "RFQ",
        "Quantity and delivery review"
      ]
    ],
    "qualityTitle": "Inspection and Order Documentation",
    "qualityIntro": "Agree the features to inspect, the measurement method and the records required for acceptance.",
    "qualityMetrics": [
      {
        "value": "Drawing",
        "label": "Feature-specific limits"
      },
      {
        "value": "Agreed",
        "label": "Inspection coverage"
      }
    ],
    "qualityStandards": [],
    "qualityReferenceNote": "No universal tolerance or certification is implied. Supplier qualification, material records and inspection requirements must be confirmed for the specific order.",
    "controls": [
      {
        "title": "Material and Revision",
        "check": "Drawing revision, material grade and supplied condition.",
        "verify": "Review the purchase specification and agreed material documentation.",
        "record": "Drawing revision and material records required by the order."
      },
      {
        "title": "Critical Geometry",
        "check": "Mating diameters, bores, threads, datums and positional relationships.",
        "verify": "Agree suitable measuring methods and inspection access for each feature.",
        "record": "Specified critical-feature measurements and any first-article report."
      },
      {
        "title": "Finish and Edges",
        "check": "Surface requirements, burr limits and dimensions after treatment.",
        "verify": "Inspect in the acceptance condition defined by the drawing.",
        "record": "Agreed finish and post-process inspection results."
      },
      {
        "title": "Release to Delivery",
        "check": "Quantity, marking, cleanliness, packaging and required records.",
        "verify": "Review the agreed release criteria before shipment.",
        "record": "Inspection and delivery documents included in the quotation."
      }
    ],
    "faqs": [
      {
        "question": "Do you supply complete charging equipment?",
        "answer": "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
        "points": []
      },
      {
        "question": "What is the focus of this component page?",
        "answer": "This page focuses on the fit and acceptance requirements for plug-side contact components: mating dimensions, insertion depth, termination details and inspection after plating.",
        "points": []
      },
      {
        "question": "Does a machined component have an electrical or sealing rating?",
        "answer": "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings.",
        "points": []
      },
      {
        "question": "How should plating and mating dimensions be specified?",
        "answer": "Identify the substrate, finish specification, coated and masked surfaces, and whether each controlled dimension applies before or after plating. Include the mating-part drawing where it affects acceptance.",
        "points": []
      },
      {
        "question": "What is required for a quotation?",
        "answer": "Send the current component drawing, available model, material grade and condition, quantity, finish, critical dimensions and required records. Price, feasibility, any secondary operations and delivery timing are confirmed for that scope.",
        "points": []
      }
    ],
    "faqTitle": "EV Charging Plug Contact Components Questions",
    "relatedSlugs": [
      "ev-charging-gun",
      "ev-charging-connector",
      "ev-charger-manufacturing"
    ],
    "procurement": {
      "intro": "Send the component drawing and clarify the supplied item before requesting pricing.",
      "items": [
        "2D drawing and available 3D CAD with matching revision.",
        "Exact material grade, condition, quantity and repeat-order expectations.",
        "Critical fits, datums, threads, edge limits and finishing requirements.",
        "Inspection records, target date and any component qualification requirements."
      ],
      "links": [
        {
          "href": "/services/swiss-machining",
          "label": "Swiss machining for small bar-stock parts"
        },
        {
          "href": "/services/cnc-turning-and-milling",
          "label": "CNC turning and milling for combined features"
        },
        {
          "href": "/industries/automotive-swiss-machining",
          "label": "Automotive component applications"
        }
      ]
    },
    "ctaTitle": "Request a Component Machining Quote",
    "ctaDescription": "CNC-machined contact components for EV charging plugs, reviewed around mating dimensions, insertion depth, termination geometry and final plated condition. Share the drawing revision, material, quantity, finish and required inspection records.",
    "ctaTrustLine": "Drawing Review → Component Machining Plan → Agreed Inspection and Delivery",
    "sourceUrl": "https://www.cncpioneer.com/custom-cnc-parts/ev-charging-plug"
  },
  "ev-charging-connector": {
    "title": "EV Connector Sleeves and Inserts",
    "h1": "EV Connector Sleeves and Inserts",
    "label": "EV Connector Sleeves and Inserts",
    "hero": "/wp-content/uploads/2026/09/custom-ev-charging-contact-pins.jpg",
    "heroAlt": "Individual machined contact component examples",
    "heroDescription": "Machined sleeves, receptacle inserts and locating components for EV connectors. Define bore-to-diameter relationships, shoulders, retention details and finish.",
    "overviewTitle": "Component Scope and Drawing Review",
    "overview": [
      "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
      "This page focuses on individual connector sleeves, receptacle inserts and locating bodies, especially the relationship between internal bores, external fits and retention features.",
      "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings."
    ],
    "overviewImage": "/wp-content/uploads/2026/09/custom-ev-charging-contact-pins.jpg",
    "overviewImageAlt": "Individual machined contact component examples",
    "overviewPoints": [
      {
        "title": "Internal and external fits",
        "text": "Specify the bore, outside diameter and datum relationship; include the mating contact and carrier information."
      },
      {
        "title": "Retention and location",
        "text": "Identify shoulders, grooves, threads and locating faces used in the connector assembly."
      },
      {
        "title": "Thin sections and access",
        "text": "Review wall thickness, bore depth, tool access and burr-sensitive internal edges."
      },
      {
        "title": "Component acceptance",
        "text": "Define final dimensions and records; contact force and connector sealing require assembly-level validation."
      }
    ],
    "benefitsTitle": "Plan the Machining and Acceptance Requirements",
    "benefitsIntro": "Review the individual component before confirming the production route, price and schedule.",
    "benefits": [
      {
        "title": "Geometry and access",
        "text": "Review diameters, bores, threads, shoulders and milled features together. Restricted access or thin sections may require changes to the proposed process."
      },
      {
        "title": "Material and condition",
        "text": "State the exact material specification, stock condition and permitted alternatives. Confirm availability and any treatment before ordering."
      },
      {
        "title": "Finish and final dimensions",
        "text": "Identify functional surfaces, masked areas and the condition in which dimensions are accepted. Include any required measurements after finishing."
      },
      {
        "title": "Quantity and documentation",
        "text": "Share initial and repeat quantities, the target date and required records. Inspection coverage and delivery timing are confirmed with the quotation."
      }
    ],
    "heroTrust": [
      "Swiss machining and CNC turning/milling",
      "Machined components to an approved drawing",
      "Critical features and finish reviewed per order",
      "Inspection and delivery scope agreed before production"
    ],
    "portfolioTitle": "Component Examples to Specify",
    "portfolioIntro": "Examples illustrate individual machined parts. The accepted drawing defines the supplied item and its inspection requirements.",
    "portfolio": [
      {
        "title": "Contact sleeves and inserts",
        "text": "Review the internal profile, wall thickness and final dimensional condition on the supplied component.",
        "image": "/wp-content/uploads/2026/08/ev-charging-contact-pin-sleeve.jpg",
        "illustration": false
      },
      {
        "title": "Stepped receptacle components",
        "text": "Locate internal features relative to the external shoulder and carrier interface. Confirm bore and edge inspection access.",
        "image": "/wp-content/uploads/2026/09/ev-charging-connector-terminals.jpg",
        "illustration": false
      }
    ],
    "applications": [
      {
        "title": "EV Charging Equipment Applications",
        "industry": "Automotive",
        "href": "/industries/automotive",
        "image": "/wp-content/uploads/2026/08/ev-oem-vehicle-inlet-housing.jpg",
        "text": "Machined components are integrated into charging assemblies by the equipment manufacturer. The component drawing and quotation define our supply scope.",
        "imageAlt": "EV charging equipment application context",
        "linkLabel": "Explore automotive component machining"
      }
    ],
    "applicationsIntro": "Application images show the assembly environment. The supply scope is the individual machined component defined in the quotation.",
    "materialsTitle": "Material Options for Drawing Review",
    "materialsIntro": "Specify the exact grade and condition selected for the component. Availability, finishing compatibility and suitability require project review.",
    "materials": [
      {
        "title": "Copper and specified copper alloys",
        "text": "Provide the exact alloy and condition selected for the contact or terminal. Include the finish stack and required material records.",
        "href": "/materials/copper-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Brass",
        "text": "Specify the grade, contact or mechanical function, and any plating requirements. Confirm the material selection against the assembly design.",
        "href": "/materials/brass-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Stainless steel",
        "text": "For specified mechanical sleeves, locating parts or fasteners, identify the grade, fit and required surface condition.",
        "href": "/materials/stainless-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Aluminum",
        "text": "For specified mechanical locating components, provide alloy, temper, coating and final fit requirements.",
        "href": "/materials/aluminum-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      }
    ],
    "finishesTitle": "Define the Finish on the Drawing",
    "finishesIntro": "Include the finish specification, surfaces covered, masking and post-process dimensions. Process availability and documentation are confirmed for the order.",
    "finishes": [
      {
        "title": "Deburring and edge requirements",
        "summary": "Identify edges that contact seals, cables or mating parts. State permitted edge breaks and burr limits rather than relying on a generic deburr note.",
        "category": "Drawing requirement",
        "use": "Functional edges and assembly interfaces",
        "specify": "Burr limits, edge break and protected features",
        "tone": "blue"
      },
      {
        "title": "Surface condition",
        "summary": "Specify the required texture or coating for each functional surface. The drawing should distinguish cosmetic areas from fits and contact regions.",
        "category": "Drawing requirement",
        "use": "Specified contact, sealing and mating surfaces",
        "specify": "Surface texture, coating and masking areas",
        "tone": "blue"
      },
      {
        "title": "Final inspection condition",
        "summary": "Define whether acceptance applies before or after treatment. Include any coating-thickness, appearance and dimensional records needed.",
        "category": "Drawing requirement",
        "use": "Parts accepted after treatment",
        "specify": "Acceptance condition and required records",
        "tone": "blue"
      }
    ],
    "capacityTitle": "Production Planning",
    "capacityIntro": "Process selection, batch planning and inspection are reviewed for your drawing. Machine allocation and delivery timing are confirmed with the quotation.",
    "stats": [
      [
        "DFM",
        "Drawing and process review"
      ],
      [
        "Drawing",
        "Feature limits"
      ],
      [
        "QC",
        "Inspection plan"
      ],
      [
        "RFQ",
        "Quantity and delivery review"
      ]
    ],
    "qualityTitle": "Inspection and Order Documentation",
    "qualityIntro": "Agree the features to inspect, the measurement method and the records required for acceptance.",
    "qualityMetrics": [
      {
        "value": "Drawing",
        "label": "Feature-specific limits"
      },
      {
        "value": "Agreed",
        "label": "Inspection coverage"
      }
    ],
    "qualityStandards": [],
    "qualityReferenceNote": "No universal tolerance or certification is implied. Supplier qualification, material records and inspection requirements must be confirmed for the specific order.",
    "controls": [
      {
        "title": "Material and Revision",
        "check": "Drawing revision, material grade and supplied condition.",
        "verify": "Review the purchase specification and agreed material documentation.",
        "record": "Drawing revision and material records required by the order."
      },
      {
        "title": "Critical Geometry",
        "check": "Mating diameters, bores, threads, datums and positional relationships.",
        "verify": "Agree suitable measuring methods and inspection access for each feature.",
        "record": "Specified critical-feature measurements and any first-article report."
      },
      {
        "title": "Finish and Edges",
        "check": "Surface requirements, burr limits and dimensions after treatment.",
        "verify": "Inspect in the acceptance condition defined by the drawing.",
        "record": "Agreed finish and post-process inspection results."
      },
      {
        "title": "Release to Delivery",
        "check": "Quantity, marking, cleanliness, packaging and required records.",
        "verify": "Review the agreed release criteria before shipment.",
        "record": "Inspection and delivery documents included in the quotation."
      }
    ],
    "faqs": [
      {
        "question": "Do you supply complete charging equipment?",
        "answer": "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
        "points": []
      },
      {
        "question": "What is the focus of this component page?",
        "answer": "This page focuses on individual connector sleeves, receptacle inserts and locating bodies, especially the relationship between internal bores, external fits and retention features.",
        "points": []
      },
      {
        "question": "Does a machined component have an electrical or sealing rating?",
        "answer": "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings.",
        "points": []
      },
      {
        "question": "How should plating and mating dimensions be specified?",
        "answer": "Identify the substrate, finish specification, coated and masked surfaces, and whether each controlled dimension applies before or after plating. Include the mating-part drawing where it affects acceptance.",
        "points": []
      },
      {
        "question": "What is required for a quotation?",
        "answer": "Send the current component drawing, available model, material grade and condition, quantity, finish, critical dimensions and required records. Price, feasibility, any secondary operations and delivery timing are confirmed for that scope.",
        "points": []
      }
    ],
    "faqTitle": "EV Connector Sleeves and Inserts Questions",
    "relatedSlugs": [
      "ev-charging-gun",
      "ev-charging-plug",
      "ev-charger-manufacturing"
    ],
    "procurement": {
      "intro": "Send the component drawing and clarify the supplied item before requesting pricing.",
      "items": [
        "2D drawing and available 3D CAD with matching revision.",
        "Exact material grade, condition, quantity and repeat-order expectations.",
        "Critical fits, datums, threads, edge limits and finishing requirements.",
        "Inspection records, target date and any component qualification requirements."
      ],
      "links": [
        {
          "href": "/services/swiss-machining",
          "label": "Swiss machining for small bar-stock parts"
        },
        {
          "href": "/services/cnc-turning-and-milling",
          "label": "CNC turning and milling for combined features"
        },
        {
          "href": "/industries/automotive-swiss-machining",
          "label": "Automotive component applications"
        }
      ]
    },
    "ctaTitle": "Request a Component Machining Quote",
    "ctaDescription": "Machined sleeves, receptacle inserts and locating components for EV connectors. Define bore-to-diameter relationships, shoulders, retention details and finish. Share the drawing revision, material, quantity, finish and required inspection records.",
    "ctaTrustLine": "Drawing Review → Component Machining Plan → Agreed Inspection and Delivery",
    "sourceUrl": "https://www.cncpioneer.com/custom-cnc-parts/ev-charging-connector"
  },
  "ev-charger-manufacturing": {
    "title": "CNC-Machined EV Charger Components",
    "h1": "CNC-Machined EV Charger Components",
    "label": "CNC-Machined EV Charger Components",
    "hero": "/wp-content/uploads/2026/09/custom-ev-charging-contact-pins.jpg",
    "heroAlt": "Individual machined contact component examples",
    "heroDescription": "Custom terminals, threaded connection parts, sleeves and spacers for EV charging equipment. Supply is limited to individual machined components made to your drawing.",
    "overviewTitle": "Component Scope and Drawing Review",
    "overview": [
      "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
      "This page covers small machined hardware inside charging equipment: terminals, threaded connection parts, sleeves and spacers supplied to the equipment manufacturer.",
      "Send the individual component drawings from the equipment assembly. Cabinet fabrication, charger electronics, software and system assembly are outside the machining quotation.",
      "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings."
    ],
    "overviewImage": "/wp-content/uploads/2026/09/custom-ev-charging-contact-pins.jpg",
    "overviewImageAlt": "Individual machined contact component examples",
    "overviewPoints": [
      {
        "title": "Identify the supplied item",
        "text": "Use a component drawing and part number, rather than a whole-station drawing or charger power rating."
      },
      {
        "title": "Connection features",
        "text": "Define contact faces, threads, cable interfaces and locating dimensions required by the equipment design."
      },
      {
        "title": "Mechanical hardware",
        "text": "Dimension sleeves and spacers with their mating fits, mounting faces and edge requirements."
      },
      {
        "title": "Separate system validation",
        "text": "Specify any component tests separately; thermal, electrical and complete-equipment validation remain with the assembly program."
      }
    ],
    "benefitsTitle": "Plan the Machining and Acceptance Requirements",
    "benefitsIntro": "Review the individual component before confirming the production route, price and schedule.",
    "benefits": [
      {
        "title": "Geometry and access",
        "text": "Review diameters, bores, threads, shoulders and milled features together. Restricted access or thin sections may require changes to the proposed process."
      },
      {
        "title": "Material and condition",
        "text": "State the exact material specification, stock condition and permitted alternatives. Confirm availability and any treatment before ordering."
      },
      {
        "title": "Finish and final dimensions",
        "text": "Identify functional surfaces, masked areas and the condition in which dimensions are accepted. Include any required measurements after finishing."
      },
      {
        "title": "Quantity and documentation",
        "text": "Share initial and repeat quantities, the target date and required records. Inspection coverage and delivery timing are confirmed with the quotation."
      }
    ],
    "heroTrust": [
      "Swiss machining and CNC turning/milling",
      "Machined components to an approved drawing",
      "Critical features and finish reviewed per order",
      "Inspection and delivery scope agreed before production"
    ],
    "portfolioTitle": "Component Examples to Specify",
    "portfolioIntro": "Examples illustrate individual machined parts. The accepted drawing defines the supplied item and its inspection requirements.",
    "portfolio": [
      {
        "title": "Terminal components",
        "text": "Individual machined terminal geometry for a specified connection interface. Include material and contact-face requirements.",
        "image": "/wp-content/uploads/2026/09/ev-charging-connector-terminals.jpg",
        "illustration": false
      },
      {
        "title": "Sleeves and locating parts",
        "text": "Bores, shoulders and mating diameters are reviewed together with the assembly fit and surface condition.",
        "image": "/wp-content/uploads/2026/08/ev-charging-contact-pin-sleeve.jpg",
        "illustration": false
      }
    ],
    "applications": [
      {
        "title": "EV Charging Equipment Applications",
        "industry": "Automotive",
        "href": "/industries/automotive",
        "image": "/wp-content/uploads/2026/08/evse-oem-level-2-wallbox.jpg",
        "text": "Machined components are integrated into charging assemblies by the equipment manufacturer. The component drawing and quotation define our supply scope.",
        "imageAlt": "EV charging equipment application context",
        "linkLabel": "Explore automotive component machining"
      }
    ],
    "applicationsIntro": "Application images show the assembly environment. The supply scope is the individual machined component defined in the quotation.",
    "materialsTitle": "Material Options for Drawing Review",
    "materialsIntro": "Specify the exact grade and condition selected for the component. Availability, finishing compatibility and suitability require project review.",
    "materials": [
      {
        "title": "Copper and specified copper alloys",
        "text": "Provide the exact alloy and condition selected for the contact or terminal. Include the finish stack and required material records.",
        "href": "/materials/copper-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Brass",
        "text": "Specify the grade, contact or mechanical function, and any plating requirements. Confirm the material selection against the assembly design.",
        "href": "/materials/brass-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Stainless steel",
        "text": "For specified mechanical sleeves, locating parts or fasteners, identify the grade, fit and required surface condition.",
        "href": "/materials/stainless-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Aluminum",
        "text": "For specified spacers or mechanical hardware, identify the alloy, temper, threads and finish.",
        "href": "/materials/aluminum-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      }
    ],
    "finishesTitle": "Define the Finish on the Drawing",
    "finishesIntro": "Include the finish specification, surfaces covered, masking and post-process dimensions. Process availability and documentation are confirmed for the order.",
    "finishes": [
      {
        "title": "Deburring and edge requirements",
        "summary": "Identify edges that contact seals, cables or mating parts. State permitted edge breaks and burr limits rather than relying on a generic deburr note.",
        "category": "Drawing requirement",
        "use": "Functional edges and assembly interfaces",
        "specify": "Burr limits, edge break and protected features",
        "tone": "blue"
      },
      {
        "title": "Surface condition",
        "summary": "Specify the required texture or coating for each functional surface. The drawing should distinguish cosmetic areas from fits and contact regions.",
        "category": "Drawing requirement",
        "use": "Specified contact, sealing and mating surfaces",
        "specify": "Surface texture, coating and masking areas",
        "tone": "blue"
      },
      {
        "title": "Final inspection condition",
        "summary": "Define whether acceptance applies before or after treatment. Include any coating-thickness, appearance and dimensional records needed.",
        "category": "Drawing requirement",
        "use": "Parts accepted after treatment",
        "specify": "Acceptance condition and required records",
        "tone": "blue"
      }
    ],
    "capacityTitle": "Production Planning",
    "capacityIntro": "Process selection, batch planning and inspection are reviewed for your drawing. Machine allocation and delivery timing are confirmed with the quotation.",
    "stats": [
      [
        "DFM",
        "Drawing and process review"
      ],
      [
        "Drawing",
        "Feature limits"
      ],
      [
        "QC",
        "Inspection plan"
      ],
      [
        "RFQ",
        "Quantity and delivery review"
      ]
    ],
    "qualityTitle": "Inspection and Order Documentation",
    "qualityIntro": "Agree the features to inspect, the measurement method and the records required for acceptance.",
    "qualityMetrics": [
      {
        "value": "Drawing",
        "label": "Feature-specific limits"
      },
      {
        "value": "Agreed",
        "label": "Inspection coverage"
      }
    ],
    "qualityStandards": [],
    "qualityReferenceNote": "No universal tolerance or certification is implied. Supplier qualification, material records and inspection requirements must be confirmed for the specific order.",
    "controls": [
      {
        "title": "Material and Revision",
        "check": "Drawing revision, material grade and supplied condition.",
        "verify": "Review the purchase specification and agreed material documentation.",
        "record": "Drawing revision and material records required by the order."
      },
      {
        "title": "Critical Geometry",
        "check": "Mating diameters, bores, threads, datums and positional relationships.",
        "verify": "Agree suitable measuring methods and inspection access for each feature.",
        "record": "Specified critical-feature measurements and any first-article report."
      },
      {
        "title": "Finish and Edges",
        "check": "Surface requirements, burr limits and dimensions after treatment.",
        "verify": "Inspect in the acceptance condition defined by the drawing.",
        "record": "Agreed finish and post-process inspection results."
      },
      {
        "title": "Release to Delivery",
        "check": "Quantity, marking, cleanliness, packaging and required records.",
        "verify": "Review the agreed release criteria before shipment.",
        "record": "Inspection and delivery documents included in the quotation."
      }
    ],
    "faqs": [
      {
        "question": "Do you supply complete charging equipment?",
        "answer": "CNCPioneer supplies individual CNC-machined parts for charging equipment. Complete charging guns, plug assemblies, vehicle inlets and charging stations are outside this supply scope.",
        "points": []
      },
      {
        "question": "What is the focus of this component page?",
        "answer": "This page covers small machined hardware inside charging equipment: terminals, threaded connection parts, sleeves and spacers supplied to the equipment manufacturer.",
        "points": []
      },
      {
        "question": "Does a machined component have an electrical or sealing rating?",
        "answer": "The equipment designer or integrator defines and validates electrical rating, temperature rise, mating performance, sealing and system compliance. A machined part or dimensional report does not establish those assembly ratings.",
        "points": []
      },
      {
        "question": "How should plating and mating dimensions be specified?",
        "answer": "Identify the substrate, finish specification, coated and masked surfaces, and whether each controlled dimension applies before or after plating. Include the mating-part drawing where it affects acceptance.",
        "points": []
      },
      {
        "question": "What is required for a quotation?",
        "answer": "Send the current component drawing, available model, material grade and condition, quantity, finish, critical dimensions and required records. Price, feasibility, any secondary operations and delivery timing are confirmed for that scope.",
        "points": []
      }
    ],
    "faqTitle": "CNC-Machined EV Charger Components Questions",
    "relatedSlugs": [
      "ev-charging-gun",
      "ev-charging-plug",
      "ev-charging-connector"
    ],
    "procurement": {
      "intro": "Send the component drawing and clarify the supplied item before requesting pricing.",
      "items": [
        "2D drawing and available 3D CAD with matching revision.",
        "Exact material grade, condition, quantity and repeat-order expectations.",
        "Critical fits, datums, threads, edge limits and finishing requirements.",
        "Inspection records, target date and any component qualification requirements."
      ],
      "links": [
        {
          "href": "/services/swiss-machining",
          "label": "Swiss machining for small bar-stock parts"
        },
        {
          "href": "/services/cnc-turning-and-milling",
          "label": "CNC turning and milling for combined features"
        },
        {
          "href": "/industries/automotive-swiss-machining",
          "label": "Automotive component applications"
        }
      ]
    },
    "ctaTitle": "Request a Component Machining Quote",
    "ctaDescription": "Custom terminals, threaded connection parts, sleeves and spacers for EV charging equipment. Supply is limited to individual machined components made to your drawing. Share the drawing revision, material, quantity, finish and required inspection records.",
    "ctaTrustLine": "Drawing Review → Component Machining Plan → Agreed Inspection and Delivery",
    "sourceUrl": "https://www.cncpioneer.com/custom-cnc-parts/ev-charger-manufacturing"
  },
  "robot-shaft-parts": {
    "title": "Custom Robot Shaft Parts",
    "h1": "Custom Robot Shaft Parts",
    "label": "Custom Robot Shaft Parts",
    "hero": "/wp-content/uploads/2026/04/robot-shaft-parts.jpg",
    "heroAlt": "Machined shaft component examples",
    "heroDescription": "Custom robot shafts and pins made to your drawing. Review bearing journals, locating faces, drive interfaces, bores, material condition and inspection requirements.",
    "overviewTitle": "Component Scope and Drawing Review",
    "overview": [
      "Robot shafts locate rotating components and transmit motion through defined interfaces. The manufacturing review should start with bearing seats, locating shoulders, mating features and the assembly datum scheme.",
      "CNCPioneer focuses on Swiss machining and CNC turning and milling. Small bar-stock shafts and parts combining turned diameters with milled features are reviewed for process suitability. The scope is the machined component, not a complete motor, gearbox or robot.",
      "Material, heat treatment, finishing and inspection affect how the shaft is accepted. Required supplier qualifications and documentation must be confirmed for the order."
    ],
    "overviewImage": "/wp-content/uploads/2026/04/robot-shaft-parts.jpg",
    "overviewImageAlt": "Machined shaft component examples",
    "overviewPoints": [
      {
        "title": "Bearing interfaces",
        "text": "Identify journal fits, shoulder locations and the datum axis used to accept the shaft."
      },
      {
        "title": "Runout and geometric controls",
        "text": "Specify the required characteristic and datum references. A single plus/minus size tolerance does not describe every geometric relationship."
      },
      {
        "title": "Drive features",
        "text": "Define flats, slots, threads or other interfaces. Any tooth-form generation, grinding or additional treatment requires separate process review."
      },
      {
        "title": "Hollow sections",
        "text": "Provide bore diameter, depth, wall thickness, straightness requirements and access for inspection."
      }
    ],
    "benefitsTitle": "Plan the Machining and Acceptance Requirements",
    "benefitsIntro": "Review the individual component before confirming the production route, price and schedule.",
    "benefits": [
      {
        "title": "Geometry and access",
        "text": "Review diameters, bores, threads, shoulders and milled features together. Restricted access or thin sections may require changes to the proposed process."
      },
      {
        "title": "Material and condition",
        "text": "State the exact material specification, stock condition and permitted alternatives. Confirm availability and any treatment before ordering."
      },
      {
        "title": "Finish and final dimensions",
        "text": "Identify functional surfaces, masked areas and the condition in which dimensions are accepted. Include any required measurements after finishing."
      },
      {
        "title": "Quantity and documentation",
        "text": "Share initial and repeat quantities, the target date and required records. Inspection coverage and delivery timing are confirmed with the quotation."
      }
    ],
    "heroTrust": [
      "Swiss machining and CNC turning/milling",
      "Machined components to an approved drawing",
      "Critical features and finish reviewed per order",
      "Inspection and delivery scope agreed before production"
    ],
    "portfolioTitle": "Component Examples to Specify",
    "portfolioIntro": "Examples illustrate individual machined parts. The accepted drawing defines the supplied item and its inspection requirements.",
    "portfolio": [
      {
        "title": "Motor interface shafts",
        "text": "Turned journals, shoulders and end features defined by the motor and coupling assembly drawing.",
        "image": "/wp-content/uploads/2026/04/servo-motor-output-shaft.jpg",
        "illustration": false
      },
      {
        "title": "Encoder and locating shafts",
        "text": "Small shafts with defined location and sensing interfaces; critical geometry and finish require drawing review.",
        "image": "/wp-content/uploads/2026/04/encoder-shaft.jpg",
        "illustration": false
      },
      {
        "title": "Hollow shaft components",
        "text": "Bores and external fits considered together, including wall thickness, burr control and inspection access.",
        "image": "/wp-content/uploads/2026/04/hollow-robot-shaft.jpg",
        "illustration": false
      }
    ],
    "applications": [
      {
        "title": "Industrial & Collaborative Robotics",
        "industry": "Robotics",
        "href": "/industries/robotics",
        "image": "/wp-content/uploads/2026/04/collaborative-robots.jpg",
        "linkLabel": "Explore robotics component machining",
        "text": "Shaft components for customer-designed joints, actuators and positioning assemblies. The drawing defines the interfaces and acceptance scope; no customer brand relationship is implied.",
        "imageAlt": "Robotic equipment application context"
      }
    ],
    "applicationsIntro": "Application images show the assembly environment. The supply scope is the individual machined component defined in the quotation.",
    "materialsTitle": "Material Options for Drawing Review",
    "materialsIntro": "Specify the exact grade and condition selected for the component. Availability, finishing compatibility and suitability require project review.",
    "materials": [
      {
        "title": "Stainless steel",
        "text": "Identify the grade and delivery condition, bearing or locating surfaces and any post-machining treatment.",
        "href": "/materials/stainless-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Alloy steel",
        "text": "Specify material condition, heat-treatment requirements and the acceptance stage for critical shaft dimensions.",
        "href": "/materials/alloy-steel-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      },
      {
        "title": "Aluminum",
        "text": "For suitable lightweight shaft or locating applications, confirm the alloy, temper, surface treatment and mating requirements.",
        "href": "/materials/aluminum-cnc-machining",
        "category": "metals",
        "tag": "Grade and condition to drawing"
      }
    ],
    "finishesTitle": "Define the Finish on the Drawing",
    "finishesIntro": "Include the finish specification, surfaces covered, masking and post-process dimensions. Process availability and documentation are confirmed for the order.",
    "finishes": [
      {
        "title": "Defined surface texture",
        "summary": "Identify bearing seats, seal paths and sliding surfaces separately. Specify the texture and the stage at which it will be measured.",
        "category": "Drawing requirement",
        "use": "Functional edges and assembly interfaces",
        "specify": "Burr limits, edge break and protected features",
        "tone": "blue"
      },
      {
        "title": "Heat treatment and coating",
        "summary": "Provide the material condition, treatment specification, masked areas and acceptance sequence. Availability and any secondary processing require quotation review.",
        "category": "Drawing requirement",
        "use": "Specified contact, sealing and mating surfaces",
        "specify": "Surface texture, coating and masking areas",
        "tone": "blue"
      },
      {
        "title": "Edge and bore condition",
        "summary": "Specify burr limits at cross-holes, bore exits and cable-routing edges. Agree how accessible and hidden features will be checked.",
        "category": "Drawing requirement",
        "use": "Parts accepted after treatment",
        "specify": "Acceptance condition and required records",
        "tone": "blue"
      }
    ],
    "capacityTitle": "Production Planning",
    "capacityIntro": "Process selection, batch planning and inspection are reviewed for your drawing. Machine allocation and delivery timing are confirmed with the quotation.",
    "stats": [
      [
        "DFM",
        "Drawing and process review"
      ],
      [
        "Drawing",
        "Feature limits"
      ],
      [
        "QC",
        "Inspection plan"
      ],
      [
        "RFQ",
        "Quantity and delivery review"
      ]
    ],
    "qualityTitle": "Inspection and Order Documentation",
    "qualityIntro": "Agree the features to inspect, the measurement method and the records required for acceptance.",
    "qualityMetrics": [
      {
        "value": "Drawing",
        "label": "Feature-specific limits"
      },
      {
        "value": "Agreed",
        "label": "Inspection coverage"
      }
    ],
    "qualityStandards": [],
    "qualityReferenceNote": "No universal tolerance or certification is implied. Supplier qualification, material records and inspection requirements must be confirmed for the specific order.",
    "controls": [
      {
        "title": "Material and Revision",
        "check": "Drawing revision, material grade and supplied condition.",
        "verify": "Review the purchase specification and agreed material documentation.",
        "record": "Drawing revision and material records required by the order."
      },
      {
        "title": "Critical Geometry",
        "check": "Mating diameters, bores, threads, datums and positional relationships.",
        "verify": "Agree suitable measuring methods and inspection access for each feature.",
        "record": "Specified critical-feature measurements and any first-article report."
      },
      {
        "title": "Finish and Edges",
        "check": "Surface requirements, burr limits and dimensions after treatment.",
        "verify": "Inspect in the acceptance condition defined by the drawing.",
        "record": "Agreed finish and post-process inspection results."
      },
      {
        "title": "Release to Delivery",
        "check": "Quantity, marking, cleanliness, packaging and required records.",
        "verify": "Review the agreed release criteria before shipment.",
        "record": "Inspection and delivery documents included in the quotation."
      }
    ],
    "faqs": [
      {
        "question": "Which robot shaft features can be reviewed?",
        "answer": "Send drawings for journals, shoulders, flats, grooves, bores, threads and drive interfaces. The geometry, material and quantity determine the machining route. Additional grinding, tooth generation or treatment must be confirmed as part of the scope.",
        "points": []
      },
      {
        "question": "What shaft tolerances do you guarantee?",
        "answer": "There is no single tolerance for every shaft. Specify the functional dimensions, datums, runout or other geometric requirements and surface condition. Feasibility and inspection methods are agreed for the individual features before ordering.",
        "points": []
      },
      {
        "question": "Can hollow shafts be considered?",
        "answer": "Yes, submit the bore diameter, depth, wall thickness, external geometry and acceptance requirements for review. Deep bores and thin walls need specific consideration of process and inspection access.",
        "points": []
      },
      {
        "question": "What documents should a robot shaft enquiry include?",
        "answer": "Provide the component drawing, material and heat-treatment condition, mating information, finish, quantity and target date. Include required material records, inspection reports and supplier qualification requirements.",
        "points": []
      },
      {
        "question": "Do you supply complete robotic assemblies?",
        "answer": "This page covers machined shaft components. Motors, reducers and complete robot assemblies are outside this component quotation; assembly design and validation requirements need to be defined by the customer.",
        "points": []
      }
    ],
    "faqTitle": "Custom Robot Shaft Parts Questions",
    "relatedSlugs": [
      "stainless-steel-precision-turning-shaft",
      "cnc-machined-pins",
      "bearing-bushing"
    ],
    "procurement": {
      "intro": "Send the component drawing and clarify the supplied item before requesting pricing.",
      "items": [
        "2D drawing and available 3D CAD with matching revision.",
        "Exact material grade, condition, quantity and repeat-order expectations.",
        "Critical fits, datums, threads, edge limits and finishing requirements.",
        "Inspection records, target date and any component qualification requirements."
      ],
      "links": [
        {
          "href": "/services/swiss-machining",
          "label": "Swiss machining for small bar-stock parts"
        },
        {
          "href": "/services/cnc-turning-and-milling",
          "label": "CNC turning and milling for combined features"
        },
        {
          "href": "/industries/robotics",
          "label": "Robotics component applications"
        }
      ]
    },
    "ctaTitle": "Request a Component Machining Quote",
    "ctaDescription": "Custom robot shafts and pins made to your drawing. Review bearing journals, locating faces, drive interfaces, bores, material condition and inspection requirements. Share the drawing revision, material, quantity, finish and required inspection records.",
    "ctaTrustLine": "Drawing Review → Component Machining Plan → Agreed Inspection and Delivery",
    "sourceUrl": "https://www.cncpioneer.com/custom-cnc-parts/robot-shaft-parts"
  }
};
export const productScopeMetadata = {
  "ev-charging-gun": {
    "title": "EV Charging Gun Contact Pins | CNCPioneer",
    "description": "Custom machined contact pins for charging-gun assemblies. Review contact profiles, locating shoulders, cable-side termination features and plating requirements."
  },
  "ev-charging-plug": {
    "title": "EV Charging Plug Contact Components | CNCPioneer",
    "description": "CNC-machined contact components for EV charging plugs, reviewed around mating dimensions, insertion depth, termination geometry and final plated condition."
  },
  "ev-charging-connector": {
    "title": "EV Connector Sleeves and Inserts | CNCPioneer",
    "description": "Machined sleeves, receptacle inserts and locating components for EV connectors. Define bore-to-diameter relationships, shoulders, retention details and finish."
  },
  "ev-charger-manufacturing": {
    "title": "CNC-Machined EV Charger Components | CNCPioneer",
    "description": "Custom terminals, threaded connection parts, sleeves and spacers for EV charging equipment. Supply is limited to individual machined components made to your drawing."
  },
  "robot-shaft-parts": {
    "title": "Custom Robot Shaft Parts | CNCPioneer",
    "description": "Custom robot shafts and pins made to your drawing. Review bearing journals, locating faces, drive interfaces, bores, material condition and inspection requirements."
  }
};
export function applyProductScopeCorrections(content) {
  for (const slug of Object.keys(content)) if (isRemovedProductRoute(`/custom-cnc-parts/${slug}`)) delete content[slug];
  for (const [slug, product] of Object.entries(productScopeCorrections)) content[slug] = { ...structuredClone(product), scopeReviewed: true };
}
export function applyProductScopeMetadata(pages) {
  for (let i = pages.length - 1; i >= 0; i--) if (isRemovedProductRoute(`/custom-cnc-parts/${pages[i].slug}`)) pages.splice(i, 1);
  for (const page of pages) {
    const product = productScopeCorrections[page.slug]; if (!product) continue;
    Object.assign(page, {
      title: product.h1, description: product.heroDescription, image: product.hero,
      seo: { ...page.seo, ...productScopeMetadata[page.slug], image: product.hero },
      sections: [{ heading: product.overviewTitle, text: product.overview.join(' '), items: product.overviewPoints.map(p => `${p.title}: ${p.text}`), image: product.overviewImage }],
      gallery: product.portfolio.map(p => ({ image: p.image, alt: p.title })), faqs: product.faqs,
    });
  }
}
