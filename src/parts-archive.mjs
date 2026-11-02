const PARTS_PER_PAGE = 24;
const SITE_ROOT = "https://www.cncpioneer.com";
const PARTS_ROOT = "/custom-cnc-parts";
const PARTS_CANONICAL = `${SITE_ROOT}${PARTS_ROOT}/`;
const ASSET_CSS = "/mirror-parts-catalog.css";
const ASSET_JS = "/mirror-parts-catalog.js";

const CATEGORY_RULES = [
  ["pins", "Pins & Terminals", /\b(pin|pins|terminal|terminals|contact|connector|connectors)\b/i],
  ["bushings", "Bushings & Bearings", /\b(bushing|bushings|bearing|bearings|sleeve|sleeves)\b/i],
  ["housings", "Housings & Enclosures", /\b(housing|housings|enclosure|enclosures|case|cases|cover|covers|shell|shells)\b/i],
  ["fittings", "Fittings & Valves", /\b(fitting|fittings|valve|valves|adapter|adapters|coupling|couplings|flange|flanges)\b/i],
  ["shafts", "Shafts & Gears", /\b(shaft|shafts|gear|gears|wheel|wheels|pulley|pulleys)\b/i],
];

const CATEGORY_FALLBACK = {
  id: "precision-components",
  label: "Precision Components",
};

const PRODUCT_IMAGE_OVERRIDES = {
  "aluminum-cnc-machining-flanges": "/wp-content/uploads/2026/10/aluminum-flange-images/aluminum-flange-product-overview-v1.webp",
  "cnc-machining-for-aerospace-brackets": "/wp-content/uploads/2026/08/5-axis-aluminum-aerospace-structural-fitting.jpg",
  "5-axis-cnc-machining-mechanical-parts": "/wp-content/uploads/2026/09/5-axis-cnc-machined-mechanical-components.jpg",
  "5-axis-cnc-machining-for-mechanical-parts": "/wp-content/uploads/2026/09/5-axis-cnc-machined-mechanical-components.jpg",
  "aluminum-alloy-5-axis-cnc-machining": "/wp-content/uploads/2026/09/aluminum-alloy-5-axis-cnc-machined-components.jpg",
  "5-axis-aluminum-cnc-machining-parts": "/wp-content/uploads/2026/08/5-axis-aluminum-aerospace-structural-fitting.jpg",
  "5-axis-cnc-machining-aluminum-parts": "/wp-content/uploads/2026/08/5-axis-aluminum-aerospace-structural-fitting.jpg",
  "5-axis-cnc-machining-for-aluminum-structures": "/wp-content/uploads/2026/09/custom-cnc-5-axis-machining-for-aluminum-structures.jpg",
  "5-axis-cnc-machining-aerospace-components": "/wp-content/uploads/2026/09/aerospace-structural-brackets-fittings.jpg",
  "aluminum-cnc-turning-parts": "/wp-content/uploads/2026/08/hex-square-aluminum-turning-standoffs.jpg",
  "titanium-swiss-screw-parts": "/wp-content/uploads/2026/09/titanium-swiss-screw-parts-cutout.png",
  "titanium-swiss-screw-machined-parts": "/wp-content/uploads/2026/09/titanium-swiss-screw-parts-cutout.png",
};

const PRODUCT_TITLE_OVERRIDES = {
  "aluminum-cnc-machining-flanges": "Aluminum CNC Machining Flange",
  "threaded-bushing": "Custom Threaded Bushing",
  "swiss-machined-parts": "Swiss Machined Parts",
  "cnc-machining-for-aerospace-brackets": "CNC Machining For Aerospace Brackets",
  "electric-motor-stator-housing-machining": "Electric Motor Stator Housing Machining",
  "aluminum-alloy-5-axis-cnc-machining": "Aluminum Alloy 5-Axis CNC Machining",
  "aluminum-cnc-turning-parts": "Precision Aluminum CNC Turning Parts",
  "cnc-turning-precision-washers": "CNC Turning Precision Washers",
};

