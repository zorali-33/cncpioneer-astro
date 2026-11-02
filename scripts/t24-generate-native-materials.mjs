import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mirroredDir = path.join(root, "src", "mirrored-pages", "materials");
const outputFile = path.join(root, "src", "data", "nativeMaterials.mjs");

// Keep curated product links when rebuilding material data from the legacy pages.
const partsOverrides = {
  "magnesium-cnc-machining": [
    {
      name: "Metal Enclosures",
      image: "/wp-content/uploads/2026/10/magnesium-material-parts/magnesium-metal-enclosure-white-v1.webp",
      alt: "Representative magnesium alloy metal enclosure product illustration",
      href: "/custom-cnc-parts/metal-enclosures",
    },
    {
      name: "CNC Machining Drone Parts",
      image: "/wp-content/uploads/2026/10/magnesium-material-parts/magnesium-drone-gimbal-bracket-white-v1.webp",
      alt: "Representative magnesium alloy drone gimbal bracket product illustration",
      href: "/custom-cnc-parts/cnc-machining-drone-parts",
    },
    {
      name: "Robot Actuator Housings",
      image: "/wp-content/uploads/2026/10/magnesium-material-parts/magnesium-robot-actuator-housing-white-v1.webp",
      alt: "Representative magnesium alloy robot actuator housing product illustration",
      href: "/custom-cnc-parts/robot-actuator-housings",
    },
  ],
  "alloy-steel-cnc-machining": [
    {
      name: "Quick Coupling",
      image: "/wp-content/uploads/2026/01/alloy-steel-quick-coupling.jpg",
      alt: "alloy steel quick coupling",
      href: "/custom-cnc-parts/hydraulic-fittings",
    },
    {
      name: "Threaded Bushing",
      image: "/wp-content/uploads/2026/10/alloy-steel-threaded-bushing-matched-v2.webp",
      alt: "Alloy steel flanged threaded bushing, representative product illustration",
      href: "/custom-cnc-parts/threaded-bushing",
    },
    {
      name: "Dowel Pin",
      image: "/wp-content/uploads/2026/01/alloy-steel-dowel-pin.jpg",
      alt: "alloy steel dowel pin",
      href: "/custom-cnc-parts/cnc-machined-pins",
    },
  ],
  "copper-cnc-machining": [
    {
      name: "Pogo Pin",
      image: "/wp-content/uploads/2026/01/copper-cnc-machining-pogo-pin.jpg",
      alt: "copper cnc machining pogo pin",
      href: "/custom-cnc-parts/pogo-contact-pins",
    },
    {
      name: "Quick Coupling",
      image: "/wp-content/uploads/2026/01/copper-cnc-machining-quick-coupling.jpg",
      alt: "copper cnc machining quick coupling",
    },
    {
      name: "Connector",
      image: "/wp-content/uploads/2026/01/copper-cnc-machining-connector.jpg",
      alt: "copper cnc machining connector",
      href: "/custom-cnc-parts/electrical-connectors",
    },
    {
      name: "Copper Contact Pins",
      image: "/assets/materials/copper-contact-pins-upright-copper-v2.png",
      alt: "Illustration of upright copper contact pins with an unplated copper finish",
      href: "/custom-cnc-parts/ev-charging-plug",
    },
  ],
  "bronze-cnc-machining": [
    {
      name: "Bronze Bushings",
      image: "/assets/images/bronze-bushing-catalog-v2.webp",
      alt: "Flanged bronze bushing",
      href: "/custom-cnc-parts/bronze-bushings",
    },
    {
      name: "Aluminum Bronze Bushing",
      image: "/assets/images/aluminum-bronze-bushing-catalog-v2.webp",
      alt: "Aluminum bronze bushing",
      href: "/custom-cnc-parts/aluminum-bronze-bushing",
    },
    {
      name: "Pogo Pin",
      image: "/wp-content/uploads/2026/01/bronze-cnc-machining-pogo-pin\u200b.jpg",
      alt: "Bronze CNC machined pogo pin",
      href: "/custom-cnc-parts/pogo-contact-pins",
    },
  ],
};

const decodeEntities = (value = "") =>
  value
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCharCode(Number.parseInt(num, 10)));

