import { blogContextLinks } from './data/blogContextLinks.mjs';
import { rewriteConsolidatedLinks } from './data/blogConsolidation.mjs';

// Reviewed against each article's paragraph and the actual destination page.
// Exact source matches make later editorial changes fail visibly instead of
// silently moving a commercial link into a different context.
export function applyContextualBlogLinks(html, slug) {
  const review = blogContextLinks[slug];
  if (!review) return html;
  let result = rewriteConsolidatedLinks(html);
  for (const { before, after } of review.changes) {
    const position = result.indexOf(before);
    if (position < 0 || result.indexOf(before, position + before.length) >= 0) {
      throw new Error(`Contextual blog links need review: ${slug}: ${before.slice(0, 90)}`);
    }
    result = result.slice(0, position) + after + result.slice(position + before.length);
  }
  if (review.appendHtml) {
    if (review.insertionBefore) {
      const position = result.indexOf(review.insertionBefore);
      if (position < 0 || result.indexOf(review.insertionBefore, position + review.insertionBefore.length) >= 0) {
        throw new Error(`Missing contextual-link insertion point: ${slug}`);
      }
      result = result.slice(0, position) + review.appendHtml + result.slice(position);
    } else {
      result += review.appendHtml;
    }
  }
  return result;
}
