import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = path.join(projectRoot, "src/mirrored-pages");

const pageUpdates = {
  "about-us/index.html": {
    title: "About CNCPioneer CNC Machining Company",
    ogTitle: "About CNCPioneer CNC Machining Company",
  },
  "blog/index.html": {
    title: "CNC Machining Blog & Manufacturing Guides",
    description: "Read CNCPioneer CNC machining guides, materials advice, design tips, and manufacturing insights for precision parts and custom production.",
    ogTitle: "CNC Machining Blog & Manufacturing Guides",
    ogDescription: "Read CNCPioneer CNC machining guides, materials advice, design tips, and manufacturing insights for precision parts and custom production.",
  },
  "author/david-li/index.html": {
    title: "David Li CNC Machining Articles | CNCPioneer",
    description: "Read David Li's CNCPioneer articles on CNC machining, materials, tolerances, troubleshooting, and manufacturing quality for precision parts.",
    ogTitle: "David Li CNC Machining Articles | CNCPioneer",
    ogDescription: "Read David Li's CNCPioneer articles on CNC machining, materials, tolerances, troubleshooting, and manufacturing quality for precision parts.",
    h1: "David Li",
  },
  "author/ryan-wang/index.html": {
    title: "Ryan Wang CNC Machining Articles | CNCPioneer",
    description: "Read Ryan Wang's CNCPioneer articles on CNC machining, five-axis processes, materials, tolerances, and precision manufacturing quality.",
    ogTitle: "Ryan Wang CNC Machining Articles | CNCPioneer",
    ogDescription: "Read Ryan Wang's CNCPioneer articles on CNC machining, five-axis processes, materials, tolerances, and precision manufacturing quality.",
    h1: "Ryan Wang",
  },
  "custom-cnc-parts/test-probe-pins/index.html": {
    title: "Test Probe Pins for Precision CNC Testing",
    ogTitle: "Test Probe Pins for Precision CNC Testing",
  },
  "industries/index.html": {
    title: "CNC Machining Industries Served | CNCPioneer",
    ogTitle: "CNC Machining Industries Served | CNCPioneer",
    h1: "CNC Machining Industries",
  },
  "industries/aerospace/index.html": {
    title: "Aerospace CNC Machining Industry Services",
    ogTitle: "Aerospace CNC Machining Industry Services",
  },
  "industries/automotive/index.html": {
    title: "Automotive CNC Machining Industry Services",
    ogTitle: "Automotive CNC Machining Industry Services",
  },
  "industries/defense/index.html": {
    title: "Defense CNC Machining Industry Services",
    ogTitle: "Defense CNC Machining Industry Services",
  },
  "industries/medical/index.html": {
    title: "Medical CNC Machining Industry Services",
    ogTitle: "Medical CNC Machining Industry Services",
  },
  "industries/oil-gas/index.html": {
    title: "Oil & Gas CNC Machining Industry Services",
    ogTitle: "Oil & Gas CNC Machining Industry Services",
  },
  "industries/railway/index.html": {
    title: "Railway CNC Machining Industry Services",
    ogTitle: "Railway CNC Machining Industry Services",
  },
  "materials/index.html": {
    title: "CNC Machining Materials Guide | CNCPioneer",
    ogTitle: "CNC Machining Materials Guide | CNCPioneer",
  },
  "resources/index.html": {
    title: "CNC Machining Resources & Guides | CNCPioneer",
    ogTitle: "CNC Machining Resources & Guides | CNCPioneer",
  },
  "resources/faqs/index.html": {
    title: "CNC Machining FAQs and Support | CNCPioneer",
    ogTitle: "CNC Machining FAQs and Support | CNCPioneer",
  },
  "services/index.html": {
    title: "Precision CNC Machining Services | CNCPioneer",
    ogTitle: "Precision CNC Machining Services | CNCPioneer",
  },
};

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
}

function setMetaDescription(html, description) {
  if (!description) return html;
  return html.replace(
    /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']*["'])[^>]*>/i,
    `<meta name="description" content="${escapeAttr(description)}">`,
  );
}

function setOg(html, property, value) {
  if (!value) return html;
  const tag = `<meta property="${property}" content="${escapeAttr(value)}" />`;
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])(?=[^>]*\\bcontent=["'][^"']*["'])[^>]*>`, "i");
  if (pattern.test(html)) return html.replace(pattern, tag);
  const ogUrlPattern = /<meta\b(?=[^>]*\bproperty=["']og:url["'])(?=[^>]*\bcontent=["'][^"']*["'])[^>]*>/i;
  if (ogUrlPattern.test(html)) return html.replace(ogUrlPattern, `${tag}\n\t$&`);
  return html.replace(/<\/head>/i, `\t${tag}\n</head>`);
}

function setAuthorH1(html, h1) {
  if (!h1) return html;
  return html.replace(
    /<h4 class="elementor-author-box__name">\s*[\s\S]*?\s*<\/h4>/i,
    `<h1 class="elementor-author-box__name">${escapeAttr(h1)}</h1>`,
  );
}

function addIndustriesH1(html, h1) {
  if (!h1 || /<h1\b/i.test(html)) return html;
  return html.replace(
    /(<main\b[^>]*>)/i,
    `$1\n<h1 class="elementor-heading-title elementor-size-default" style="position:absolute;left:-9999px;">${escapeAttr(h1)}</h1>`,
  );
}

let changedFiles = 0;
const changes = [];

for (const [file, update] of Object.entries(pageUpdates)) {
  const filePath = path.join(pagesRoot, file);
  let html = await readFile(filePath, "utf8");
  const original = html;
  html = setTitle(html, update.title);
  html = setMetaDescription(html, update.description);
  html = setOg(html, "og:title", update.ogTitle || update.title);
  html = setOg(html, "og:description", update.ogDescription || update.description);
  html = setAuthorH1(html, update.h1);
  html = addIndustriesH1(html, update.h1);
  if (html !== original) {
    await writeFile(filePath, html, "utf8");
    changedFiles += 1;
    changes.push(file);
  }
}

console.log(JSON.stringify({ changedFiles, changes }, null, 2));