const cleanText = (value = "") =>
  value
    .replace(/鈥檚/g, "'s")
    .replace(/鈥檙/g, "'r")
    .replace(/鈥檝/g, "'v")
    .replace(/鈥攅/g, "-e")
    .replace(/鈥攖/g, "-t")
    .replace(/鈥攁/g, "-a")
    .replace(/鈥攕/g, "-s")
    .replace(/鈥攄/g, "-d")
    .replace(/鈥攑/g, "-p")
    .replace(/鈥?/g, "")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[±]/g, "+/-")
    .replace(/[μ]/g, "u")
    .replace(/[″”]/g, '"')
    .replace(/[“]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/卤/g, "+/-")
    .replace(/渭/g, "u")
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (html = "") =>
  cleanText(decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ));

const firstMatch = (html, re, fallback = "") => {
  const match = html.match(re);
  return match ? cleanText(decodeEntities(match[1].trim())) : fallback;
};

const firstRawMatch = (html, re, fallback = "") => {
  const match = html.match(re);
  return match ? decodeEntities(match[1].trim()) : fallback;
};

const isChromeText = (text = "") =>
  /@cncpioneer\.com/i.test(text) ||
  /^\+?\d[\d\s().-]{6,}$/.test(text) ||
  /^home$/i.test(text) ||
  /^services$/i.test(text) ||
  /^materials$/i.test(text) ||
  /^industries$/i.test(text) ||
  /^resources$/i.test(text) ||
  /^about us$/i.test(text) ||
  /^get a quote$/i.test(text);

const firstTextWidgetAfter = (html, index) => {
  const chunk = html.slice(index);
  return firstTextWidgetIn(chunk);
};

const firstTextWidgetIn = (html) => {
  const re = /elementor-widget-text-editor[\s\S]*?<div class="elementor-widget-container">\s*([\s\S]*?)\s*<\/div>/gi;
  for (const match of html.matchAll(re)) {
    const text = stripTags(match[1]);
    if (text && !text.includes("elementor-") && !text.includes("{") && !text.includes("--") && !isChromeText(text)) {
      return text;
    }
  }
  return "";
};

const extractH2s = (html) =>
  [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => stripTags(match[1]));

const extractH2Entries = (html) =>
  [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => ({
    text: stripTags(match[1]),
    index: match.index,
    end: match.index + match[0].length,
  }));

const extractBullets = (html) =>
  [...html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").matchAll(/elementor-icon-list-text[^>]*>\s*([\s\S]*?)\s*<\/span>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => !text.includes("elementor-") && !text.includes("{"))
    .filter((text) => !isChromeText(text))
    .filter(Boolean);

const firstContentImageIn = (html, fallbackAlt = "") => {
  const re = /<img\b([^>]*)>/gi;
  for (const match of html.matchAll(re)) {
    const attrs = match[1];
    const src = firstRawMatch(attrs, /\bsrc="([^"]+)"/i);
    if (!src || /cncpioneer_nav_logo|cropped-site-icon/i.test(src)) continue;
    const alt = firstMatch(attrs, /\balt="([^"]*)"/i, fallbackAlt);
    return { src, alt };
  }
  return null;
};

