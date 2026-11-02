import fs from "node:fs";
import path from "node:path";
import { getPartEntries } from "../src/parts-archive.mjs";
import { isRemovedProductRoute } from "../src/data/productRemovals.mjs";
import { isRetiredProduct } from "../src/data/productRedirects.mjs";
import { aluminumFlangeNativeContent } from "../src/data/aluminumFlangeContent.mjs";
import { flangeSeo } from "../src/data/flangeContent.mjs";
import { aerospaceBracketsNativeContent } from "../src/data/aerospaceBracketsContent.mjs";
import { semiconductorVacuumChamberNativeContent } from "../src/data/semiconductorVacuumChamberContent.mjs";
import { stainlessSemiconductorNativeContent } from "../src/data/stainlessSemiconductorContent.mjs";
import { aluminumMillingConnectorNativeContent } from "../src/data/aluminumMillingConnectorContent.mjs";


const root = process.cwd();
const mirroredDir = path.join(root, "src", "mirrored-pages", "custom-cnc-parts");
const outputFile = path.join(root, "src", "data", "nativeParts.mjs");

const decodeEntities = (value = "") =>
  String(value || "")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&plusmn;|&#177;/g, "+/-")
    .replace(/&mu;|&#181;/g, "u")
    .replace(/&deg;|&#176;/g, " degrees")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCharCode(Number.parseInt(num, 10)));

const cleanText = (value = "") =>
  decodeEntities(value)
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[\u00b1]/g, "+/-")
    .replace(/[\u00b5\u03bc]/g, "u")
    .replace(/[\u2032]/g, "'")
    .replace(/[\u2033\u201d]/g, '"')
    .replace(/[\u201c]/g, '"')
    .replace(/[\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (html = "") =>
  cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? cleanText(match[2]) : "";
};

const firstMatch = (html, re, fallback = "") => {
  const match = html.match(re);
  return match ? cleanText(match[1]) : fallback;
};

const mainOnly = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;

const isNoiseText = (text = "") => {
  const value = cleanText(text);
  if (value.length < 24 || value.length > 760) return true;
  if (/info@cncpioneer\.com|Room 1202B54|Futian District|Copyright/i.test(value)) return true;
  if (/^(Home|Services|Materials|Industries|Resources|About Us|Get A Quote|Upload Drawing|View Part)$/i.test(value)) return true;
  if (/elementor-|wp-content\/plugins|function\(|@media|\{|\}/i.test(value)) return true;
  return false;
};

const normalizeDescription = (description = "", fallback = "") => {
  const source = cleanText(description);
  const fallbackValue = cleanText(fallback);
  const value = source.length >= 120 ? source : fallbackValue || source;
  if (value.length >= 120 && value.length <= 155) return value;
  if (value.length > 155) return `${value.slice(0, 151).replace(/\s+\S*$/, "")}.`;
  const extended = `${value} CNCPioneer supports precision CNC machining, materials, finishing, inspection, and production-ready custom parts.`;
  return extended.length > 155 ? `${extended.slice(0, 151).replace(/\s+\S*$/, "")}.` : extended;
};

const normalizeTitle = (title = "", fallback = "") => {
  const value = cleanText(title || fallback);
  if (!value) return fallback;
  const withoutBrand = value.replace(/[\s|:;,_-]*(?:CNCPioneer|CNC\s*Pioneer)\s*$/i, "");
  const withBrand = `${withoutBrand} - CNCPioneer`;
  if (withBrand.length <= 60) return withBrand;
  if (withoutBrand.length <= 60) return withoutBrand;
  return withoutBrand.slice(0, 57).replace(/\s+\S*$/, "");
};

const collectParagraphs = (html) =>
  [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => !isNoiseText(text));

const collectImages = (html) => {
  const images = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = getAttr(tag, "data-lazy-src") || getAttr(tag, "data-src") || getAttr(tag, "src");
    const alt = getAttr(tag, "alt");
    if (
      src &&
      src.includes("/wp-content/uploads/") &&
      !/logo|site-icon|cropped-/i.test(src) &&
      !images.some((item) => item.image === src)
    ) {
      images.push({ image: src, alt, name: alt || "Custom CNC part" });
    }
  }
  return images;
};

const collectFaqs = (html) => {
  const faqs = [];
  const rowRe = /<div\b[^>]*class=["'][^"']*\bfaq-row\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  for (const match of html.matchAll(rowRe)) {
    const row = match[1];
    const question = stripTags(row.match(/<button\b[\s\S]*?<\/button>/i)?.[0] || "");
    const answer = stripTags(row.match(/<div\b[^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*>([\s\S]*?)$/i)?.[1] || "");
    if (question && answer && question.length < 220 && answer.length > 24) {
      faqs.push({ question, answer });
    }
  }
  return faqs.slice(0, 8);
};

const collectSections = (main) => {
  const h2s = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => ({ index: match.index || 0, heading: stripTags(match[1]) }))
    .filter((entry) => entry.heading && !/FAQ|Get a Quote|Questions/i.test(entry.heading))
    .slice(0, 8);

  return h2s
    .map((entry, index) => {
      const next = h2s[index + 1]?.index ?? main.length;
      const chunk = main.slice(entry.index, next);
      const paragraphs = collectParagraphs(chunk);
      const items = [...chunk.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((match) => stripTags(match[1]))
        .filter((text) => !isNoiseText(text))
        .slice(0, 8);
      const images = collectImages(chunk);
      return {
        heading: entry.heading.length > 140 ? entry.heading.slice(0, 120).replace(/\s+\S*$/, "") : entry.heading,
        text: paragraphs[0] || "",
        items,
        image: images[0]?.image || "",
      };
    })
    .filter((section) => section.heading && (section.text || section.items.length || section.image));
};

const readModules = () => {
  const modules = {};
  for (const entry of fs.readdirSync(mirroredDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(mirroredDir, entry.name, "index.html");
    if (!fs.existsSync(file)) continue;
    modules[`../mirrored-pages/custom-cnc-parts/${entry.name}/index.html`] = fs.readFileSync(file, "utf8");
  }
  return modules;
};

const modules = readModules();
const archiveEntries = getPartEntries(modules);
const entryBySlug = new Map(archiveEntries.map((entry) => [entry.slug, entry]));

const seoOverrides = {
  "aerospace-fasteners": {
    title: "Custom Aerospace Fastener | CNCPioneer",
    description: "Get custom aerospace fastener quotes from CNCPioneer, a manufacturer in China. CNC machined fasteners made to your drawings with finishing and inspection.",
  },
  "cnc-turning-titanium-nuts": {
    title: "CNC Turning Titanium Nut | CNCPioneer",
    description: "Looking for cnc turning titanium nut manufacturers in China? Get quotes from CNCPioneer for custom nuts with material options, finishing and inspection support.",
  },
  "threaded-bushing": {
    title: "Custom Threaded Bushing | CNCPioneer",
    description: "Custom threaded bushing manufacturer in China. Get quotes for CNC machined brass, aluminum and stainless steel bushings made to your drawings and requirements.",
  },
  "swiss-machined-parts": {
    title: "Swiss Machined Parts | CNCPioneer",
    description: "Get quotes for Swiss machined parts from CNCPioneer in China. Custom precision pins, shafts, bushings and connectors made to your drawings and specifications.",
  },
  "stainless-steel-cnc-turning-parts": {
    title: "Stainless Steel CNC Turning Parts | CNCPioneer",
    description: "Get stainless steel cnc turning parts quotes from CNCPioneer in China. Custom shafts, bushings and fittings with material options, finishing and inspection.",
  },
  "cnc-machining-for-aerospace-brackets": {
    title: "CNC Machining For Aerospace Brackets | CNCPioneer",
    description: "CNC machining for aerospace brackets in China. Get quotes for custom brackets made to your drawings with material traceability and dimensional inspection.",
    image: "/wp-content/uploads/2026/08/5-axis-aluminum-aerospace-structural-fitting.jpg",
  },
  "electric-motor-stator-housing-machining": {
    title: "Electric Motor Stator Housing Machining | CNCPioneer",
    description: "Get quotes for electric motor stator housing machining in China. Custom housings and end caps made to your drawings with material and dimensional inspection.",
  },
  "pogo-contact-pins": {
    title: "Custom Pogo Contact Pins | CNCPioneer",
    description: "Get quotes for custom pogo contact pins from a manufacturer in China. CNC-machined plungers, barrels and tips made to your drawings with inspection support.",
  },
  "hydraulic-cylinder-components-machining": {
    title: "Hydraulic Cylinder Components Machining | CNCPioneer",
    description: "Get quotes for hydraulic cylinder components machining in China. Custom pistons, rods and glands made to your drawings with material and inspection support.",
  },
  "humanoid-robot-leg-components": {
    title: "Custom Humanoid Robot Leg Components | CNCPioneer",
    description: "Get quotes for custom humanoid robot leg components from a manufacturer in China. CNC-machined hip, knee and ankle parts with dimensional inspection support.",
  },
  "humanoid-robot-hand-finger-parts": {
    title: "Custom Humanoid Robot Hand Finger Parts | CNCPioneer",
    description: "Get quotes for custom humanoid robot hand finger parts from a manufacturer in China. CNC-machined joints, linkages and palm plates made to your drawings.",
  },
  "humanoid-robot-arm-components": {
    title: "Custom Humanoid Robot Arm Components | CNCPioneer",
    description: "Get quotes for custom humanoid robot arm components from a manufacturer in China. Machined brackets, housings and flanges with material and inspection support.",
  },
  "heat-sinks": {
    title: "cnc machined heat sink | CNCPioneer",
    description: "CNC machined heat sink solutions from CNCPioneer in China. Request quotes for custom aluminum and copper heat sinks made to your drawings and specifications.",
  },
  "5-axis-sensor-housing-machining": {
    title: "Sensor Housing 5-Axis Machining Part | CNCPioneer",
    description: "Get quotes for a sensor housing 5-axis machining part from CNCPioneer in China. Custom housings with precision bores and mounting features to your drawings.",
  },
  "ev-battery-connectors": {
    title: "Custom EV Battery Connector | CNCPioneer",
    description: "Custom EV Battery Connector for OEM applications in China. Get quotes for CNC-machined contacts and terminals made to your drawings, with inspection support.",
  },
  "custom-electrical-contacts": {
    title: "Custom Electrical Contacts | CNCPioneer",
    description: "Get quotes for CNC machining electrical contacts from a manufacturer in China. Custom contact pins and terminals made to your drawings with inspection support.",
  },
  "electrical-connectors": {
    title: "Custom Electrical Connectors | CNCPioneer",
    description: "Custom electrical connectors manufacturer in China. Get quotes for CNC-machined contact pins, sockets and shells made to your drawings, with inspection support.",
  },
};

const pages = Object.entries(modules)
  .map(([modulePath, html]) => {
    const slug = modulePath.match(/custom-cnc-parts\/([^/]+)\/index\.html$/)?.[1];
    if (!slug || isRetiredProduct(`/custom-cnc-parts/${slug}`) || isRemovedProductRoute(`/custom-cnc-parts/${slug}`)) return null;
    const entry = entryBySlug.get(slug);
    const main = mainOnly(html);
    const h1 = stripTags(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || entry?.title || slug);
    const heroParagraphs = collectParagraphs(main.slice((main.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.index || 0)));
    const images = collectImages(main);
    const gallery = images.filter((item) => item.image !== entry?.image).slice(0, 12);
    const sections = collectSections(main);
    const fallbackText = entry?.description || heroParagraphs[0] || `${entry?.title || h1} from CNCPioneer custom CNC machining.`;

    return {
      slug,
      seo: {
        title: normalizeTitle(firstMatch(html, /<title>([\s\S]*?)<\/title>/i, ""), entry?.title || h1),
        description: normalizeDescription(firstMatch(html, /<meta name=["']description["'] content=["']([^"']*)/i, ""), fallbackText),
        canonical: firstMatch(html, /<link rel=["']canonical["'] href=["']([^"']+)/i, `/custom-cnc-parts/${slug}`),
        image: firstMatch(html, /<meta property=["']og:image["'] content=["']([^"']+)/i, entry?.image || images[0]?.image || "/wp-content/uploads/2026/01/custom-cnc-machining-parts.jpg"),
        ...(seoOverrides[slug] || {}),
        ...(slug === "flanges" ? flangeSeo : {}),
      },
      title: slug === "flanges" ? "CNC Machined Flanges" : entry?.title || h1,
      eyebrow: "Custom CNC Parts",
      categoryLabel: entry?.categoryLabel || "Precision Components",
      image: entry?.image || images[0]?.image || "/wp-content/uploads/2026/01/custom-cnc-machining-parts.jpg",
      description: heroParagraphs[0] || entry?.description || fallbackText,
      sections,
      gallery,
      faqs: collectFaqs(main),
      ...(slug === "cnc-machining-for-aerospace-brackets" ? aerospaceBracketsNativeContent : {}),

    };
  })
  .filter(Boolean)
  .sort((a, b) => a.slug.localeCompare(b.slug));

const connectorIndex = pages.findIndex(page => page.slug === aluminumMillingConnectorNativeContent.slug);
if (connectorIndex < 0) pages.push(aluminumMillingConnectorNativeContent);
else pages[connectorIndex] = aluminumMillingConnectorNativeContent;

const aluminumFlangeIndex = pages.findIndex(page => page.slug === aluminumFlangeNativeContent.slug);
if (aluminumFlangeIndex < 0) pages.push(aluminumFlangeNativeContent);
else pages[aluminumFlangeIndex] = aluminumFlangeNativeContent;

const vacuumChamberIndex = pages.findIndex(page => page.slug === semiconductorVacuumChamberNativeContent.slug);
if (vacuumChamberIndex < 0) pages.push(semiconductorVacuumChamberNativeContent);
else pages[vacuumChamberIndex] = semiconductorVacuumChamberNativeContent;
const stainlessSemiconductorIndex = pages.findIndex(page => page.slug === stainlessSemiconductorNativeContent.slug);
if (stainlessSemiconductorIndex < 0) pages.push(stainlessSemiconductorNativeContent);
else pages[stainlessSemiconductorIndex] = stainlessSemiconductorNativeContent;
pages.sort((a, b) => a.slug.localeCompare(b.slug));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(
  outputFile,
  `// Generated by scripts/t24-generate-native-parts.mjs from mirrored custom CNC part pages.\nimport { applyEnglishPartMetadata } from "./englishSeoContent.mjs";\nexport const nativeParts = ${JSON.stringify(pages, null, 2)};\napplyEnglishPartMetadata(nativeParts);\nimport { applyProductScopeMetadata } from "./productScopeCorrections.mjs";\nimport { applyConsolidatedPartMetadata } from "./productConsolidation.mjs";\napplyProductScopeMetadata(nativeParts);\napplyConsolidatedPartMetadata(nativeParts);\n`,
);

console.log(JSON.stringify({ pages: pages.length, output: path.relative(root, outputFile) }, null, 2));
