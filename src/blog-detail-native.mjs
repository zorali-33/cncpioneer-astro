import { applyContextualBlogLinks } from "./blog-context-links.mjs";
import { blogContextLinks } from "./data/blogContextLinks.mjs";
import { amendBlogContent, blogContentAmendments, blogNextSteps } from "./data/blogContentAmendments.mjs";
import { getReviewedSeo } from "./data/pageSeoOverrides.mjs";
import { blogSeoOverrides } from "./data/blogSeoOverrides.mjs";
import { getBlogArticles } from "./blog-archive.mjs";
import { rankRelatedArticles } from "./blog-related.mjs";
import { blogEditorialOverrides } from "./blog-editorial-overrides.mjs";
import { repairBlogArticleLinks, repairBlogLinkIds, repairBlogMedia } from "./blog-link-repairs.mjs";
import { applyReviewedInternalLinks } from "./blog-internal-links.mjs";
import { blogConsolidatedArticles } from "./data/blogConsolidatedArticles.mjs";

export const nativeStaticBlogSlugs = new Set([
  "5-axis-cnc-machining-manufacturers-in-china",
]);

export const ryanAuthorBio = "Ryan Wang is the CNC Machining Expert at Cncpioneer, with over 15 years of hands-on experience as a CNC programmer, process engineer, senior machinist, and precision manufacturing specialist. He has helped companies in aerospace, automotive, medical, and electronics sectors achieve micron-level tolerances and scale from prototypes to high-volume production. Ryan is also an experienced instructor in advanced CNC techniques, particularly five-axis machining and challenging materials.";

const siteUrl = "https://www.cncpioneer.com";

const blogAuthors = {
  "ryan-wang": {
    name: "Ryan Wang",
    image: "/wp-content/uploads/2026/03/ryan-wang-100X100.jpg",
    bio: ryanAuthorBio,
  },
  "david-li": {
    name: "David Li",
    image: "/wp-content/uploads/2026/03/david-li-150x150-1.jpg",
    bio: "David Li is the CNC Machining Expert at Cncpioneer, with 6 years of frontline experience as a CNC programmer, process engineer, and precision machining specialist. He excels in translating complex machining challenges into clear, actionable advice for operators, engineers, and manufacturers. Skilled in Mastercam, UG (NX), PowerMill, and major controls (Haas/Fanuc), David delivers in-depth articles featuring verified cutting parameters, step-by-step troubleshooting methods, and real-world efficiency optimizations drawn directly from production environments. His practical insights help teams reduce waste, improve surface finishes, and solve common shop-floor issues in milling, turning, and multi-axis setups.",
  },
};

export function getBlogAuthor(slug) {
  const author = blogAuthors[slug];
  if (!author) throw new Error(`Unknown native blog author: ${slug}`);
  return { ...author, href: `/author/${slug}` };
}

export function getNativeBlogRoutes(pages) {
  return getBlogDetailEntries(pages)
    .filter((entry) => Object.hasOwn(blogAuthors, entry.authorSlug))
    .map((entry) => `blog/${entry.slug}`);
}

export function getNativeBlogEntries(pages) {
  return getBlogDetailEntries(pages)
    .filter((entry) => Object.hasOwn(blogAuthors, entry.authorSlug) && !nativeStaticBlogSlugs.has(entry.slug));
}

export function getBlogDetailEntries(pages) {
  const articles = getBlogArticles(pages);
  const htmlBySlug = new Map(
    Object.entries(pages).map(([file, html]) => [slugFromFile(file), { file, html }]),
  );

  return articles.map((article) => {
    const source = htmlBySlug.get(article.slug);
    if (!source) throw new Error(`Missing mirrored HTML for blog article: ${article.slug}`);

    return {
      ...article,
      file: source.file,
      html: source.html,
      detail: parseBlogDetail(source.html, article),
    };
  });
}

