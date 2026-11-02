import { internalLinkReview } from "./blog-internal-links-curated.mjs";

const escapeHtml = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const decodeHtml = (text) => text
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, name) => ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " })[name]);
const plainText = (html) => decodeHtml(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

// Curated by paragraph context and destination content, not keyword similarity.
export function applyReviewedInternalLinks(html, slug) {
  const review = internalLinkReview[slug];
  if (!review) return html;
  let result = html;
  for (const rule of review.changes) {
    let matches = 0;
    result = result.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (original, attributes, label) => {
      const href = attributes.match(/\bhref="([^"]*)"/)?.[1];
      if (href !== rule.beforeHref || plainText(label) !== rule.anchor) return original;
      matches += 1;
      if (rule.action === "remove-text") return "";
      if (rule.action === "unlink") return label;
      if (rule.action === "split-pins") return `high-volume screws and <a href="${rule.afterHref}">pins</a>`;
      const attrs = attributes.replace(/\bhref="[^"]*"/, `href="${rule.afterHref}"`).replace(/\s+id="[^"]*"/, "");
      return `<a${attrs}>${rule.afterAnchor ? escapeHtml(rule.afterAnchor) : label}</a>`;
    });
    if (matches !== 1) throw new Error(`Internal-link review needs updating: ${slug}: ${rule.anchor} (${matches} matches)`);
  }

  for (const rule of review.additions) {
    let added = false;
    result = result.replace(/<(p|li|td)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
      if (added) return block;
      let inLink = false;
      return block.split(/(<[^>]+>)/g).map((part) => {
        if (part.startsWith("<")) {
          if (/^<a\b/i.test(part)) inLink = true;
          if (/^<\/a\s*>/i.test(part)) inLink = false;
          return part;
        }
        if (inLink || added || !part.includes(rule.text)) return part;
        added = true;
        return part.replace(rule.text, `<a href="${rule.href}">${escapeHtml(rule.text)}</a>`);
      }).join("");
    });
    if (!added) throw new Error(`Missing contextual link phrase in ${slug}: ${rule.text}`);
  }
  return result;
}