export function getPartEntries(modules) {
  const entries = Object.entries(modules)
    .map(([modulePath, html]) => {
      const slugMatch = modulePath.replaceAll("\\", "/").match(/custom-cnc-parts\/([^/]+)\/index\.html$/);
      if (!slugMatch) return null;

      const slug = slugMatch[1];
      const rawTitle = cleanTitle(extractTagText(html, "title"));
      if (!rawTitle) return null;
      const title = getProductTitleOverride(slug, rawTitle) || cleanProductTitle(rawTitle, slug);

      const description = extractMeta(html, "description");
      const imageInfo = extractImage(html, slug, rawTitle);
      const category = classifyPart(`${slug} ${title}`);

      return {
        slug,
        title,
        href: `${PARTS_ROOT}/${slug}`,
        image: imageInfo.src,
        imageQuality: imageInfo.quality,
        description,
        category: category.id,
        categoryLabel: category.label,
        searchText: normalizeSearchText(`${title} ${rawTitle} ${slug} ${description} ${category.label}`),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));

  applyProductImageOverrides(entries);

  const productImages = entries.filter((entry) => entry.imageQuality === "product" && entry.image);
  const productByCategory = new Map();
  for (const entry of productImages) {
    if (!productByCategory.has(entry.category)) productByCategory.set(entry.category, entry.image);
  }

  const firstProductImage = productImages[0]?.image || "/wp-content/uploads/2026/01/custom-cnc-machining-parts.jpg";
  for (const entry of entries) {
    if (entry.imageQuality === "product") continue;
    entry.image = productByCategory.get(entry.category) || firstProductImage;
  }

  return entries.map(({ imageQuality, ...entry }) => entry);
}

function applyProductImageOverrides(entries) {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));

  for (const [targetSlug, image] of Object.entries(PRODUCT_IMAGE_OVERRIDES)) {
    const target = bySlug.get(targetSlug);
    if (!target) continue;

    target.image = image;
    target.imageQuality = "product";
  }
}

export function getPartPageCount(parts) {
  return Math.max(1, Math.ceil(parts.length / PARTS_PER_PAGE));
}

export function getPartPageNumbers(parts) {
  const total = getPartPageCount(parts);
  return Array.from({ length: total }, (_, index) => index + 1);
}

export function renderPartsArchive(templateHtml, parts, page = 1) {
  const totalPages = getPartPageCount(parts);
  const currentPage = clampPage(page, totalPages);
  const updatedHead = updateHead(templateHtml, currentPage, totalPages);
  const withAssets = injectAssets(updatedHead, parts);

  if (currentPage === 1) {
    return insertHubCatalog(withAssets, parts, currentPage, totalPages);
  }

  return replaceMain(withAssets, renderArchiveMain(parts, currentPage, totalPages));
}

function renderArchiveMain(parts, page, totalPages) {
  const showing = getPageItems(parts, page);
  return `
<main id="content" class="site-main cncp-parts-archive-page">
  <section class="cncp-parts-archive-intro">
    <div class="cncp-parts-inner">
      <nav class="cncp-parts-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="${PARTS_ROOT}">Custom CNC Parts</a>
        <span aria-hidden="true">/</span>
        <span>Page ${page}</span>
      </nav>
      <p class="cncp-parts-kicker">Custom CNC Parts</p>
      <h1>Custom CNC Parts Library</h1>
      <p class="cncp-parts-summary">${parts.length} CNC part pages from the CNCPioneer machining archive.</p>
    </div>
  </section>
  ${renderCatalogSection(parts, showing, page, totalPages, "archive")}
</main>`;
}

