// Base materials for the machined pin/socket contacts shown on this product page.
// Technical references: Mill-Max raw-materials catalog (263M-265M), Copper
// Development Association C54400 data and DKI copper-alloy machining guidance.
// Arcing-contact composites and precious-metal stock are outside this page's scope.
export const electricalContactMaterialContent = {
  materialsTitle: "Materials for Electrical Contacts",
  materialsIntro: "Copper and copper-alloy bar stock for Swiss-machined and turned electrical contacts. Match the grade and temper to conductivity, strength and contact geometry. Specify gold, silver, nickel or tin plating separately from the base material, and confirm the material and finish with your drawing.",
  materials: [
    {
      title: "C36000 Free-Machining Brass",
      tag: "Turned Pins & Contact Bodies",
      category: "metals",
      text: "A readily machined option for connector pins, socket bodies and terminals. Match conductivity and mechanical requirements to the application, and specify lead-content requirements, plating and any crimp features on the drawing.",
    },
    {
      title: "C11000 / C10200 Copper",
      tag: "Conductive Power Contacts",
      category: "metals",
      text: "High-conductivity copper for power pins, terminals and current-carrying contact bodies. Define the copper grade and temper, mating surfaces and plating allowance; current capacity depends on the complete contact and connector design.",
    },
    {
      title: "C14500 Tellurium Copper",
      tag: "Conductivity & Machinability",
      category: "metals",
      text: "Combines high electrical conductivity with improved machinability compared with unalloyed copper. Useful for turned power contacts and terminals with steps, bores or threads. Specify stock condition and the required contact finish.",
    },
    {
      title: "C17200 Beryllium Copper",
      tag: "Strength & Resilient Contacts",
      category: "metals",
      text: "A high-strength copper alloy for resilient socket contacts and contact components subject to repeated mating. Specify material temper, heat-treatment condition and contact geometry; spring force and service life require validation in the assembly.",
    },
    {
      title: "C54400 Phosphor Bronze",
      tag: "Durable Machined Contacts",
      category: "metals",
      text: "A machinable phosphor bronze for turned pins and electrical connector parts where strength and wear resistance matter. Review conductivity, material condition and lead-content requirements against the specified contact design.",
    },
    {
      title: "C18150 Chromium Zirconium Copper",
      tag: "Conductivity with Added Strength",
      category: "metals",
      text: "CuCrZr offers a balance of electrical conductivity, strength and resistance to softening at elevated temperatures. Consider it for loaded power-contact components, with heat-treatment condition, contact geometry and finishing agreed for the application.",
    },
  ],
};

export function applyElectricalContactMaterialContent(product) {
  Object.assign(product, electricalContactMaterialContent);
  product.overviewPoints = product.overviewPoints.map((point) =>
    point.title === "Precious and refractory metal machining as a material-specific competency"
      ? {
          title: "Copper-alloy selection for machined contacts",
          text: "Select brass, copper, tellurium copper, beryllium copper, phosphor bronze or chromium zirconium copper around the contact's conductivity, strength, stock condition and machining requirements.",
        }
      : point,
  );
  product.benefits = product.benefits.map((benefit) =>
    benefit.title === "Precious and Refractory Metal Machining Competency"
      ? {
          title: "Material & Plating Matched to the Contact",
          text: "Review the copper-alloy base material, temper and contact geometry together. Specify plating separately, including coating thickness, masked areas and whether critical dimensions apply before or after finishing.",
        }
      : benefit,
  );
  product.faqs = product.faqs.map((faq) =>
    faq.question === "Which materials can I specify?"
      ? {
          ...faq,
          answer: "For machined electrical contacts, material options include C36000 brass, C11000 or C10200 copper, C14500 tellurium copper, C17200 beryllium copper, C54400 phosphor bronze and C18150 chromium zirconium copper. Confirm the exact grade, stock form and temper against the drawing and contact function.",
          points: ["Specify plating separately from the base metal, including coating thickness and dimensional allowance.", "Include material certificates, lead-content requirements and any electrical or mechanical acceptance tests with your enquiry."],
        }
      : faq,
  );
}
