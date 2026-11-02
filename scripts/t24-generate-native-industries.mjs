import fs from "node:fs";
import path from "node:path";
import { isRetiredIndustry } from '../src/data/industryRedirects.mjs';
import { satelliteIndustryNativeContent } from '../src/data/satelliteIndustryContent.mjs';

const root = process.cwd();
const mirroredDir = path.join(root, "src", "mirrored-pages", "industries");
const outputFile = path.join(root, "src", "data", "nativeIndustries.mjs");

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

const contentOnly = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

const mainOnly = (html) => {
  const match = html.match(/<main[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1] : html;
};

const isNoiseText = (text = "") => {
  const value = cleanText(text);
  if (value.length < 20 || value.length > 520) return true;
  if (/^\+?\d[\d\s().-]+$/.test(value)) return true;
  if (/info@cncpioneer\.com/i.test(value)) return true;
  if (/^(Home|Services|Materials|Industries|Resources|About Us|Get A Quote)$/i.test(value)) return true;
  if (/Room 1202B54|Futian District|Copyright/i.test(value)) return true;
  if (/elementor-|wp-content\/plugins|\{|\}/i.test(value)) return true;
  return false;
};

const firstTextInChunk = (html) => {
  const chunk = contentOnly(html);
  const paragraphs = [...chunk.matchAll(/<p[^>]*>\s*([\s\S]*?)\s*<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => !isNoiseText(text));
  return paragraphs[0] || "";
};

const normalizeHeading = (heading = "") => {
  const value = cleanText(heading);
  if (/High-Precision .* CNC Machining Parts Made/i.test(value)) {
    return value.match(/High-Precision .* CNC Machining Parts Made/i)?.[0] || "High-Precision CNC Machining Parts Made";
  }
  if (/Recommended Materials/i.test(value)) return "Recommended Materials & Surface Finishes";
  if (/Our experts are here for you/i.test(value)) return "";
  if (value.length > 140) return value.slice(0, 120).replace(/\s+\S*$/, "");
  return value;
};

const normalizeDescription = (description = "", fallback = "") => {
  const value = cleanText(description || fallback);
  if (value.length <= 155) return value;
  return `${value.slice(0, 151).replace(/\s+\S*$/, "")}.`;
};

const h2Matches = (html) =>
  [...contentOnly(html).matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => ({ index: match.index, heading: normalizeHeading(stripTags(match[1])) }))
    .filter((item) => item.heading && !item.heading.includes("Questions?"));

const extractItems = (chunk) =>
  [...contentOnly(chunk).matchAll(/(?:elementor-icon-list-text[^>]*>|<li[^>]*>)\s*([\s\S]*?)\s*(?:<\/span>|<\/li>)/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text && !isNoiseText(text))
    .slice(0, 8);

const extractImages = (html) => {
  const images = [];
  const clean = contentOnly(html);
  const re = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  for (const match of clean.matchAll(re)) {
    const image = cleanText(decodeEntities(match[1]));
    const alt = cleanText(decodeEntities(match[2] || ""));
    if (
      !image.includes("logo") &&
      !image.includes("site-icon") &&
      !image.includes("cropped-") &&
      image.includes("/wp-content/uploads/") &&
      !images.some((item) => item.image === image)
    ) {
      images.push({ image, alt, name: alt || "CNC Machining Part" });
    }
  }
  return images;
};

const extractPage = (slug) => {
  const file = path.join(mirroredDir, slug, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const main = mainOnly(html);
  const h1Match = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? stripTags(h1Match[1]) : slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
  const h1Index = h1Match ? h1Match.index + h1Match[0].length : 0;
  const headings = h2Matches(main);
  const images = extractImages(main);

  const sections = headings.slice(0, 8).map((entry, index) => {
    const next = headings[index + 1]?.index ?? main.length;
    const chunk = main.slice(entry.index, next);
    const sectionImages = extractImages(chunk);
    return {
      heading: entry.heading,
      text: firstTextInChunk(chunk),
      items: extractItems(chunk),
      image: sectionImages[0]?.image || "",
    };
  }).filter((section) => section.heading && (section.text || section.items.length || section.image));

  if (!sections.length) {
    sections.push({
      heading: `${h1} CNC Machining Overview`,
      text: firstTextInChunk(main.slice(h1Index)) || `${h1} machining services from CNCPioneer support precision components, material selection, quality control, and production-ready CNC manufacturing.`,
      items: [],
      image: images[0]?.image || "",
    });
  }

  return {
    slug,
    seo: {
      title: firstMatch(html, /<title>([\s\S]*?)<\/title>/i, `${h1} - CNCPioneer`),
      description: normalizeDescription(
        firstMatch(html, /<meta name="description" content="([^"]*)"/i, ""),
        `${h1} CNC machining services from CNCPioneer.`,
      ),
      canonical: firstMatch(html, /<link rel="canonical" href="([^"]+)"/i, `/industries/${slug}`),
      image: firstMatch(html, /<meta property="og:image" content="([^"]+)"/i, images[0]?.image || "/wp-content/uploads/2025/11/cncpioneer_nav_logo.png"),
    },
    hero: {
      title: h1,
      image:
        firstMatch(html, /url\('([^']+)'\)/i) ||
        firstMatch(html, /<link rel="preload"[^>]+as="image"[^>]+href="([^"]+)"/i) ||
        images[0]?.image ||
        "/wp-content/uploads/2025/12/semiconductor-industry-banner.jpg",
      description: firstTextInChunk(main.slice(h1Index)) || firstMatch(html, /<meta name="description" content="([^"]*)"/i, ""),
    },
    sections,
    galleryHeading: headings.find((item) => /parts|made|components/i.test(item.heading))?.heading || `${h1} CNC Machining Parts`,
    gallery: images,
    ...(slug === "satellites" ? satelliteIndustryNativeContent : {}),
  };
};

const pages = fs
  .readdirSync(mirroredDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !isRetiredIndustry(`industries/${entry.name}`))
  .map((entry) => extractPage(entry.name))
  .sort((a, b) => a.slug.localeCompare(b.slug));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(
  outputFile,
  `// Generated by scripts/t24-generate-native-industries.mjs from mirrored industry pages.\nexport const nativeIndustries = ${JSON.stringify(pages, null, 2)};\n`,
);

console.log(JSON.stringify({ pages: pages.length, output: path.relative(root, outputFile) }, null, 2));
