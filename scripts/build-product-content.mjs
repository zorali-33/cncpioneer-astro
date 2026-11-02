import fs from "node:fs";
import path from "node:path";
import { parse } from "ultrahtml";
import { characterEntitiesHtml4 } from "character-entities-html4";
import { nativeParts } from "../src/data/nativeParts.mjs";
import { consolidateFlangeContent } from "../src/data/flangeContent.mjs";
import { productApplicationOverrides } from "../src/data/productApplicationOverrides.mjs";
import { aluminumFlangeContent, aluminumFlangeSlug } from "../src/data/aluminumFlangeContent.mjs";
import { motorStatorHousingContent } from "../src/data/motorStatorHousingContent.mjs";
import { aerospaceBracketsContent } from "../src/data/aerospaceBracketsContent.mjs";
import { semiconductorVacuumChamberContent } from "../src/data/semiconductorVacuumChamberContent.mjs";
import { stainlessSemiconductorContent } from "../src/data/stainlessSemiconductorContent.mjs";
import { aluminumMillingConnectorContent, aluminumMillingConnectorSlug } from "../src/data/aluminumMillingConnectorContent.mjs";
import { applyElectricalContactMaterialContent } from "../src/data/electricalContactMaterialContent.mjs";


const root = process.cwd();
const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
const liveDir = process.argv.includes("--source-dir") ? path.resolve(arg("--source-dir")) : "";
const reportDir = process.argv.includes("--report-dir") ? path.resolve(arg("--report-dir")) : path.join(root, "work", "product-template");
fs.mkdirSync(reportDir, { recursive: true });
const publicDir = path.join(root, "public");
const decode = (s = "") => String(s).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&([a-zA-Z0-9]+);/g, (all, n) => characterEntitiesHtml4[n] || all).replace(/[\u200b-\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
const text = (n) => !n ? "" : n.type === 2 ? n.value : ["script", "style", "noscript", "svg"].includes(n.name) ? "" : (n.children || []).map(text).join(" ");
const plain = (n) => decode(text(n));
const find = (n, test) => {
  const result = [];
  const walk = (node) => { if (test(node)) result.push(node); for (const child of node.children || []) walk(child); };
  walk(n);
  return result;
};
const has = (n, cls) => n.type === 1 && (n.attributes?.class || "").split(/\s+/).includes(cls);
const first = (n, name) => find(n, (x) => x.name === name)[0];
const byClass = (n, cls) => find(n, (x) => has(x, cls));
const titleOf = (n) => plain(find(n, (x) => /^h[234]$/.test(x.name))[0]);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const unique = (a, key = (x) => x) => [...new Map(a.map((x) => [key(x), x])).values()];
const badClaim = /[$€£]|\bcase study\b|\b(?:saving|savings|cheaper|mandatory|guarantee|guaranteed|universal|eliminates)\b|\b100%|\bzero\b|\b\d[\d,.]*\s*(?:hours?|days?|weeks?|\/year)|XRF.{0,35}(?:carbon|C\s*[<≤])|\b(?:all|every).{0,20}must\b/i;
function summary(value, fallback, limit = 43) {
  const s = decode(value);
  const sentences = s.split(/(?<=[.!?])\s+(?=[A-Z“"'(\d])/);
  const candidate = (sentences[0] || "").trim();
  const usable = words(candidate) >= 7 && words(candidate) <= limit && !badClaim.test(candidate) && !/^(?:\(?\d|From\b|This\b|These\b)|\b(?:see above|following table|as shown|cannot achieve)\b/i.test(candidate) ? candidate : "";
  return usable || fallback;
}
function heading(value, fallback) {
  let s = decode(value).replace(/\s*(?:—|–|\|)\s*.*$/, "").replace(/\s*\([^)]{25,}\)/g, "").replace(/\b(?:Mandatory|Guaranteed)\b/gi, "").replace(/\s+/g, " ").trim();
  if (!s || /[$€£]|saving|case study|\d+%/.test(s)) s = fallback;
  if (s.length > 88) s = s.slice(0, 88).replace(/\s+\S*$/, "");
  return s.replace(/\s+(?:and|or|for|with|&|to|of|in)$/i, "");
}
const missingAssets = new Set();
function localImage(value) {
  if (!value) return "";
  let url = decode(value);
  try { if (/^https?:/.test(url)) url = new URL(url).pathname; } catch { return ""; }
  url = url.split("?")[0];
  if (!url.startsWith("/") || /logo|site-icon|cropped-site/i.test(url)) return "";
  if (fs.existsSync(path.join(publicDir, decodeURIComponent(url)))) return url;
  missingAssets.add(url);
  return "";
}
function imageOf(node) {
  for (const img of find(node, (n) => n.name === "img")) {
    const a = img.attributes || {};
    const image = localImage(a["data-lazy-src"] || a["data-src"] || a.src);
    if (image) return image;
  }
  return "";
}
const industryDefs = [
  ["Semiconductor", "semiconductor", /semiconductor|wafer|microchip/i, "/assets/semiconductor-industry.jpg", "Process equipment, precision interfaces and test systems"],
  ["Aerospace", "aerospace", /aerospace|aircraft|aviation|spacecraft/i, "/assets/aerospace-industry.jpg", "Aircraft equipment, structures and precision assemblies"],
  ["Automotive", "automotive", /automotive|vehicle|electric mobility|\bEV\b/i, "/assets/automotive-industry.jpg", "Vehicle systems, electrical connections and production assemblies"],
  ["Medical", "medical", /medical|surgical|dental|healthcare|pharma/i, "/assets/medical-industry.jpg", "Medical equipment, instruments and component assemblies"],
  ["Oil & Gas", "oil-gas", /oil|gas|offshore|petrochemical/i, "/assets/oil-gas-industry.jpg", "Fluid handling, instrumentation and process equipment"],
  ["Defense", "defense", /defen[cs]e|military|radar/i, "/assets/defense-industry.jpg", "Mission equipment, precision interfaces and traceable component programs"],
  ["Consumer Electronics", "consumer-electronics", /consumer|electronic|telecom|communication|RF connector/i, "/assets/connector-machining.jpg", "Electronic devices, connectors and compact mechanical assemblies"],
  ["Robotics", "robotics", /robot|automation/i, "/wp-content/uploads/2026/09/robotics.jpg", "Robot joints, actuators and mechanical assemblies"],
  ["eVTOL", "evtol", /evtol|urban air|electric aircraft/i, "/wp-content/uploads/2026/09/evtol.jpg", "Electric aircraft structures, actuation and connection systems"],
  ["Railway", "railway", /railway|railroad|rolling stock/i, "/assets/railway-industry.jpg", "Rail equipment and durable mechanical assemblies"],
  ["Satellites", "satellites", /satellite/i, "/wp-content/uploads/2026/09/satellite.jpg", "Satellite structures, housings and precision interfaces"],
  ["Servers", "server", /server|data cent/i, "/wp-content/uploads/2026/09/server.jpg", "Server hardware, cooling systems and connection assemblies"],
];
const profiles = [
  [/needle|dental|medical-instrument/, { family: "medical", features: "tip geometry, working surfaces and assembly interfaces", service: "cleanliness and functional performance", types: ["Instrument Components", "Precision Tips & Interfaces", "Custom Assembly Parts"], materials: ["Stainless Steel", "Titanium", "Engineering Plastics"] }],
  [/cooling|heat-sink|thermal/, { family: "thermal", features: "flow channels, sealing lands and mounting flatness", service: "thermal and sealing performance", types: ["Cooling Interfaces", "Channel & Port Components", "Mounting Plates"], materials: ["Aluminum Alloys", "Copper Alloys", "Stainless Steel"] }],
  [/pin|contact|terminal|connector|probe/, { family: "contacts", features: "contact geometry, mating diameters and plating allowance", service: "contact performance and assembly fit", types: ["Precision Contact Components", "Mating Interfaces", "Custom Turned Contacts"], materials: ["Brass", "Copper Alloys", "Stainless Steel"] }],
  [/bushing|bearing|sleeve/, { family: "bushings", features: "bore size, outside diameter and mating fits", service: "fit, wear and operating environment", types: ["Precision Bushings", "Flanged & Stepped Sleeves", "Custom Bearing Interfaces"], materials: ["Bronze", "Stainless Steel", "Aluminum Alloys"] }],
  [/shaft|gear|spline|rotor/, { family: "shafts", features: "journal diameters, runout and drive interfaces", service: "alignment and load requirements", types: ["Stepped Shaft Components", "Drive Interfaces", "Custom Precision Profiles"], materials: ["Alloy Steel", "Stainless Steel", "Aluminum Alloys"] }],
  [/fitting|flange|nipple|coupling|adapter|valve|nozzle/, { family: "fluid", features: "threads, bores and sealing surfaces", service: "media compatibility and sealing requirements", types: ["Threaded Connections", "Bore & Sealing Interfaces", "Custom Connection Parts"], materials: ["Stainless Steel", "Brass", "Aluminum Alloys"] }],
  [/housing|enclosure|chassis|chamber|case/, { family: "housings", features: "mounting faces, pockets and wall thickness", service: "assembly, weight and environmental requirements", types: ["Machined Housings", "Covers & Mounting Interfaces", "Custom Enclosures"], materials: ["Aluminum Alloys", "Stainless Steel", "Engineering Plastics"] }],
  [/robot|arm|bracket|structure|5-axis|satellite|evtol/, { family: "structures", features: "assembly datums, angled features and thin-wall geometry", service: "structural and assembly requirements", types: ["Structural Brackets", "Multi-Face Components", "Custom Mounting Parts"], materials: ["Aluminum Alloys", "Titanium", "Stainless Steel"] }],
];
const generalProfile = { family: "precision", features: "critical dimensions, datums and mating features", service: "function, fit and service conditions", types: ["Precision Turned Parts", "Milled & Multi-Face Parts", "Custom Drawing Components"], materials: ["Aluminum Alloys", "Stainless Steel", "Brass"] };
function featureSummary(title, profile) {
  if (/tool|insert|PCD|CBN|cutting/i.test(title)) return "Review tool access, burr control and the required surface condition for the specified material.";
  if (/datum|guide bushing|setup|concentric|runout/i.test(title)) return "Plan support and setup around critical diameters, datums and mating interfaces.";
  if (/material|alloy|grade|treatment/i.test(title)) return "Confirm material grade, delivery condition, finishing requirements and supporting records.";
  if (/inspect|CMM|verification|quality|standard|compliance/i.test(title)) return "Agree critical-feature checks, measuring methods and inspection records with your drawing.";
  if (/cost|quote|economic|volume/i.test(title)) return "Review geometry, batch quantity and process requirements to prepare the quotation.";
  return `Review ${profile.features} and functional requirements before defining the process.`;
}
function materialText(title) {
  if (/brass|C360|CW60|H59|H62/i.test(title)) return "Brass options for precision turned threads and small components. Confirm the alloy, lead-content requirements and any plating allowance.";
  if (/bronze|C510|C932|C954/i.test(title)) return "Bronze options for bearing and sliding components. Confirm the exact grade, mating fit, lubrication and operating conditions.";
  if (/copper|beryllium|C172|C145|C181/i.test(title)) return "Copper-alloy options for electrical or thermal interfaces. Confirm the grade, condition, contact geometry and finish requirements.";
  if (/stainless|\b(?:303|304|316|17-4|440)\b/i.test(title)) return "Stainless steel options for corrosion-resistant components. Confirm the grade, delivery condition, surface finish and cleaning requirements.";
  if (/alumin|6061|7075|2024|6082/i.test(title)) return "Aluminum options for lightweight machined components. Confirm the alloy, temper, finishing allowance and critical assembly dimensions.";
  if (/titan|Ti-6|TC4|Grade [25]/i.test(title)) return "Titanium options for weight-sensitive and corrosion-resistant components. Confirm the approved grade, material condition and surface requirements.";
  if (/PEEK|POM|PTFE|nylon|plastic|polymer|Delrin/i.test(title)) return "Engineering-plastic options for insulating or low-friction components. Confirm the resin grade, conditioning and operating environment.";
  return "Confirm the exact material grade, condition, heat-treatment requirements and certificates against the approved drawing.";
}
function materialGroup(title) {
  if (/PEEK|POM|PTFE|nylon|plastic|polymer|Delrin/i.test(title)) return "plastics";
  if (/titan|inconel|nickel|kovar|invar/i.test(title)) return "special-alloys";
  return "metals";
}
function finishType(title) {
  if (/passivat|pickl/i.test(title)) return { category: "Corrosion control", use: "Stainless steel surface requirements", specify: "Method, masking & inspection records", icon: "shield", tone: "blue" };
  if (/electropolish|polish|lapping/i.test(title)) return { category: "Surface finish", use: "Functional or hygienic surfaces", specify: "Required Ra, geometry & allowance", icon: "spark", tone: "teal" };
  if (/gold|silver|tin plat|nickel plat/i.test(title)) return { category: "Plating selection", use: "Contact, appearance or barrier requirements", specify: "Coating stack, thickness & masking", icon: "layers", tone: "teal" };
  if (/anodiz|color|PVD/i.test(title)) return { category: "Appearance & protection", use: "Specified material and service conditions", specify: "Process, color sample & thickness", icon: "color", tone: "color" };
  if (/heat|harden|nitrid/i.test(title)) return { category: "Material condition", use: "Specified hardness and wear requirements", specify: "Material, hardness & distortion allowance", icon: "layers", tone: "ink" };
  if (/clean|debur|edge/i.test(title)) return { category: "Clean edges & surfaces", use: "Assembly and handling requirements", specify: "Edge condition, cleanliness & packaging", icon: "spark", tone: "blue" };
  return { category: "Finish selection", use: "Drawing-specific surface requirements", specify: "Process, functional surfaces & acceptance", icon: "layers", tone: "blue" };
}
function schematic(slug, title, kind, index) {
  const folder = path.join(publicDir, "assets", "product-illustrations", slug);
  fs.mkdirSync(folder, { recursive: true });
  const label = title.replace(/[<>&"]/g, "").slice(0, 58);
  let shapes = kind === "structures" || kind === "housings"
    ? '<path d="M95 205V94l120-35 130 55v112l-125 36Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><path d="m95 94 125 54 125-34M220 148v114" fill="none" stroke="#6f879d" stroke-width="3"/><path d="m135 120 55 24v59l-55-24Z" fill="#eef5fb" stroke="#7793ac" stroke-width="3"/><ellipse cx="270" cy="149" rx="18" ry="12" fill="#667f94"/><ellipse cx="299" cy="205" rx="18" ry="12" fill="#667f94"/>'
    : '<path d="M80 126 300 92l75 42-220 41Z" fill="#dbe7f1" stroke="#6f879d" stroke-width="3"/><path d="M80 126v70l75 44v-65m0 65 220-34v-72" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><circle cx="198" cy="162" r="19" fill="#f8fbfe" stroke="#6f879d" stroke-width="3"/><path d="M105 268h245m-245-8v16m245-16v16" stroke="#126f9e" stroke-width="2"/>';
  if ((kind === "structures" || kind === "housings") && index === 1 && /bracket|frame/i.test(title)) shapes = '<path d="M130 60h55v135h185v55H130Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><path d="m130 60 18-12h55v135h185v55l-18 12V195H185V60Z" fill="#b4c8d9" stroke="#6f879d" stroke-width="2"/><g fill="#f7fafc" stroke="#6f879d" stroke-width="3"><circle cx="157" cy="102" r="12"/><circle cx="157" cy="155" r="12"/><circle cx="244" cy="222" r="12"/><circle cx="329" cy="222" r="12"/></g>';
  if ((kind === "structures" || kind === "housings") && index === 2) shapes = '<path d="m80 128 230-50 92 67-230 56Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><path d="m80 128 92 73v30l-92-73Zm92 73 230-56v30l-230 56Z" fill="#a5bdcf" stroke="#6f879d" stroke-width="3"/><path d="m143 131 156-34 46 35-157 37Z" fill="#f7fafc" stroke="#6f879d" stroke-width="3"/><path d="m216 113 45 35m-93-1 155-35" stroke="#6f879d" stroke-width="10"/>';
  if ((kind === "structures" || kind === "housings") && index === 3) shapes = '<path d="m80 135 220-55 105 70-220 60Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><path d="m80 135 105 75v24L80 159Zm105 75 220-60v24l-220 60Z" fill="#a5bdcf" stroke="#6f879d" stroke-width="3"/><g fill="#718da3"><ellipse cx="140" cy="135" rx="12" ry="7"/><ellipse cx="296" cy="105" rx="12" ry="7"/><ellipse cx="199" cy="185" rx="12" ry="7"/><ellipse cx="351" cy="148" rx="12" ry="7"/></g><ellipse cx="242" cy="145" rx="40" ry="23" fill="#f7fafc" stroke="#6f879d" stroke-width="3"/>';
  if (kind === "fluid" && /elbow/i.test(title)) shapes = '<path d="M150 72h60v87q0 32 36 32h105v60H240q-90 0-90-92Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><ellipse cx="180" cy="72" rx="30" ry="13" fill="#91aabd" stroke="#6f879d" stroke-width="3"/><ellipse cx="180" cy="72" rx="20" ry="7" fill="#f7fafc"/><ellipse cx="351" cy="221" rx="13" ry="30" fill="#91aabd" stroke="#6f879d" stroke-width="3"/><ellipse cx="351" cy="221" rx="7" ry="20" fill="#f7fafc"/><path d="M150 93h60m-60 13h60m-60 13h60m92 72v60m13-60v60m13-60v60" stroke="#7793a8" stroke-width="2"/>';
  if (kind === "fluid" && /tee|cross/i.test(title)) shapes = '<path d="M80 163h125V74h70v89h125v70H80Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><ellipse cx="80" cy="198" rx="15" ry="35" fill="#91aabd" stroke="#6f879d" stroke-width="3"/><ellipse cx="80" cy="198" rx="8" ry="24" fill="#f7fafc"/><ellipse cx="400" cy="198" rx="15" ry="35" fill="#91aabd" stroke="#6f879d" stroke-width="3"/><ellipse cx="400" cy="198" rx="8" ry="24" fill="#f7fafc"/><ellipse cx="240" cy="74" rx="35" ry="14" fill="#91aabd" stroke="#6f879d" stroke-width="3"/><ellipse cx="240" cy="74" rx="24" ry="8" fill="#f7fafc"/><path d="M108 163v70m13-70v70m13-70v70m212-70v70m13-70v70m13-70v70M205 99h70m-70 13h70m-70 13h70" stroke="#7793a8" stroke-width="2"/>';
  if (kind === "fluid" && /plug|cap/i.test(title)) shapes = '<path d="M105 127h162l55 31v72H105Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><ellipse cx="105" cy="179" rx="25" ry="52" fill="#b8ccdc" stroke="#6f879d" stroke-width="3"/><path d="m267 106 68 9 35 52-20 68-68 12-46-51v-57Z" fill="url(#metal)" stroke="#6f879d" stroke-width="3"/><path d="m267 106 28 58 75 3m-75-3-13 83m-46-51 59-32" fill="none" stroke="#6f879d" stroke-width="2"/><path d="M132 127v103m15-103v103m15-103v103m15-103v103m15-103v103m15-103v103" stroke="#7793a8" stroke-width="3"/>';
  fs.writeFileSync(path.join(folder, `concept-${index}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="340" viewBox="0 0 480 340" role="img" aria-labelledby="title"><title id="title">${label} — design illustration</title><defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#c8d8e7"/><stop offset=".5" stop-color="#f1f6fa"/><stop offset="1" stop-color="#9db4c7"/></linearGradient></defs><rect width="480" height="340" fill="#f7fafc"/>${shapes}</svg>`);
  return `/assets/product-illustrations/${slug}/concept-${index}.svg`;
}
const reports = [];
const output = {};
for (const page of nativeParts) {
  if (page.slug === aluminumMillingConnectorSlug) {
    const content = aluminumMillingConnectorContent;
    output[page.slug] = content;
    reports.push({ slug: page.slug, source: "curated", portfolio: content.portfolio.length, applications: content.applications.length, materials: content.materials.length, finishes: content.finishes.length, faqs: content.faqs.length, illustrations: 0 });
    continue;
  }
  if (page.slug === aluminumFlangeSlug) {
    output[page.slug] = aluminumFlangeContent;
    reports.push({ slug: page.slug, source: "curated", portfolio: aluminumFlangeContent.portfolio.length, applications: aluminumFlangeContent.applications.length, materials: aluminumFlangeContent.materials.length, finishes: aluminumFlangeContent.finishes.length, faqs: aluminumFlangeContent.faqs.length, illustrations: 0 });
    continue;
  }
  if (page.slug === "stainless-steel-machining-semiconductor-parts") {
    output[page.slug] = stainlessSemiconductorContent;
    reports.push({ slug: page.slug, source: "curated", portfolio: stainlessSemiconductorContent.portfolio.length, applications: stainlessSemiconductorContent.applications.length, materials: stainlessSemiconductorContent.materials.length, finishes: stainlessSemiconductorContent.finishes.length, faqs: stainlessSemiconductorContent.faqs.length, illustrations: 0, sourceCounts: { benefits: stainlessSemiconductorContent.benefits.length, portfolio: stainlessSemiconductorContent.portfolio.length, applications: stainlessSemiconductorContent.applications.length } });
    continue;
  }
  if (page.slug === "semiconductor-vacuum-chamber") {
    output[page.slug] = semiconductorVacuumChamberContent;
    reports.push({ slug: page.slug, source: "curated", portfolio: semiconductorVacuumChamberContent.portfolio.length, applications: semiconductorVacuumChamberContent.applications.length, materials: semiconductorVacuumChamberContent.materials.length, finishes: semiconductorVacuumChamberContent.finishes.length, faqs: semiconductorVacuumChamberContent.faqs.length, illustrations: 0, sourceCounts: { benefits: semiconductorVacuumChamberContent.benefits.length, portfolio: semiconductorVacuumChamberContent.portfolio.length, applications: semiconductorVacuumChamberContent.applications.length } });
    continue;
  }
  if (page.slug === "stainless-steel-cnc-turning-flanges") continue;
  const liveFile = liveDir && path.join(liveDir, `${page.slug}.html`);
  const mirror = path.join(root, "src", "mirrored-pages", "custom-cnc-parts", page.slug, "index.html");
  let html = fs.readFileSync(liveFile && fs.existsSync(liveFile) ? liveFile : mirror, "utf8");
  let ast = parse(html);
  let main = first(ast, "main") || ast;
  if (!first(main, "h1")) { html = fs.readFileSync(mirror, "utf8"); ast = parse(html); main = first(ast, "main") || ast; }
  const sourceCards = (names) => unique(names.flatMap((cls) => byClass(main, cls)).map((n) => ({ title: titleOf(n), text: plain(first(n, "p")), image: imageOf(n), tag: plain(byClass(n, "mat-card-tag")[0]) })).filter((x) => x.title), (x) => x.title);
  const profile = profiles.find(([re]) => re.test(page.slug))?.[1] || generalProfile;
  const title = page.slug === "cnc-machining-for-aerospace-brackets" ? "CNC Machining For Aerospace Brackets" : page.slug === "aerospace-connector-pins" ? "Custom Aerospace Connector Pins" : page.slug === "electric-motor-stator-housing-machining" ? "Electric Motor Stator Housing Machining" : page.slug === "humanoid-robot-arm-components" ? "Humanoid Robot Arm Components" : page.slug === "5-axis-sensor-housing-machining" ? "Sensor Housing 5-Axis Machining Part" : page.slug === "ev-battery-connectors" ? "EV Battery Connector" : page.slug === "ev-charger-manufacturing" ? "EV Charger Machining" : page.slug === "chassis" ? "CNC Machined Chassis" : page.slug === "aluminum-swiss-screw-machined-parts" ? "Aluminum Swiss Screw Machined Parts" : page.slug === "electrical-connectors" ? "Electrical Connector" : heading(plain(first(main, "h1")).replace(/\b(?:China|Manufacturer|Manufacturers|Supplier|Factory)\b/gi, "").replace(/\s*\|.*$/, "").trim(), page.title);
  const label = page.slug === "aerospace-connector-pins" ? title : title.replace(/^(?:Custom\s+)?Precision\s+/i, "").replace(/^Custom\s+/i, "").replace(/\s+Manufactured by Swiss Screw Machining/i, "");
  const pictures = unique([localImage(page.image), ...page.gallery.map((x) => localImage(x.image)), ...find(main, (x) => x.name === "img").map(imageOf)].filter(Boolean));
  const overviewNode = byClass(main, "overview-body")[0];
  const overview = find(overviewNode || {}, (n) => n.name === "p").map(plain).map((p) => summary(p, "", 54)).filter(Boolean).slice(0, 2);
  const overviewFallback = `Custom ${label.toLowerCase()} are reviewed around ${profile.features}. The machining route, material, finishing and inspection plan follow the approved drawing and intended application.`;
  if (!overview.length) overview.push(overviewFallback);
  const overviewImage = imageOf(byClass(main, "overview-photo-main")[0] || {}) || pictures[1] || pictures[0];
  const sourceBenefits = sourceCards(["why-card", "sp-why-card"]).filter((c) => !badClaim.test(c.title));
  const benefitFallbacks = [
    { title: "Functional Geometry Review", text: `Review ${profile.features} before choosing the machining and inspection route.` },
    { title: "Material & Condition", text: `Match the specified material and delivery condition to ${profile.service}.` },
    { title: "Machining & Datum Control", text: "Coordinate turning, milling and secondary operations around the drawing datums and functional interfaces." },
    { title: "Finishing Allowance", text: "Account for coating, polishing or heat-treatment effects on mating features and critical dimensions." },
    { title: "Inspection Planning", text: "Agree critical-feature checks, measuring methods and the reports required for your order." },
    { title: "Prototype to Production", text: "Review first-piece approval, batch quantity, packaging and repeat-order requirements with the quotation." },
  ];
  const benefits = sourceBenefits.slice(0, 6).map((c, i) => { const title = heading(c.title, benefitFallbacks[i].title); return { title, text: summary(c.text, featureSummary(title, profile), 36) }; });
  for (const c of benefitFallbacks) { if (benefits.length >= 6) break; if (!benefits.some((x) => x.title === c.title)) benefits.push(c); }
  const productSources = sourceCards(["part-card", "portfolio-card", "product-card", "sp-pin-card"]);
  const portfolio = productSources.slice(0, 6).map((c, i) => ({ title: heading(c.title, `${label} Configuration ${i + 1}`), image: c.image, text: summary(c.text, `${heading(c.title, label)} machined to your drawing. Confirm material, functional dimensions and finish before production.`, 42), illustration: false }));
  const suppliedTypes = {
    "5-axis-cnc-machining-for-aluminum-structures": ["Lightweight Frames & Brackets", "Ribbed & Pocketed Structures", "Mounting Plates & Interfaces"],
    "5-axis-cnc-machining-robotic-joints": ["Robot Joint Housings", "Bearing Seats & Mounting Interfaces", "Joint Covers & End Caps"],
    "cnc-turning-and-milling-parts": ["Turned Parts with Milled Features", "Threaded & Bored Components", "Multi-Face Precision Parts"],
  };
  if (!portfolio.length) for (const name of suppliedTypes[page.slug] || profile.types) portfolio.push({ title: name, image: "", text: `Custom ${name.toLowerCase()} with ${profile.features} reviewed against your drawing.`, illustration: true });
  for (const [index, card] of portfolio.entries()) {
    if (!card.image) { card.image = schematic(page.slug, card.title, profile.family, index + 1); card.illustration = true; }
  }
  // These original elbow, tee and plug photos depict straight or open fittings.
  // Use labeled concepts until matching product photographs are available.
  if (page.slug === "brass-pipe-fittings") for (const index of [0, 1, 4]) {
    if (!portfolio[index]) continue;
    if (index === 0) portfolio[index].title = "Elbow Pipe Fittings";
    portfolio[index].image = schematic(page.slug, portfolio[index].title, "fluid", index + 1);
    portfolio[index].illustration = true;
    portfolio[index].text = `${portfolio[index].title} machined to your drawing. Confirm thread form, connection sizes, material and sealing requirements.`;
  }
  const sourceApplications = sourceCards(["industry-card", "application-card", "sp-industry-card"]);
  const applications = [];
  const pageIndustry = industryDefs.find((d) => d[2].test(`${page.slug} ${label}`));
  for (const card of sourceApplications) {
    const isAerospaceLaunchApplication = page.slug === "aerospace-fittings" && /^Space Launch Vehicles$/i.test(card.title.trim());
    // Launch vehicles belong to aerospace, despite the generic vehicle keyword.
    const def = isAerospaceLaunchApplication ? industryDefs.find((d) => d[1] === "aerospace") : industryDefs.find((d) => d[2].test(card.title)) || pageIndustry;
    if (!def || applications.some((a) => a.title === heading(card.title, def[0]))) continue;
    const applicationSummary = `${label} for ${def[4].toLowerCase()}, with material and inspection requirements confirmed for the application.`;
    applications.push({ title: heading(card.title, def[0]), industry: def[0], href: `/industries/${def[1]}`, image: card.image || localImage(def[3]) || pictures[0], text: isAerospaceLaunchApplication ? "Aerospace fittings for rocket propellant loading systems, hydraulic actuators and ground support equipment." : def[2].test(card.text) ? summary(card.text, applicationSummary, 35) : applicationSummary });
  }
  if (applications.length < 2) {
    const matches = industryDefs.filter((d) => d[2].test(`${page.slug} ${page.description} ${sourceApplications.map((c) => c.text).join(" ")}`));
    for (const def of matches) {
      if (applications.length >= 4) break;
      if (applications.some((a) => a.href === `/industries/${def[1]}`)) continue;
      applications.push({ title: def[0], href: `/industries/${def[1]}`, image: localImage(def[3]) || pictures[0], text: `${label} for ${def[4].toLowerCase()}. Confirm the drawing, material and documentation required for your application.` });
    }
  }
  if (!applications.length) for (const def of industryDefs.filter((d) => ["aerospace", "automotive", "medical", "semiconductor"].includes(d[1]))) applications.push({ title: def[0], href: `/industries/${def[1]}`, image: localImage(def[3]) || pictures[0], text: `Drawing-based ${label.toLowerCase()} for ${def[4].toLowerCase()}. Confirm the material and inspection scope for your application.` });
  if (page.slug === "cnc-custom-aluminum-shift-knob") {
    const automotiveApplication = applications.find((card) => card.href === "/industries/automotive");
    if (automotiveApplication) Object.assign(automotiveApplication, {
      title: "Automotive Interiors & Aftermarket",
      image: "/wp-content/uploads/2026/09/shift-knob-design-product-development.jpg",
      imageAlt: "Custom shift knob installed in a car interior",
      text: "Custom aluminum shift knobs for automotive interiors and aftermarket upgrades, with drawing-defined threads, grip profiles, anodized colors and custom markings.",
    });
  }
  const materials = sourceCards(["mat-card", "material-card", "sp-mat-card"]).slice(0, 8).map((c) => ({ title: heading(c.title, "Drawing-Specified Material"), text: summary(c.text, materialText(c.title), 38), tag: heading(c.tag, "Confirm grade & condition"), category: materialGroup(c.title) }));
  if (!materials.length) for (const name of profile.materials) materials.push({ title: name, text: materialText(name), tag: "Review with your drawing", category: materialGroup(name) });
  const materialNames = materials.map((m) => m.title).slice(0, 3).join(", ");
  const finishes = unique(sourceCards(["fin-card", "surface-card", "finish-card"]).filter((c) => !/quote|quality system/i.test(c.title)).slice(0, 6).map((c) => {
    const titleParts = decode(c.title).split(/\s+[—–]\s+/);
    const sourceTitle = /^(?:Ra|Rz|HV|[±≤≥\d])/i.test(titleParts[0]) && titleParts[1] ? titleParts.slice(1).join(" — ") : c.title;
    const rawTitle = heading(sourceTitle, "Drawing-Specified Finish");
    const finishTitle = /^(?:Ra|Rz|HV|[±≤≥\d])/i.test(rawTitle) ? "Precision Surface Finishing" : rawTitle;
    return { title: finishTitle, ...finishType(finishTitle), summary: summary(c.text, `Review ${finishTitle.toLowerCase()} against the material, functional surfaces and intended service conditions.`, 32) };
  }), (c) => c.title);
  if (!finishes.length) for (const name of ["Deburring & Edge Control", "Surface Finish to Drawing", "Cleaning & Protective Packaging"]) finishes.push({ title: name, ...finishType(name), summary: "Confirm the required surface condition and acceptance criteria during drawing review." });
  const hero = imageOf(byClass(main, "hero-image-wrap")[0] || {}) || pictures[0] || schematic(page.slug, label, profile.family, 0);
  const heroSource = plain(byClass(main, "hero-sub")[0]);
  const heroDescription = summary(heroSource, `Custom ${label} made to your drawing. Review ${profile.features}, material, finishing and inspection requirements before production.`, 49);
  const points = unique(byClass(main, "op-list").flatMap((n) => find(n, (x) => x.name === "li")).map((n, i) => { const title = heading(plain(first(n, "strong")), benefitFallbacks[i % 6].title); return { title, text: summary(plain(first(n, "span")), featureSummary(title, profile), 26) }; }), (x) => x.title).slice(0, 4);
  if (!points.length) points.push(...benefitFallbacks.slice(0, 4));
  const controls = [
    { title: "Material Verification", check: "Specified grade, material condition and lot identity.", verify: "Material certificates and agreed identification checks.", record: "Material certificates and required traceability records." },
    { title: "Machining Process Control", check: `${profile.features[0].toUpperCase()}${profile.features.slice(1)}.`, verify: "Drawing datums, setup planning and in-process inspection.", record: "Agreed critical-feature and process inspection records." },
    { title: "Dimensional Inspection", check: "Functional dimensions, mating features and surface condition.", verify: "Suitable measuring equipment and drawing-specific gauges.", record: "Dimensional reports and specified finish results." },
    { title: "Production Documentation", check: "First-piece approval, production records and delivery requirements.", verify: "The inspection plan and customer approval process.", record: "Agreed document pack, including PPAP or FAIR when required." },
  ];
  const process = /wire-edm/.test(page.slug) ? ["Wire EDM", "Profile machining", "CNC", "Complementary machining"] : /5-axis|structure|housing|enclosure|chassis/.test(page.slug) ? ["5-axis", "Multi-face machining", "CNC", "Prototype & batch machining"] : /pin|contact|terminal|probe|swiss|needle/.test(page.slug) ? ["Swiss CNC", "Precision turned components", "Mill-turn", "Combined machining"] : ["Mill-turn", "Combined turning & milling", "CNC", "Prototype & batch machining"];
  const faqs = [
    { question: `Which ${label} designs can you manufacture?`, answer: `The product range includes ${portfolio.slice(0, 3).map((c) => c.title).join(", ")}. Custom geometry is reviewed against the approved drawing.`, points: ["Include the mating interfaces, critical datums and expected order quantity."] },
    { question: "Which materials can I specify?", answer: `Material options include ${materialNames}. The exact grade and condition should be confirmed for your application.`, points: ["Include material certificate, finish and any restricted-substance requirements with your enquiry."] },
    { question: "What should I include in the drawing?", answer: `Define ${profile.features}, together with datums, tolerances and required surface condition.`, points: ["Include a 2D drawing and 3D model where available.", "Identify the dimensions that affect assembly or function."] },
    { question: "What finishing and inspection records can be requested?", answer: `Finishing options include ${finishes.slice(0, 3).map((f) => f.title.toLowerCase()).join(", ")}. Applicability is reviewed against the specified material and geometry.`, points: ["Agree material certificates, dimensional reports and any PPAP or FAIR requirements with the order."] },
    { question: "How are pricing and lead time confirmed?", answer: "Pricing and delivery are confirmed after reviewing the drawing, material availability, quantity, machining route, finishing and inspection scope.", points: ["Prototype and repeat-production schedules are quoted for the specific order."] },
  ];
  const sourceFaqs = byClass(main, "faq-row").map((n) => ({ question: plain(first(n, "button")).replace(/[⌄^v]\s*$/, "").trim(), answer: plain(byClass(n, "faq-answer")[0]) }));
  const conciseOriginals = sourceFaqs.map((f) => ({ question: f.question, answer: summary(f.answer, "", 55) })).filter((f) => f.question && f.answer && !badClaim.test(f.question) && /what information|how should|which.*(?:material|alloy)|can you machine/i.test(f.question) && !/price|cost|certif/i.test(f.question)).slice(0, 2);
  const finalFaqs = faqs.map((faq, index) => index === 1 ? conciseOriginals.find((item) => /which.*(?:material|alloy)/i.test(item.question)) || faq : index === 2 ? conciseOriginals.find((item) => /what information|how should/i.test(item.question)) || faq : faq);
  const applicationOverride = productApplicationOverrides[page.slug];
  if (applicationOverride) applications.splice(0, applications.length, ...applicationOverride);
  output[page.slug] = { title, label, hero, heroDescription, overview, overviewImage: overviewImage || hero, overviewPoints: points, benefits, portfolio, applications: applications.slice(0, 6), materials, finishes, controls, stats: [[process[0], process[1]], ["To drawing", "Critical dimensions"], ["As agreed", "Inspection scope"], [process[2], process[3]]], faqs: finalFaqs, sourceUrl: `https://www.cncpioneer.com/custom-cnc-parts/${page.slug}` };
  if (page.slug === "aluminum-bronze-bushing") output[page.slug].h1 = "Custom Aluminum Bronze Bushing";
  if (page.slug === "robot-actuator-housings") {
    output[page.slug].materialLinks = [
      { label: "Aluminum CNC Machining", href: "/materials/aluminum-cnc-machining" },
      { label: "6061-T6 Aluminum CNC Machining", href: "/materials/6061-t6-aluminum-cnc-machining" },
      { label: "Magnesium CNC Machining", href: "/materials/magnesium-cnc-machining" },
      { label: "Stainless Steel CNC Machining", href: "/materials/stainless-steel-cnc-machining" },
      { label: "Titanium CNC Machining", href: "/materials/titanium-cnc-machining" },
    ];
  }
  if (page.slug === "aluminium-alloy-cnc-turning-bushing") {
    output[page.slug].materialLinks = [
      { label: "Aluminum CNC Machining", href: "/materials/aluminum-cnc-machining" },
      { label: "6061-T6 Aluminum CNC Machining", href: "/materials/6061-t6-aluminum-cnc-machining" },
    ];
  }
  if (page.slug === "aerospace-fasteners") Object.assign(output[page.slug], { title: "Aerospace Fastener", label: "Aerospace Fastener", h1: "Custom Aerospace Fastener" });
  if (page.slug === "brass-threaded-bushings") output[page.slug].h1 = "Custom Brass Threaded Bushings";
  if (page.slug === "bronze-bushings") output[page.slug].h1 = "Custom Bronze Bushings";
  if (page.slug === "chassis") {
    output[page.slug].h1 = "Custom CNC Machined Chassis";
    output[page.slug].hero = "/assets/generated/chassis-cnc-mill-turn-v1.webp";
    output[page.slug].heroAlt = "CNC mill-turn center machining an aluminum workpiece with a horizontal chuck and live milling spindle";
  }
  if (page.slug === "electrical-connectors") output[page.slug].h1 = "Custom Electrical Connectors";
  if (page.slug === "pogo-contact-pins") output[page.slug].h1 = "Custom Pogo Contact Pins";
  if (page.slug === "brass-contact-pins") {
    output[page.slug].materialLinks = [
      { label: "Brass CNC Machining", href: "/materials/brass-cnc-machining" },
      { label: "Bronze CNC Machining", href: "/materials/bronze-cnc-machining" },
      { label: "Copper CNC Machining", href: "/materials/copper-cnc-machining" },
    ];
    const platedContacts = output[page.slug].materials.find(card => /plated brass contact pins/i.test(card.title));
    if (platedContacts) platedContacts.href = "#surface-treatments";
  }
  if (page.slug === "cnc-turning-titanium-nuts") output[page.slug].h1 = "CNC Turning Titanium Nut";
  if (page.slug === "brass-pipe-fittings") {
    output[page.slug].materialLinks = [
      { label: "Brass CNC Machining", href: "/materials/brass-cnc-machining" },
      { label: "Stainless Steel CNC Machining", href: "/materials/stainless-steel-cnc-machining" },
      { label: "Alloy Steel CNC Machining", href: "/materials/alloy-steel-cnc-machining" },
      { label: "Aluminum CNC Machining", href: "/materials/aluminum-cnc-machining" },
    ];
  }
  if (page.slug === "stainless-steel-precision-turning-shaft") {
    output[page.slug].materialLinks = [
      { label: "Stainless Steel CNC Turning and Milling", href: "/materials/stainless-steel-cnc-turning-and-milling" },
      { label: "Stainless Steel CNC Machining", href: "/materials/stainless-steel-cnc-machining" },
    ];
    const electropolish = output[page.slug].materials.find(card => card.title === "Electropolish");
    if (electropolish) electropolish.href = "#surface-treatments";
  }
  if (page.slug === "titanium-swiss-screw-machined-parts") {
    output[page.slug].materialLinks = [
      { label: "Titanium Swiss Machining", href: "/materials/titanium-swiss-machining" },
      { label: "Titanium CNC Machining", href: "/materials/titanium-cnc-machining" },
    ];
  }
  if (page.slug === "liquid-cooling-plate") {
    output[page.slug].materialLinks = [
      { label: "Aluminum CNC Machining", href: "/materials/aluminum-cnc-machining" },
      { label: "Copper CNC Machining", href: "/materials/copper-cnc-machining" },
      { label: "Stainless Steel CNC Machining", href: "/materials/stainless-steel-cnc-machining" },
    ];
  }
  if (page.slug === "threaded-bushing") Object.assign(output[page.slug], {
    title: "Custom Threaded Bushing",
    label: "Custom Threaded Bushing",
    h1: "Custom Threaded Bushing",
    overviewTitle: "Threaded Bushing Overview",
    benefitsTitle: "Why Choose CNCPioneer?",
    portfolioTitle: "Threaded Bushings We Manufacture",
    materialsTitle: "Materials for Threaded Bushings",
    finishesTitle: "Surface Treatments for Threaded Bushings",
    qualityTitle: "Quality Control for Threaded Bushings",
    faqTitle: "Threaded Bushing FAQ",
    ctaTitle: "Get a Quote for Custom Threaded Bushings",
  });
  if (page.slug === "swiss-machined-parts") Object.assign(output[page.slug], { title: "Swiss Machined Parts", label: "Swiss Machined Parts", h1: "Swiss Machined Parts" });
  if (page.slug === "stainless-steel-cnc-turning-parts") {
    Object.assign(output[page.slug], { title: "Stainless Steel CNC Turning Parts", h1: "Stainless Steel CNC Turning Parts", label: "Stainless Steel CNC Turning Parts" });
    output[page.slug].applicationsIntro = "Stainless steel turned components for automotive, aerospace, medical, oil and gas, robotics and semiconductor equipment. Match the material, sealing features, mating fits and inspection requirements to each application.";
  }

  if (page.slug === "cnc-machining-for-aerospace-brackets") {
    Object.assign(output[page.slug], aerospaceBracketsContent);
  }
  if (page.slug === "electric-motor-stator-housing-machining") {
    Object.assign(output[page.slug], motorStatorHousingContent);
  }
  if (page.slug === "custom-electrical-contacts") {
    output[page.slug].h1 = "Custom Electrical Contacts";
    applyElectricalContactMaterialContent(output[page.slug]);
  }
  if (page.slug === "ev-battery-connectors") output[page.slug].h1 = "Custom EV Battery Connector";
  if (page.slug === "humanoid-robot-arm-components") output[page.slug].h1 = "Custom Humanoid Robot Arm Components";
  if (page.slug === "humanoid-robot-hand-finger-parts") output[page.slug].h1 = "Custom Humanoid Robot Hand Finger Parts";
  if (page.slug === "humanoid-robot-leg-components") output[page.slug].h1 = "Custom Humanoid Robot Leg Components";
  if (page.slug === "hydraulic-cylinder-components-machining") {
    output[page.slug].h1 = "Hydraulic Cylinder Components Machining";
    output[page.slug].applicationsIntro = "Hydraulic cylinder components for automated production, energy equipment, aerospace systems and automotive manufacturing. Match the material, sealing surfaces and inspection scope to the application.";
  }
  if (page.slug === "humanoid-robot-joint-components") {
    output[page.slug].applications = output[page.slug].applications.map((card) => card.href === "/industries/medical"
      ? { ...card, href: null }
      : card);
  }
  if (page.slug === "5-axis-sensor-housing-machining") {
    output[page.slug].h1 = "Sensor Housing 5-Axis Machining Part";
    output[page.slug].heroDescription = "Sensor housing machining to your drawing. Review mounting faces, pockets, wall thickness, material, finishing and inspection requirements before production.";
    output[page.slug].applicationsIntro = "Sensor housings for flight control, motion feedback, vehicle monitoring and measurement equipment. Confirm the material, interfaces and inspection scope for your application.";
    output[page.slug].applications = [
      {
        "title": "eVTOL & Air Mobility",
        "industry": "eVTOL",
        "href": "/industries/evtol",
        "image": "/wp-content/uploads/2026/08/evtol-aircraft.jpg",
        "imageAlt": "Electric vertical takeoff aircraft",
        "text": "Machined IMU and flight-control sensor housings for electric aircraft, with drawing-defined mounting datums, connector interfaces and sealing features.",
        "linkLabel": "Explore eVTOL machining"
      },
      {
        "title": "Aerospace & Avionics",
        "industry": "Aerospace",
        "href": "/industries/aerospace",
        "image": "/wp-content/uploads/2026/09/avionics.jpg",
        "imageAlt": "Aircraft avionics installation during assembly",
        "text": "Sensor enclosures and instrument housings for aircraft avionics, with bore alignment, cable routing and material traceability specified for the assembly.",
        "linkLabel": "Explore aerospace machining"
      },
      {
        "title": "Robotics & Automation",
        "industry": "Robotics",
        "href": "/industries/robotics",
        "image": "/wp-content/uploads/2026/09/robotics.jpg",
        "imageAlt": "Industrial robot arms on an automated production line",
        "text": "Encoder housings and sensor mounts for robot joints and automated equipment, with concentric locating bores, mounting faces and cable exits.",
        "linkLabel": "Explore robotics machining"
      },
      {
        "title": "Automotive & EV Systems",
        "industry": "Automotive",
        "href": "/industries/automotive",
        "image": "/wp-content/uploads/2026/09/automotive-ev-vehicle.jpg",
        "imageAlt": "Technician inspecting an electric vehicle powertrain",
        "text": "Sensor housings for EV powertrains, battery systems and vehicle monitoring, with mounting geometry, connector fit and environmental sealing defined by the drawing.",
        "linkLabel": "Explore automotive machining"
      },
      {
        "title": "Medical & Diagnostic Equipment",
        "industry": "Medical",
        "href": "/industries/medical",
        "image": "/wp-content/uploads/2026/09/medical-device.jpg",
        "imageAlt": "Medical imaging and diagnostic equipment",
        "text": "Housings for diagnostic instruments and medical equipment sensors, with cleanable surfaces, assembly interfaces and material documentation reviewed for the intended use.",
        "linkLabel": "Explore medical machining"
      },
      {
        "title": "Semiconductor & Test Equipment",
        "industry": "Semiconductor",
        "href": "/industries/semiconductor",
        "image": "/wp-content/uploads/2026/09/semiconductor-equipment.jpg",
        "imageAlt": "Precision probe equipment inspecting a semiconductor wafer",
        "text": "Precision housings for measurement sensors and semiconductor inspection equipment, with mounting datums, optical or electrical interfaces and surface finish defined for assembly.",
        "linkLabel": "Explore semiconductor machining"
      }
    ];
  }
  if (page.slug === "ev-charger-manufacturing") output[page.slug].h1 = "EV Charger Machining";
  if (page.slug === "heat-sinks") output[page.slug].h1 = "cnc machined heat sink";
  if (page.slug === "aluminum-swiss-screw-machined-parts") {
    output[page.slug].h1 = "Aluminum Swiss Screw Machined Parts";
    output[page.slug].hero = "/assets/generated/aluminum-swiss-lathe-machining-v1.webp";
    output[page.slug].heroAlt = "Swiss-type CNC lathe machining an aluminum bar through a guide bushing";
    output[page.slug].overviewImage = "/assets/generated/aluminum-swiss-machined-products-white-v1.webp";
    output[page.slug].overviewImageAlt = "Swiss-machined aluminum shafts, bushings and threaded fittings on a white background";
    const portfolioImages = {
      "Aluminum Connector Pins & Terminal Contacts": "aluminum-connector-pins-white-v1",
      "Aluminum Precision Shafts & Pins": "aluminum-precision-shafts-white-v1",
      "Aluminum Valve Bodies & Fittings": "aluminum-valve-fittings-white-v1",
      "Aluminum Threaded Fittings & Fasteners": "aluminum-threaded-fasteners-white-v1",
      "Aluminum Medical & Surgical Components": "aluminum-medical-components-white-v1",
      "Aluminum Sensor Housings & Enclosures": "aluminum-sensor-housings-white-v1",
    };
    output[page.slug].portfolio = output[page.slug].portfolio.map((card) => portfolioImages[card.title]
      ? { ...card, image: `/assets/generated/${portfolioImages[card.title]}.webp`, illustration: false }
      : card);
  }
  if (page.slug === "battery-housings") output[page.slug].h1 = "Custom Battery Housing";
  reports.push({ slug: page.slug, source: liveFile && fs.existsSync(liveFile) ? "live" : "local-mirror", portfolio: portfolio.length, applications: applications.length, materials: materials.length, finishes: finishes.length, faqs: finalFaqs.length, illustrations: portfolio.filter((c) => c.illustration).length, sourceCounts: { benefits: sourceBenefits.length, portfolio: productSources.length, applications: sourceApplications.length } });
}
output.flanges = consolidateFlangeContent(output.flanges);
const flangeReport = reports.find(page => page.slug === "flanges");
if (flangeReport) for (const field of ["portfolio", "applications", "materials", "finishes", "faqs"]) flangeReport[field] = output.flanges[field].length;
fs.writeFileSync(path.join(root, "src/data/productContent.mjs"), `// Product-specific copy adapted from original CNCPioneer pages. Regenerate with scripts/build-product-content.mjs.\nimport { applyEnglishProductContent } from "./englishSeoContent.mjs";\nexport const productContent = ${JSON.stringify(output, null, 2)};\napplyEnglishProductContent(productContent);\nimport { applyProductScopeCorrections } from "./productScopeCorrections.mjs";\nimport { applyConsolidatedProductContent } from "./productConsolidation.mjs";\napplyProductScopeCorrections(productContent);\napplyConsolidatedProductContent(productContent);\n`);
fs.writeFileSync(path.join(reportDir, "content-audit.json"), JSON.stringify({ count: reports.length, pages: reports, missingAssets: [...missingAssets] }, null, 2));
console.log(JSON.stringify({ products: reports.length, illustratedPages: reports.filter((p) => p.illustrations).map((p) => ({ slug: p.slug, illustrations: p.illustrations })), missingApplications: reports.filter((p) => !p.applications).map((p) => p.slug), missingAssets: missingAssets.size, report: path.join(reportDir, "content-audit.json") }, null, 2));
