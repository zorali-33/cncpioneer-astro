// Scoped edits applied after archive preparation, preserving existing section IDs and reviewed links.
export const blogContentAmendments = {
  "inconel-vs-titanium": "Choose between Inconel and titanium by evaluating operating temperature, component mass, the exact corrosive environment and total manufactured cost. Compare specified grades and material conditions, rather than treating either alloy family as a single material. The tables below are selection references, not design allowables or a guarantee of part performance.",
  "inconel-vs-monel": "Inconel and Monel are nickel alloy families with different compositions and service uses. Compare the specified grade against the actual temperature, chemical concentration, flow conditions and mechanical load. A family name alone cannot establish corrosion resistance, machining cost or interchangeability, including in <a href=\"/industries/aerospace\" id=\"970\">aerospace</a> applications.",
  "chamfer-cnc-machining": "A chamfer replaces a sharp edge with an angled face. On a CNC drawing, specify its size and angle, identify the affected edges, and check the clearance needed by the mating part. A chamfer, an edge break and a rounded fillet are different requirements; the sections and illustrations below explain when each is useful.",
  "cnc-machining-fillets": "A fillet is a rounded transition between surfaces. For a milled internal corner, choose the radius with cutter access, pocket depth and the mating component in mind. Identify the radius and tolerance on the drawing; do not assume an internal corner can be made sharp with a round milling cutter. The existing design illustrations below show the tradeoffs.",
  "oil-and-gas-machining": "Oil and gas machining produces components such as valve bodies, fittings, pump parts and downhole interfaces. This technical guide explains how the operating medium, pressure and temperature inform material selection, sealing features, traceability and inspection. A purchasing specification should identify these conditions before the machining route is agreed.",
  "slot-milling": "Slot milling removes material to form a channel such as a keyway, guide slot or recessed feature. Select the method and cutter around the slot width, depth, end geometry and available access. Plan chip evacuation, workholding and the inspection of width, position and depth together; the methods below suit different slot geometries. See the <a href=\"/blog/cnc-milling\" id=\"/blog/cnc-milling\">CNC milling overview</a> for the wider process context.",
};

const alloy625 = "https://www.specialmetals.com/documents/technical-bulletins/inconel/inconel-alloy-625.pdf";
const alloy400 = "https://www.specialmetals.com/documents/technical-bulletins/monel-alloy-400.pdf";
const ti64 = "https://www.timet.com/documents/datasheets/alpha-and-beta-alloys/timetal-6-4.pdf";
export const blogNextSteps = {
  "cnc-locating-pins": '<p>For a custom locating component, identify the locating diameter, engagement length, mating fit and datum requirements on the drawing. Review the manufacturing route through our <a href="/services/swiss-machining">Swiss machining service</a>; the assembly design still determines the required fit.</p>',
  "surface-finish-symbols": '<p>Continue with the <a href="/blog/surface-finish-chart">surface finish reference chart</a> for values and the <a href="/blog/surface-roughness">surface roughness guide</a> for parameter selection. When requesting a quote, identify the controlled surfaces and measurement requirements on the drawing.</p>',
  "stainless-steel-cnc-machining": '<p>For a part-specific manufacturing review, visit our <a href="/materials/stainless-steel-cnc-machining">stainless steel CNC machining service</a>. Include the grade, condition, drawing and finishing requirements so the enquiry can be assessed beyond general material guidance.</p>',
  "cnc-machined-uav-parts": '<p>For brackets, motor mounts, housings and airframe interfaces made to a defined design, explore <a href="/custom-cnc-parts/cnc-machining-drone-parts">custom CNC machined drone parts</a>. Provide the drawing, alloy, wall geometry and inspection requirements for review.</p>',
};
const table = (headers, rows) => `<table><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

export function amendBlogContent(html, slug) {
  const lead = blogContentAmendments[slug];
  if (!lead) return html + (blogNextSteps[slug] || "");
  let result = html.replace(/<p\b([^>]*)>[\s\S]*?<\/p>/i, `<p$1>${lead}</p>`);
  if (slug === "inconel-vs-titanium" || slug === "inconel-vs-monel") {
    const titanium = slug === "inconel-vs-titanium";
    const sources = `<p>Grade-specific references: <a href="${alloy625}">Special Metals alloy 625 technical bulletin</a> and <a href="${titanium ? ti64 : alloy400}">${titanium ? "TIMET TIMETAL 6-4 datasheet" : "Special Metals alloy 400 technical bulletin"}</a>. Consult the current purchase specification and material certificate for acceptance limits.</p>`;
    let index = 0;
    result = result.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, () => {
      index++;
      if (index === 1) return table(["Representative grade", "Composition reference (weight %)", "Scope"], [
        ["INCONEL 625 (UNS N06625)", "Ni 58 minimum; Cr 20–23; Mo 8–10; Nb+Ta 3.15–4.15", "Selected principal elements; see the full supplier specification."],
        titanium ? ["TIMETAL 6-4 (Grade 5)", "Al 5.5–6.75; V 3.5–4.5; titanium balance", "Grade 5 only; Grade 23 and other variants have different limits."] : ["MONEL 400 (UNS N04400)", "Ni+Co 63 minimum; Cu 28–34", "Selected principal elements; do not apply to K-500."],
      ]);
      return table(["Design input", "How to compare the selected grades"], [
        ["Strength and ductility", "Use properties for the specified product form, section size, heat treatment and test temperature. A single tensile value cannot represent an alloy family."],
        ["Temperature and service life", "Review operating stress, exposure duration, creep and oxidation data. A melting point or supplier service range is not a design allowable."],
        ["Corrosion exposure", "State the medium, concentration, temperature and flow or stagnant conditions. Confirm suitability with grade-specific corrosion data."],
        ["Weight and cost", "Compare actual geometry and current material and machining quotations. Do not assume a fixed price ratio between the alloys."],
      ]);
    });
    // Replace categorical purchasing claims in the existing quick-comparison list.
    result = result.replace(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi, (whole, attrs, body) => {
      const text = body.replace(/<[^>]*>/g, "").trim();
      if (/^Cost\s*[—–-]/i.test(text)) return `<li${attrs}><strong>Cost</strong> — Compare current quotes for the same geometry, material condition, quantity and inspection scope; no fixed percentage saving applies.</li>`;
      if (/^(Temperature capability|Strength at temperature)\s*[—–-]/i.test(text)) return `<li${attrs}><strong>Temperature capability</strong> — Use grade-specific data at the intended stress, temperature and exposure duration; alloy-family comparisons are not acceptance limits.</li>`;
      if (/^Corrosion(?: type)?\s*[—–-]/i.test(text)) return `<li${attrs}><strong>Corrosion</strong> — Compare the exact medium and operating conditions with the selected grade's corrosion data.</li>`;
      return whole;
    });
    result += sources;
  }
  return result;
}
