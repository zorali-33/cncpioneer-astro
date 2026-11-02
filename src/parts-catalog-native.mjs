import { nativeParts } from "./data/nativeParts.mjs";
import { productContent } from "./data/productContent.mjs";
import {partCategories,classifyPart} from './data/partTaxonomy.mjs';
export {partCategories} from './data/partTaxonomy.mjs';

export const PARTS_PER_PAGE = 24;
export const PARTS_ROOT = "/custom-cnc-parts";
const titleOverrides = {
  "cnc-turning-and-milling-parts": "CNC Turning & Milling Parts",
  "cnc-turning-milling-parts": "Precision Turn-Mill Parts",
  "5-axis-aluminum-cnc-machining-parts": "5-Axis Aluminum Parts",
  "5-axis-cnc-machining-brass-parts": "5-Axis Brass Parts",
  "cnc-machined-brass-parts": "CNC Machined Brass Parts",
  "brass-turning-milling-parts": "Brass Turn-Mill Parts",
  "stainless-steel-5-axis-cnc-parts": "5-Axis Stainless Steel Parts",
  "stainless-steel-cnc-turning-parts": "Stainless Steel Turned Parts",
  "5-axis-cnc-machining-for-humanoid-robots": "Humanoid Robot Components",
  "swiss-machined-parts": "Swiss Machined Parts",
  "cnc-machined-flange": "CNC Machined Pipe Flanges",
};
const featured = [
  "stainless-steel-cnc-turning-flanges", "brass-contact-pins",
  "titanium-swiss-screw-machined-parts", "aluminium-alloy-cnc-turning-bushing",
  "stainless-steel-precision-turning-shaft", "5-axis-aluminum-cnc-machining-parts",
  "brass-pipe-fittings", "robot-actuator-housings", "aerospace-fasteners",
  "semiconductor-probe-pin", "bronze-sleeve-bushings", "stainless-steel-fittings",
];
export function normalizeSearch(value) {
  return String(value).toLowerCase().replace(/aluminium/g, "aluminum").replace(/[^a-z0-9]+/g, " ").trim();
}
function materialFor(text) {
  const rules = [
    [/stainless[ -]steel/i, "Stainless steel"], [/bronze/i, "Bronze"],
    [/alumin[iu]+m/i, "Aluminum"], [/brass/i, "Brass"], [/titanium/i, "Titanium"],
    [/copper/i, "Copper"], [/nickel|inconel/i, "Nickel alloys"],
    [/peek|ptfe|nylon|plastic|acetal/i, "Engineering plastics"], [/\bsteel\b/i, "Steel"],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || "To specification";
}
function processFor(text) {
  if (/swiss/i.test(text)) return "Swiss machining";
  if (/5[ -]axis/i.test(text)) return "5-axis machining";
  if (/wire[ -]edm/i.test(text)) return "Wire EDM";
  if (/turning[ -](?:and[ -])?milling|turn[ -]mill/i.test(text)) return "Mill-turn machining";
  if (/turning|turned/i.test(text)) return "CNC turning";
  if (/milling/i.test(text)) return "CNC milling";
  return "CNC machining";
}
export const catalogParts = nativeParts.map(page => {
  const title = titleOverrides[page.slug] || page.title;
  const category = classifyPart(page);
  const identity = page.catalogIdentity || page.slug;
  const material = materialFor(`${identity.replaceAll("-", " ")} ${title}`);
  const process = processFor(identity);
  // Match the second section rendered by each detail page (Product Overview).
  // The flange reference page uses PartPage's dedicated overview image.
  const image = page.slug === "stainless-steel-cnc-turning-flanges"
    ? "/wp-content/uploads/2026/09/stainless-flange-ansi-din-exhaust-vacuum.jpg"
    : productContent[page.slug]?.overviewImage;
  if (!image) throw new Error(`Missing product overview image: ${page.slug}`);
  return {
    slug: page.slug, title, href: `${PARTS_ROOT}/${page.slug}`, image,
    category: category.id, categoryLabel: category.label, material, process,
    searchText: normalizeSearch(`${title} ${page.slug} ${page.seo.title} ${category.label} ${material} ${process}`),
  };
}).sort((a, b) => {
  const rank = item => { const i = featured.indexOf(item.slug); return i < 0 ? featured.length : i; };
  return rank(a) - rank(b) || a.title.localeCompare(b.title, "en");
});
export const catalogCategories = partCategories.map(({ id, label }) => ({
  id, label, count: catalogParts.filter(p => p.category === id).length,
})).filter(c => c.count);
export const catalogMaterials = [...new Set(catalogParts.map(p => p.material))].sort((a, b) => {
  if (a === "To specification") return 1;
  if (b === "To specification") return -1;
  return a.localeCompare(b);
});
export const catalogPageCount = Math.max(1, Math.ceil(catalogParts.length / PARTS_PER_PAGE));
export const catalogPageHref = page => page === 1 ? PARTS_ROOT : `${PARTS_ROOT}/page/${page}`;
