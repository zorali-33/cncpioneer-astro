import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const reportPath = path.join(reportDir, "T22-wp-runtime-cleanup-report.md");
const changesPath = path.join(reportDir, "T22-wp-runtime-cleanup-changes.csv");

const blockPatterns = [
  {
    name: "wp_plugin_script_src",
    pattern: /<script\b(?=[^>]*\bsrc=["'][^"']*\/wp-content\/plugins\/[^"']*["'])[^>]*>\s*<\/script>\s*/gi,
  },
  {
    name: "wp_includes_script_src",
    pattern: /<script\b(?=[^>]*\bsrc=["'][^"']*\/wp-includes\/[^"']*["'])[^>]*>\s*<\/script>\s*/gi,
  },
  {
    name: "google_sitekit_gtag_src",
    pattern: /<script\b(?=[^>]*\bid=["']google_gtagjs-js["'])(?=[^>]*\bsrc=["'][^"']*googletagmanager\.com\/gtag\/js[^"']*["'])[^>]*>\s*<\/script>\s*/gi,
  },
  {
    name: "runtime_script_block",
    pattern: /<script\b(?=[^>]*\bid=["'](?:google_gtagjs-js-after|elementor-frontend-js-extra|elementor-frontend-js-before|hostinger-reach-subscription-block-view-js-extra|rocket-browser-checker-js-after|rocket-preload-links-js-extra|rocket-preload-links-js-after|rocket_lazyload_css-js-extra|rocket_lazyload_css-js-after|eael-general-js-extra|elementor-pro-frontend-js-before)["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
  },
  {
    name: "speculationrules_script",
    pattern: /<script\b(?=[^>]*\btype=["']speculationrules["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
  },
  {
    name: "rocket_pairs_script",
    pattern: /<script\b(?=[^>]*\btype=["']application\/javascript["'])[^>]*>\s*const\s+rocket_pairs[\s\S]*?<\/script>\s*/gi,
  },
  {
    name: "rocket_lazyload_options",
    pattern: /<script>\s*window\.lazyLoadOptions[\s\S]*?<\/script>\s*/gi,
  },
  {
    name: "rocket_beacon_data",
    pattern: /<script>\s*var\s+rocket_beacon_data\s*=[\s\S]*?<\/script>\s*/gi,
  },
  {
    name: "wp_generator_meta",
    pattern: /<meta\b(?=[^>]*\bname=["']generator["'])(?=[^>]*\bcontent=["']WordPress[^"']*["'])[^>]*>\s*/gi,
  },
  {
    name: "rocket_generator_meta",
    pattern: /<meta\b(?=[^>]*\bname=["']generator["'])(?=[^>]*\bcontent=["']WP Rocket[^"']*["'])[^>]*>\s*/gi,
  },
  {
    name: "wp_plugin_comments",
    pattern: /<!--\s*(?:This site is optimized with the Yoast SEO plugin[\s\S]*?\/ Yoast SEO plugin\.|This website is like a Rocket[\s\S]*?)-->\s*/gi,
  },
  {
    name: "rocket_lazyload_nojs",
    pattern: /<noscript>\s*<style\b[^>]*\bid=["']rocket-lazyload-nojs-css["'][^>]*>[\s\S]*?<\/style>\s*<\/noscript>\s*/gi,
  },
];

const changes = [];
for (const file of findFiles(mirroredRoot, /^index\.html$/)) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  const counts = {};

  after = promoteLazyImages(after, counts);
  after = promoteLazyIframes(after, counts);
  after = promoteLazyBackgrounds(after, counts);

  for (const item of blockPatterns) {
    let count = 0;
    after = after.replace(item.pattern, () => {
      count += 1;
      return "";
    });
    if (count) counts[item.name] = count;
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changes.push({
      file: rel(file),
      ...Object.fromEntries(["lazy_images_promoted", "lazy_iframes_promoted", "lazy_backgrounds_promoted", "lazy_srcsets_promoted", "lazy_attrs_removed", ...blockPatterns.map((item) => item.name)].map((name) => [name, counts[name] || 0])),
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    });
  }
}

const headers = ["file", "lazy_images_promoted", "lazy_iframes_promoted", "lazy_backgrounds_promoted", "lazy_srcsets_promoted", "lazy_attrs_removed", ...blockPatterns.map((item) => item.name), "total"];
writeCsv(changesPath, changes, headers);

const totals = {};
for (const change of changes) {
  for (const header of headers.slice(1, -1)) {
    totals[header] = (totals[header] || 0) + Number(change[header] || 0);
  }
}

fs.writeFileSync(reportPath, `# T22 WordPress Runtime Cleanup

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Removed WordPress/plugin runtime JavaScript and generator traces from mirrored source pages while retaining Elementor DOM classes and CSS needed for visual parity.

## Summary

- Files changed: ${changes.length}
- Total cleanup actions: ${Object.values(totals).reduce((sum, value) => sum + value, 0)}

## Cleanup Counts

${formatCounts(totals)}

## Notes

- Lazy images were promoted from \`data-lazy-src\` to real \`src\` before WP Rocket lazyload scripts were removed.
- Elementor class names and page CSS remain because the mirrored pages still depend on them for layout and 1:1 visual styling.

## Outputs

- \`seo-migration/reports/T22-wp-runtime-cleanup-report.md\`
- \`seo-migration/reports/T22-wp-runtime-cleanup-changes.csv\`
`);

console.log(JSON.stringify({
  filesChanged: changes.length,
  totalActions: Object.values(totals).reduce((sum, value) => sum + value, 0),
  totals,
}, null, 2));

function promoteLazyImages(html, counts) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;
    const lazySrc = getAttr(next, "data-lazy-src");
    const lazySrcset = getAttr(next, "data-lazy-srcset");
    const currentSrc = getAttr(next, "src");
    const currentSrcset = getAttr(next, "srcset");

    if (lazySrc && (!currentSrc || /^data:image\/svg/i.test(currentSrc))) {
      next = setAttr(next, "src", lazySrc);
      counts.lazy_images_promoted = (counts.lazy_images_promoted || 0) + 1;
    }

    if (lazySrcset && !currentSrcset) {
      next = setAttr(next, "srcset", lazySrcset);
      counts.lazy_srcsets_promoted = (counts.lazy_srcsets_promoted || 0) + 1;
    }

    const beforeRemove = next;
    next = removeAttr(next, "data-lazy-src");
    next = removeAttr(next, "data-lazy-srcset");
    next = removeAttr(next, "data-lazy-sizes");
    next = removeLazyClasses(next);
    if (next !== beforeRemove) counts.lazy_attrs_removed = (counts.lazy_attrs_removed || 0) + 1;

    return next;
  });
}

function promoteLazyIframes(html, counts) {
  return html.replace(/<iframe\b[^>]*>/gi, (tag) => {
    let next = tag;
    const lazySrc = getAttr(next, "data-lazy-src");
    const currentSrc = getAttr(next, "src");

    if (lazySrc && (!currentSrc || currentSrc === "about:blank")) {
      next = setAttr(next, "src", lazySrc);
      counts.lazy_iframes_promoted = (counts.lazy_iframes_promoted || 0) + 1;
    }

    const beforeRemove = next;
    next = removeAttr(next, "data-lazy-src");
    next = removeAttr(next, "data-rocket-lazyload");
    next = removeLazyClasses(next);
    if (next !== beforeRemove) counts.lazy_attrs_removed = (counts.lazy_attrs_removed || 0) + 1;

    return next;
  });
}

function promoteLazyBackgrounds(html, counts) {
  return html.replace(/<([a-z0-9-]+)\b[^>]*\bdata-bg=(["']).*?\2[^>]*>/gi, (tag) => {
    let next = tag;
    const bg = getAttr(next, "data-bg");
    if (!bg) return next;

    const currentStyle = getAttr(next, "style");
    const bgDeclaration = `background-image:url('${bg}')`;
    const style = currentStyle && currentStyle.trim()
      ? `${currentStyle.replace(/;?\s*$/, ";")} ${bgDeclaration};`
      : `${bgDeclaration};`;

    next = setAttr(next, "style", style);
    next = removeAttr(next, "data-bg");
    next = removeLazyClasses(next);
    counts.lazy_backgrounds_promoted = (counts.lazy_backgrounds_promoted || 0) + 1;
    counts.lazy_attrs_removed = (counts.lazy_attrs_removed || 0) + 1;
    return next;
  });
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function setAttr(tag, name, value) {
  const escaped = escapeAttr(value);
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["']).*?\\1`, "i");
  if (pattern.test(tag)) return tag.replace(pattern, `${name}="${escaped}"`);
  return tag.replace(/\/?>$/, (end) => ` ${name}="${escaped}"${end}`);
}

function removeAttr(tag, name) {
  return tag.replace(new RegExp(`\\s+${name}\\s*=\\s*(["']).*?\\1`, "gi"), "");
}

function removeLazyClasses(tag) {
  const classValue = getAttr(tag, "class");
  if (!classValue) return tag;
  const clean = classValue
    .split(/\s+/)
    .filter((item) => item && !["lazyload", "lazyloaded", "rocket-lazyload"].includes(item))
    .join(" ");
  return clean ? setAttr(tag, "class", clean) : removeAttr(tag, "class");
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function findFiles(root, filePattern) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...findFiles(full, filePattern));
    else if (filePattern.test(entry.name)) found.push(full);
  }
  return found;
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n") || "- None";
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll("\\", "/");
}

function writeCsv(filePath, records, headers) {
  const lines = [headers.join(",")];
  for (const record of records) {
    lines.push(headers.map((header) => csvCell(record[header] || "")).join(","));
  }
  fs.writeFileSync(filePath, `\uFEFF${lines.join("\n")}\n`);
}

function csvCell(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