const extractParts = (html, startIndex, endIndex) => {
  const chunk = html.slice(startIndex, endIndex > startIndex ? endIndex : undefined);
  const parts = [];
  const re = /<img[^>]+class="swiper-slide-image"[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi;
  for (const match of chunk.matchAll(re)) {
    const name = stripTags(match[3]) || decodeEntities(match[2]);
    const image = decodeEntities(match[1]);
    if (!parts.some((part) => part.image === image)) {
      parts.push({ name, image, alt: decodeEntities(match[2]) || name });
    }
  }
  return parts;
};

const carouselDisplayOrder = (parts) => (parts.length > 1 ? [...parts.slice(1), parts[0]] : parts);

const extractFaqs = (html) => {
  const faqs = [];
  const faqHeading = html.match(/<h2[^>]*>\s*FAQ'?s?\s*<\/h2>/i);
  const faqStart = faqHeading ? faqHeading.index : -1;
  const ctaStart = faqStart > -1 ? html.indexOf("Questions?", faqStart) : -1;
  const chunk = (faqStart > -1 ? html.slice(faqStart, ctaStart > faqStart ? ctaStart : undefined) : "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const re = /elementor-toggle-title[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?elementor-tab-content[^>]*>\s*([\s\S]*?)\s*<\/div>/gi;
  for (const match of chunk.matchAll(re)) {
    const question = stripTags(match[1]);
    const answer = stripTags(match[2]);
    if (question && answer && !question.includes("{") && !question.includes("elementor-")) {
      faqs.push({ question, answer });
    }
  }
  return faqs;
};

const extractPage = (slug) => {
  const file = path.join(mirroredDir, slug, "index.html");
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("Available Parts for") || !html.includes("Why Choose")) {
    return null;
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? stripTags(h1Match[1]) : firstMatch(html, /<title>([\s\S]*?)<\/title>/i, slug);
  const h1Index = h1Match ? h1Match.index + h1Match[0].length : 0;
  const h2Entries = extractH2Entries(html);
  const whyEntry = h2Entries.find((heading) => heading.text.includes("Why Choose"));
  const partsEntry = h2Entries.find((heading) => heading.text.includes("Available Parts for"));
  const capabilitiesEntry = h2Entries.find((heading) => heading.text.includes("CNC Services and Capabilities"));
  const faqEntry = h2Entries.find((heading) => /^FAQ'?s?$/i.test(heading.text));
  const whyHeading = whyEntry?.text || `Why Choose ${h1}?`;
  const partsHeading = partsEntry?.text || `Available Parts for ${h1}`;
  const capabilitiesHeading = capabilitiesEntry?.text || `${h1} CNC Services and Capabilities`;
  const whyStart = whyEntry?.end ?? h1Index;
  const partsStart = partsEntry?.end ?? html.length;
  const capabilitiesStart = capabilitiesEntry?.end ?? html.length;
  const faqStart = faqEntry?.index ?? html.length;
  const whyChunk = html.slice(whyStart, partsEntry ? partsEntry.index : html.length);
  const partsChunk = html.slice(partsStart, capabilitiesEntry ? capabilitiesEntry.index : html.length);
  const materialImageData = firstContentImageIn(whyChunk, h1);

  const materialImage =
    materialImageData?.src ||
    firstRawMatch(html, /<meta property="og:image" content="([^"]+)"/i);

  return {
    slug,
    seo: {
      title: firstMatch(html, /<title>([\s\S]*?)<\/title>/i, `${h1} - CNCPioneer`),
      description: firstMatch(html, /<meta name="description" content="([^"]*)"/i, `${h1} services from CNCPioneer.`),
      canonical: firstRawMatch(html, /<link rel="canonical" href="([^"]+)"/i, `/materials/${slug}`),
      image: firstRawMatch(html, /<meta property="og:image" content="([^"]+)"/i, materialImage),
    },
    hero: {
      title: h1,
      image:
        firstRawMatch(html, /url\('([^']+)'\)/i) ||
        firstRawMatch(html, /<link rel="preload"[^>]+as="image"[^>]+href="([^"]+)"/i) ||
        materialImage,
      description: firstTextWidgetAfter(html, h1Index),
    },
    material: {
      heading: whyHeading,
      description: firstTextWidgetIn(whyChunk) || firstTextWidgetAfter(html, h1Index),
      image: materialImage,
      alt: materialImageData?.alt || h1,
      partsHeading,
      partsIntro: slug === "brass-swiss-machining"
        ? "Explore brass contact pins, threaded bushings and pneumatic fittings. Open each product page to review typical designs, material options and drawing requirements."
        : firstTextWidgetIn(partsChunk),
      bullets: extractBullets(whyChunk).slice(0, 8),
    },
    parts: partsOverrides[slug] ?? carouselDisplayOrder(extractParts(html, partsEntry?.index ?? 0, capabilitiesEntry?.index ?? html.length)),
    capabilitiesHeading,
    faqs: extractFaqs(faqStart < html.length ? html.slice(faqStart) : ""),
  };
};

const pages = fs
  .readdirSync(mirroredDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .map(extractPage)
  .filter(Boolean)
  .sort((a, b) => a.slug.localeCompare(b.slug));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(
  outputFile,
  `// Generated by scripts/t24-generate-native-materials.mjs from mirrored material pages.\nimport { applyEnglishMaterialContent } from "./englishSeoContent.mjs";\nimport { applyMaterialConsolidation } from "./materialConsolidation.mjs";\nexport const nativeMaterials = ${JSON.stringify(pages, null, 2)};\napplyEnglishMaterialContent(nativeMaterials);\napplyMaterialConsolidation(nativeMaterials);\n`,
);

console.log(JSON.stringify({ pages: pages.length, output: path.relative(root, outputFile) }, null, 2));