function insertHubCatalog(html, parts, page, totalPages) {
  const section = renderCatalogSection(parts, getPageItems(parts, page), page, totalPages, "hub");
  const marker = /(\s*<div class="elementor-element elementor-element-78070a5\b)/i;
  if (marker.test(html)) {
    return html.replace(marker, `${section}$1`);
  }

  return html.replace(/<\/main>/i, `${section}</main>`);
}

function renderCatalogSection(parts, pageParts, page, totalPages, variant) {
  return `
  <section class="cncp-parts-catalog cncp-parts-catalog--${variant}" id="parts-catalog" data-parts-catalog data-page="${page}" data-per-page="${PARTS_PER_PAGE}" data-root="${PARTS_ROOT}">
    <div class="cncp-parts-inner">
      <div class="cncp-parts-heading">
        <div>
          <p class="cncp-parts-kicker">Custom CNC Parts</p>
          <h2>Explore Custom CNC Parts</h2>
        </div>
        <p class="cncp-parts-count" data-parts-count>${renderCount(pageParts.length ? (page - 1) * PARTS_PER_PAGE + 1 : 0, Math.min(page * PARTS_PER_PAGE, parts.length), parts.length)}</p>
      </div>
      <form class="cncp-parts-tools" data-parts-tools role="search">
        <label class="cncp-parts-search">
          <span class="screen-reader-text">Search custom CNC parts</span>
          <input type="search" name="q" data-parts-search placeholder="Search parts, materials or processes" autocomplete="off">
        </label>
        <label class="cncp-parts-filter">
          <span class="screen-reader-text">Filter by part type</span>
          <select name="type" data-parts-category>
            <option value="all">All part types</option>
            ${renderCategoryOptions(parts)}
          </select>
        </label>
      </form>
      <div class="cncp-parts-grid" data-parts-results>
        ${pageParts.map(renderPartCard).join("")}
      </div>
      <p class="cncp-parts-empty" data-parts-empty hidden>No matching CNC parts.</p>
      ${renderPagination(page, totalPages)}
    </div>
  </section>`;
}

function renderPartCard(part) {
  return `
        <a class="cncp-parts-card" href="${escapeAttr(part.href)}" data-category="${escapeAttr(part.category)}">
          <span class="cncp-parts-card-media">
            <img src="${escapeAttr(part.image)}" alt="${escapeAttr(part.title)}" loading="lazy" decoding="async">
          </span>
          <span class="cncp-parts-card-body">
            <span class="cncp-parts-card-type">${escapeHtml(part.categoryLabel)}</span>
            <span class="cncp-parts-card-title">${escapeHtml(part.title)}</span>
            <span class="cncp-parts-card-link">View part</span>
          </span>
        </a>`;
}

function renderCategoryOptions(parts) {
  const counts = new Map();
  for (const part of parts) {
    counts.set(part.category, {
      label: part.categoryLabel,
      count: (counts.get(part.category)?.count || 0) + 1,
    });
  }

  const knownIds = [...CATEGORY_RULES.map(([id]) => id), CATEGORY_FALLBACK.id];
  return knownIds
    .filter((id) => counts.has(id))
    .map((id) => {
      const item = counts.get(id);
      return `<option value="${escapeAttr(id)}">${escapeHtml(item.label)} (${item.count})</option>`;
    })
    .join("");
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) return "";

  const links = [];
  if (page > 1) {
    links.push(`<a class="cncp-parts-page-link cncp-parts-page-link--control" href="${pageHref(page - 1)}" rel="prev">Prev</a>`);
  }

  for (const item of paginationItems(page, totalPages)) {
    if (item === "...") {
      links.push(`<span class="cncp-parts-page-ellipsis" aria-hidden="true">...</span>`);
      continue;
    }

    if (item === page) {
      links.push(`<span class="cncp-parts-page-link is-current" aria-current="page">${item}</span>`);
    } else {
      links.push(`<a class="cncp-parts-page-link" href="${pageHref(item)}">${item}</a>`);
    }
  }

  if (page < totalPages) {
    links.push(`<a class="cncp-parts-page-link cncp-parts-page-link--control" href="${pageHref(page + 1)}" rel="next">Next</a>`);
  }

  return `<nav class="cncp-parts-pagination" data-parts-pagination aria-label="Custom CNC parts pages">${links.join("")}</nav>`;
}

function paginationItems(page, totalPages) {
  const items = new Set([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) items.add(2).add(3);
  if (page >= totalPages - 2) items.add(totalPages - 1).add(totalPages - 2);

  const sorted = [...items]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  for (const item of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && item - previous > 1) {
      result.push("...");
    }
    result.push(item);
  }
  return result;
}

function pageHref(page) {
  return page === 1 ? PARTS_ROOT : `${PARTS_ROOT}/page/${page}`;
}

function getPageItems(parts, page) {
  const start = (page - 1) * PARTS_PER_PAGE;
  return parts.slice(start, start + PARTS_PER_PAGE);
}

function renderCount(start, end, total) {
  if (!total) return "0 CNC parts";
  return `Showing ${start}-${end} of ${total} CNC parts`;
}