export function parseBlogDetail(html, article) {
  const editorial = blogConsolidatedArticles[article.slug] || blogEditorialOverrides[article.slug];
  const originalTitle = cleanText(editorial ? `${editorial.title} | CNCPioneer` : meta(html, "og:title") || titleTag(html));
  const seo = { ...blogSeoOverrides[article.slug], ...getReviewedSeo(`/blog/${article.slug}`) };
  const title = seo.title || originalTitle;
  const articleTitle = cleanText(article.displayTitle || originalTitle.replace(/(?:\s+-|\s+\|)\s*CNCPioneer$/i, ""));
  const description = seo.description || editorial?.description || decodeHtml(optionalNameMeta(html, "description"));
  const ogDescription = seo.description || editorial?.description || decodeHtml(optionalMeta(html, "og:description") || description);
  const canonicalPath = `/blog/${article.slug}`;
  const publishedTime = optionalMeta(html, "article:published_time") || article.published;
  const modifiedTime = (blogContextLinks[article.slug] ? "2026-10-23T00:00:00+08:00" : null) || ((blogContentAmendments[article.slug] || blogNextSteps[article.slug]) ? "2026-10-22T00:00:00+08:00" : null) || editorial?.modifiedTime || optionalMeta(html, "article:modified_time");
  // The archive has already selected an existing article image when the old OG file is missing.
  const originalImage = optionalMeta(html, "og:image");
  const image = editorial?.image || article.image || originalImage;
  const retainOriginalDimensions = !editorial?.image && image === originalImage;
  const imageWidth = editorial?.imageWidth || (retainOriginalDimensions ? optionalMeta(html, "og:image:width") : undefined);
  const imageHeight = editorial?.imageHeight || (retainOriginalDimensions ? optionalMeta(html, "og:image:height") : undefined);
  const imageType = editorial?.imageType || ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" })[image.split(".").pop()?.toLowerCase()];
  const readingTime = editorial ? `${Math.ceil(cleanText(editorial.articleHtml).split(/\s+/).length / 200)} minutes` : optionalNameMeta(html, "twitter:data2");
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/i)?.[1] || "blog-detail-page single single-post";
  const preparedHtml = prepareArticleHtml(editorial?.articleHtml || extractArticleHtml(html), article.slug, editorial?.reviewedTechnical);
  const amendedHtml = editorial?.reviewedTechnical ? preparedHtml : applyContextualBlogLinks(amendBlogContent(preparedHtml, article.slug), article.slug);
  const articleHtml = repairBlogMedia(repairBlogLinkIds(amendedHtml), article.slug);
  const tocItems = extractTocItems(articleHtml);

  return {
    authorSlug: article.authorSlug,
    contributors: editorial?.contributors || [],
    title,
    articleTitle,
    description,
    ogDescription,
    canonical: `${siteUrl}${canonicalPath}`,
    canonicalPath,
    commentsFeed: `${siteUrl}${canonicalPath}/feed`,
    publishedTime,
    modifiedTime,
    publishedDate: dateOnly(publishedTime),
    publishedTimeLabel: formatTime(publishedTime),
    image,
    imageWidth,
    imageHeight,
    imageType,
    readingTime,
    bodyClass,
    articleHtml,
    tocItems,
  };
}

export function relatedPostsFor(currentSlug, articles, count = 3) {
  return rankRelatedArticles(currentSlug, articles, count)
    .map((article) => ({
      title: cleanText(article.displayTitle || article.title),
      href: `/blog/${article.slug}`,
      image: article.image,
      alt: cleanText(article.displayTitle || article.title),
    }));
}