function clampPage(page, totalPages) {
  const parsed = Number.parseInt(page, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(parsed, 1), totalPages);
}

function updateHead(html, page, totalPages) {
  const title = page === 1 ? "Custom CNC Parts Library | CNCPioneer" : `Custom CNC Parts Library - Page ${page} | CNCPioneer`;
  const description = page === 1
    ? "Browse CNCPioneer custom CNC part projects with representative machined components, materials, and precision manufacturing examples."
    : `Browse CNCPioneer custom CNC part projects on page ${page} of ${totalPages}, with machined components, material options, tolerances, finishes, and manufacturing examples.`;
  const canonical = page === 1 ? PARTS_CANONICAL : `${SITE_ROOT}${PARTS_ROOT}/page/${page}/`;
  let output = html;

  output = replaceTag(output, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  output = replaceMeta(output, "description", description);
  output = replaceProperty(output, "og:title", title);
  output = replaceProperty(output, "og:description", description);
  output = replaceProperty(output, "og:url", canonical);
  output = replaceCanonical(output, canonical);
  output = output.replace(/<link\b[^>]*rel=["'](?:prev|next)["'][^>]*>\s*/gi, "");

  const relLinks = [
    page > 1 ? `<link rel="prev" href="${page === 2 ? PARTS_CANONICAL : `${SITE_ROOT}${PARTS_ROOT}/page/${page - 1}/`}">` : "",
    page < totalPages ? `<link rel="next" href="${SITE_ROOT}${PARTS_ROOT}/page/${page + 1}/">` : "",
  ].filter(Boolean).join("\n");

  if (relLinks) {
    output = output.replace(/<\/head>/i, `${relLinks}\n</head>`);
  }

  return output;
}

function injectAssets(html, parts) {
  let output = html;
  if (!output.includes(ASSET_CSS)) {
    output = output.replace(/<\/head>/i, `<link rel="stylesheet" id="mirror-parts-catalog-css" href="${ASSET_CSS}">\n</head>`);
  }

  if (!output.includes("parts-catalog-data")) {
    const json = JSON.stringify(parts).replaceAll("<", "\\u003c");
    output = output.replace(/<\/body>/i, `<script type="application/json" id="parts-catalog-data">${json}</script>\n<script defer src="${ASSET_JS}"></script>\n</body>`);
  }

  return output;
}

function replaceMain(html, mainHtml) {
  if (/<main\b[\s\S]*?<\/main>/i.test(html)) {
    return html.replace(/<main\b[\s\S]*?<\/main>/i, mainHtml);
  }
  return html.replace(/<footer\b/i, `${mainHtml}\n<footer`);
}

function replaceTag(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function replaceMeta(html, name, content) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*name=["']${escapeRegExp(name)}["'])[^>]*>`, "i");
  const replacement = `<meta name="${escapeAttr(name)}" content="${escapeAttr(content)}">`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function replaceProperty(html, property, content) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*property=["']${escapeRegExp(property)}["'])[^>]*>`, "i");
  const replacement = `<meta property="${escapeAttr(property)}" content="${escapeAttr(content)}">`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function replaceCanonical(html, href) {
  const pattern = /<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i;
  const replacement = `<link rel="canonical" href="${escapeAttr(href)}">`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : "";
}

function extractMeta(html, name) {
  const tag = findMetaTag(html, "name", name);
  return tag ? decodeHtml(getAttr(tag, "content") || "") : "";
}

function findMetaTag(html, attr, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.find((tag) => (getAttr(tag, attr) || "").toLowerCase() === value.toLowerCase()) || "";
}

function cleanTitle(title) {
  return title
    .replace(/\s*[-|]\s*CNCPioneer\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanProductTitle(title, slug = "") {
  const normalized = title
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const candidates = [
    ...normalized
    .split(/\s+(?:\||-|:)\s+/)
      .map((item) => item.trim()),
    titleFromSlug(slug),
  ].filter(Boolean);

  const cleaned = candidates
    .map((item) => cleanProductTitleCandidate(item))
    .filter((item) => item.length > 1);

  const productName = cleaned.find((item) => !isGenericProductTitle(item));
  if (productName) return productName;

  const softName = candidates
    .map((item) => cleanProductTitleCandidate(item, { keepProcessWords: true }))
    .find((item) => !isGenericProductTitle(item));

  return softName || cleaned[0] || cleanProductTitleCandidate(normalized, { keepProcessWords: true }) || normalized;
}

function getProductTitleOverride(slug, rawTitle) {
  if (PRODUCT_TITLE_OVERRIDES[slug]) return PRODUCT_TITLE_OVERRIDES[slug];
  if (/\bcnc\s+turning\s+precision\s+washers\b/i.test(rawTitle)) return "CNC Turning Precision Washers";
  return "";
}

function cleanProductTitleCandidate(title, options = {}) {
  const keepProcessWords = Boolean(options.keepProcessWords);
  let value = String(title || "")
    .replace(/\b(?:made\s+in\s+china|china|online|wholesale|quote|quotation|price|cost)\b/gi, " ")
    .replace(/\b(?:customized|bespoke|prototype|prototyping)\b/gi, " ")
    .replace(/\s*,\s*(?:custom|precision|oem|china|manufacturer|supplier).*$/i, "")
    .replace(/\([^)]*(?:manufacturer|supplier|service|machining|cnc|factory|quote)[^)]*\)/gi, " ")
    .replace(/\b(?:custom|precision|oem|high\s*precision|high-precision)\b/gi, " ")
    .replace(/\b(?:manufacturer|manufacturers|supplier|suppliers|service|services|factory|company)\b/gi, " ");

  if (!keepProcessWords) {
    value = value
      .replace(/\b(?:5\s*axis\s+cnc\s+machining|5-axis\s+cnc\s+machining|five\s*axis\s+cnc\s+machining|five-axis\s+cnc\s+machining)\b/gi, " ")
      .replace(/\b(?:5\s*axis|5-axis|five\s*axis|five-axis)\b/gi, " ")
      .replace(/\b(?:cnc|c\.n\.c\.)\b/gi, " ")
      .replace(/\b(?:swiss\s+machining|machined|machining|milling|turning|fabrication|manufacturing)\b/gi, " ");
  } else {
    value = value.replace(/\b(?:manufacturing)\b/gi, " ");
  }

  value = value
    .replace(/\b(?:for|of|by|with)\b\s*$/gi, " ")
    .replace(/^\s*\b(?:for|of|by|with)\b\s*/gi, " ")
    .replace(/\b(parts?|components?)\s+\1\b/gi, "$1")
    .replace(/\s+[|/:]\s+/g, " ")
    .replace(/\s*&\s*$/g, " ")
    .replace(/^\s*&\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  value = value.replace(/\b([A-Z]{2,})\s+\1\b/g, "$1");
  return value;
}

function titleFromSlug(slug) {
  return titleCase(String(slug || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function titleCase(value) {
  const smallWords = new Set(["and", "or", "for", "of", "with", "by"]);
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && smallWords.has(word)) return word;
      if (word === "cnc") return "CNC";
      if (word === "oem") return "OEM";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function isGenericProductTitle(title) {
  const normalized = normalizeSearchText(title);
  return [
    "part",
    "parts",
    "component",
    "components",
    "product",
    "products",
    "machining",
    "manufacturing",
    "cnc parts",
    "cnc machining",
    "cnc machining parts",
    "custom parts",
    "precision parts",
  ].includes(normalized);
}

function extractImage(html, slug, title) {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || "";
  const bestMainImage = chooseBestImage(collectImages(main), slug, title);
  if (bestMainImage.quality === "product") return bestMainImage;

  const bestBodyImage = chooseBestImage(collectImages(html), slug, title);
  if (bestBodyImage.quality === "product") return bestBodyImage;

  if (bestMainImage.src) return bestMainImage;
  if (bestBodyImage.src) return bestBodyImage;

  const preload = collectPreloadImages(html)[0];
  return {
    src: preload || "/wp-content/uploads/2026/01/custom-cnc-machining-parts.jpg",
    quality: "fallback",
  };
}

function collectPreloadImages(html) {
  return (html.match(/<link\b[^>]*>/gi) || [])
    .filter((tag) => (getAttr(tag, "as") || "").toLowerCase() === "image")
    .map((tag) => getAttr(tag, "href"))
    .filter(isCandidateImage);
}

function collectImages(html) {
  const candidates = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const context = getImageContext(html, match.index || 0, tag.length);
    for (const attr of ["data-lazy-src", "data-src", "src"]) {
      const src = getAttr(tag, attr);
      if (isCandidateImage(src)) {
        candidates.push({
          src,
          alt: getAttr(tag, "alt"),
          title: getAttr(tag, "title"),
          className: getAttr(tag, "class"),
          context,
        });
      }
    }
  }

  for (const match of html.matchAll(/url\(["']?(\/wp-content\/uploads\/[^)"']+)["']?\)/gi)) {
    if (isCandidateImage(match[1])) {
      candidates.push({
        src: match[1],
        alt: "",
        title: "",
        className: "background-image",
        context: getImageContext(html, match.index || 0, match[0].length),
      });
    }
  }

  const seen = new Set();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.src)) return false;
    seen.add(candidate.src);
    return true;
  });
}

function isCandidateImage(src) {
  if (!src || !src.startsWith("/wp-content/uploads/")) return false;
  if (!/\.(?:jpg|jpeg|png|webp|gif)$/i.test(src.split("?")[0])) return false;
  return !/(?:logo|site-icon|favicon|avatar|placeholder)/i.test(src);
}

function chooseBestImage(candidates, slug, title) {
  if (!candidates.length) return { src: "", quality: "missing" };

  const keyTerms = getProductTerms(`${slug} ${title}`);
  const scored = candidates
    .map((candidate, index) => ({
      ...candidate,
      ...analyzeImage(candidate, keyTerms, index),
    }))
    .sort((a, b) => b.score - a.score);

  const productOnly = scored.filter((candidate) => candidate.productLike && !candidate.sceneLike);
  if (productOnly.length) return { src: productOnly[0].src, quality: "product" };

  const productSection = scored.filter((candidate) => candidate.productContext && !candidate.hardScene);
  if (productSection.length) return { src: productSection[0].src, quality: "product" };

  const acceptable = scored.filter((candidate) => !candidate.sceneLike && !candidate.hardScene);
  if (acceptable.length) return { src: acceptable[0].src, quality: "fallback" };

  return { src: scored[0]?.src || "", quality: "scene" };
}

function analyzeImage(candidate, keyTerms, index) {
  const sourceText = normalizeSearchText([
    candidate.src.split("/").pop() || "",
    candidate.alt,
    candidate.title,
    candidate.className,
    candidate.context,
  ].join(" "));

  const genericProductWords = [
    "part",
    "parts",
    "component",
    "components",
    "product",
    "products",
    "collection",
  ];

  const strongProductWords = [
    "bushing",
    "bushings",
    "pin",
    "pins",
    "shaft",
    "shafts",
    "housing",
    "housings",
    "fitting",
    "fittings",
    "valve",
    "valves",
    "gear",
    "gears",
    "bracket",
    "brackets",
    "connector",
    "connectors",
    "terminal",
    "terminals",
    "adapter",
    "adapters",
    "flange",
    "flanges",
    "sleeve",
    "sleeves",
    "body",
    "bodies",
    "nut",
    "nuts",
    "screw",
    "screws",
    "bolt",
    "bolts",
    "impeller",
    "impellers",
    "block",
    "blocks",
    "manifold",
    "manifolds",
    "nozzle",
    "nozzles",
    "spacer",
    "spacers",
    "plate",
    "plates",
  ];

  const processWords = [
    "factory",
    "workshop",
    "machine",
    "machining",
    "milling",
    "turning",
    "lathe",
    "swiss",
    "process",
    "service",
    "manufacturing",
    "manufacturer",
    "spindle",
    "tool",
    "cutting",
    "drilling",
    "coolant",
    "fixture",
    "equipment",
  ];

  const applicationWords = [
    "application",
    "applications",
    "industry",
    "industries",
    "aerospace",
    "aircraft",
    "automotive",
    "medical",
    "semiconductor",
    "robotics",
    "robot",
    "robots",
    "oil",
    "gas",
    "defense",
    "drone",
    "drones",
    "consumer",
    "electronics",
    "railway",
    "forklift",
    "satellite",
    "spacecraft",
    "assembly",
    "assemblies",
    "pcb",
    "circuit",
    "circuits",
    "electronics",
    "electronic",
    "inspection",
    "microscope",
    "solder",
    "soldering",
    "probe",
    "testing",
    "test",
    "hand",
    "hands",
    "operator",
    "technician",
  ];

  const productContext = /\b(?:parts?\s+(?:we\s+)?(?:produce|manufacture|machine|provide)|products?|components?\s+(?:we\s+)?(?:produce|manufacture|machine)|available\s+parts?|part\s+types?|finished\s+parts?|machined\s+parts?\s+collection)\b/i
    .test(candidate.context || "");
  const sceneContext = /\b(?:industries?|applications?|factory|workshop|equipment|workflow|process|capabilities|certifications?|materials?|why\s+choose|quality|inspection|delivery)\b/i
    .test(candidate.context || "");

  let score = 100 - index;
  const genericMatches = genericProductWords.filter((word) => sourceText.includes(word)).length;
  const strongMatches = strongProductWords.filter((word) => sourceText.includes(word)).length;
  const processMatches = processWords.filter((word) => sourceText.includes(word)).length;
  const applicationMatches = applicationWords.filter((word) => sourceText.includes(word)).length;
  const keyMatches = keyTerms.filter((term) => sourceText.includes(term)).length;

  score += genericMatches * 12;
  score += strongMatches * 40;
  score += keyMatches * 18;
  if (candidate.alt || candidate.title) score += 12;
  if (productContext) score += 140;
  if (sceneContext) score -= 120;

  if (processMatches && strongMatches === 0 && !productContext) score -= processMatches * 80;
  if (processMatches && strongMatches === 0 && productContext) score -= processMatches * 35;
  if (processMatches && strongMatches > 0) score -= processMatches * 12;
  if (applicationMatches && strongMatches === 0 && !productContext) score -= applicationMatches * 55;
  if (applicationMatches && sceneContext) score -= applicationMatches * 20;
  if (candidate.className === "background-image") score -= 80;
  if (/(?:hero|banner|factory|workshop)/i.test(candidate.src)) score -= 70;
  if (/(?:machining|milling|turning|manufacturing|lathe|machine|spindle|cutting|coolant|drilling|workshop|factory)/i.test(candidate.src) && strongMatches === 0) score -= 120;
  if (/(?:application|industry|industries|aerospace|automotive|medical|semiconductor|robotics|oil-gas|defense|drone|railway|satellite|spacecraft|pcb|circuit|electronics|inspection|microscope|solder|probe|testing)/i.test(candidate.src) && strongMatches === 0) score -= 100;

  const hardScene = !productContext && strongMatches === 0 && (
    processMatches > 0 ||
    sceneContext ||
    /(machining|milling|turning|manufacturing|lathe|machine|spindle|cutting|coolant|drilling|application|industry|factory|workshop|equipment|pcb|circuit|electronics|inspection|microscope|solder|probe|testing)/i.test(candidate.src)
  );

  return {
    score,
    productLike: productContext || strongMatches > 0 || (genericMatches > 0 && keyMatches > 0 && !sceneContext),
    productContext,
    sceneLike: hardScene || sceneContext || (applicationMatches > 0 && strongMatches === 0),
    hardScene,
  };
}

function getImageContext(html, index, length) {
  const before = html.slice(Math.max(0, index - 2600), index);
  const after = html.slice(index + length, Math.min(html.length, index + length + 700));
  const headings = [...before.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)];
  const heading = headings.length ? stripTags(headings[headings.length - 1][1]) : "";
  return normalizeContext(`${heading} ${stripTags(before.slice(-900))} ${stripTags(after)}`);
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function normalizeContext(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getProductTerms(value) {
  const stopWords = new Set([
    "5",
    "axis",
    "cnc",
    "custom",
    "machining",
    "milling",
    "turning",
    "swiss",
    "service",
    "services",
    "manufacturer",
    "manufacturing",
    "parts",
    "part",
    "component",
    "components",
    "for",
    "and",
    "with",
    "oem",
  ]);

  return [...new Set(normalizeSearchText(value).split(" "))]
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function classifyPart(value) {
  for (const [id, label, pattern] of CATEGORY_RULES) {
    if (pattern.test(value)) return { id, label };
  }
  return CATEGORY_FALLBACK;
}

function normalizeSearchText(value) {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAttr(tag, name) {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(pattern);
  return match ? decodeHtml(match[2]) : "";
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