function prepareArticleHtml(html, slug, reviewedTechnical = false) {
  const levelMaps = {
    "cnc-ev-motor-housings": { 3: 2 },
    "cnc-electronic-housings": { 3: 2 },
    "cnc-heat-sink-manufacturing": { 3: 2, 4: 3 },
    "choose-cnc-machining-company": { 3: 2, 4: 2 },
    "robot-hands": { 4: 3 },
    "building-a-humanoid-robot": { 4: 3 },
    "inconel-vs-titanium": { 4: 3 },
    "zero-waste-cnc-machining": { 4: 3 },
    "cnc-custom-parts-prototyping": { 4: 3 },
  };
  const levels = levelMaps[slug] || {};
  let result = html.replace(/<h([2-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (heading, original, attributes, body) => {
    const text = cleanText(body);
    let level = levels[original] || Number(original);
    if (slug === "cnc-custom-parts-prototyping" && text === "What Is CNC Custom Parts Prototyping?") level = 2;
    if (slug === "oil-gas-cnc-machining-parts" && ["Oil & Gas CNC Parts Characteristics and Challenges", "Carbon Steel CNC Machining Process"].includes(text)) level = 2;
    return `<h${level}${attributes}>${body}</h${level}>`;
  });

  // Keep wide data tables readable without changing the archived source HTML.
  result = result.replace(/<figure\b([^>]*)>(\s*<table\b[\s\S]*?<\/table>\s*)<\/figure>/gi, (figure, attributes, table) => {
    if (!/\bwp-block-table\b/.test(attributes)) return figure;
    const columns = Math.max(0, ...[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
      [...row[1].matchAll(/<t[hd]\b([^>]*)>/gi)].reduce((total, cell) => total + Number(cell[1].match(/\bcolspan\s*=\s*["']?(\d+)/i)?.[1] || 1), 0)));
    if (columns < 4) return figure;
    const wideTable = table.replace(/<table\b([^>]*)>/i, (_, attrs) => `<table${attrs} style="min-width:${columns * 104}px">`);
    return `<figure${attributes} tabindex="0" role="region" aria-label="Scrollable comparison table">${wideTable}</figure>`;
  });
  // Resolve section links in the initial HTML, including direct fragment visits.
  let sectionIndex = 0;
  result = result.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (heading, attributes, body) => {
    sectionIndex += 1;
    if (/\bid=/.test(attributes)) return heading;
    return `<h2${attributes} id="section-${sectionIndex}-${slugify(cleanText(body)) || "heading"}">${body}</h2>`;
  });
  const repaired = repairBlogArticleLinks(result, slug);
  return blogConsolidatedArticles[slug] || reviewedTechnical ? repaired : applyReviewedInternalLinks(repaired, slug);
}

function slugFromFile(file) {
  return String(file).replace(/\\/g, "/").split("/").at(-2);
}

function meta(html, property) {
  const value = optionalMeta(html, property);
  if (!value) throw new Error(`Missing ${property} in blog post`);
  return value;
}

function optionalMeta(html, property) {
  return html.match(new RegExp(`<meta\\s+property="${escapeRegExp(property)}"\\s+content="([^"]*)"`, "i"))?.[1] || "";
}

function optionalNameMeta(html, name) {
  return html.match(new RegExp(`<meta\\s+name="${escapeRegExp(name)}"\\s+content="([^"]*)"`, "i"))?.[1] || "";
}

function titleTag(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
}

function extractArticleHtml(html) {
  const widgetStart = html.indexOf('data-widget_type="theme-post-content.default"');
  if (widgetStart < 0) throw new Error("Missing theme post content widget");

  const containerStart = html.indexOf('<div class="elementor-widget-container">', widgetStart);
  if (containerStart < 0) throw new Error("Missing theme post content container");

  const contentStart = html.indexOf(">", containerStart) + 1;
  const contentEnd = matchingDivEnd(html, containerStart);
  return html.slice(contentStart, contentEnd).trim();
}

function matchingDivEnd(html, startIndex) {
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = startIndex;
  let depth = 0;
  let match;

  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return match.index;
    } else {
      depth += 1;
    }
  }

  throw new Error("Unable to find closing div for article content");
}

function extractTocItems(articleHtml) {
  const headings = [...articleHtml.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  return headings.map((match, index) => {
    const text = cleanText(match[1]);
    return {
      id: match[0].match(/^<h2\b[^>]*\bid="([^"]*)"/i)?.[1] || `section-${index + 1}-${slugify(text) || "heading"}`,
      text,
    };
  });
}

function cleanText(value) {
  return decodeHtml(String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dateOnly(value) {
  return String(value || "").split("T")[0] || "";
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date).toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
