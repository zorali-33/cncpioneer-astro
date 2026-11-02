import records from './pageRevisions.json' with { type: 'json' };
import { normalizePagePath } from './siteUrls.mjs';

// This ledger is edited when content/links/structured data actually change.
// Do not add Date.now(), file mtimes or build timestamps here. New routes without
// a documented date deliberately have no lastmod until an editor records one.
const revisions = new Map();
for (const revision of records.revisions) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(revision.date) || Number.isNaN(Date.parse(revision.date))) throw new Error('Invalid page revision date');
  for (const route of revision.routes) {
    const path = normalizePagePath(route);
    if (!revisions.has(path) || revisions.get(path) < revision.date) revisions.set(path, revision.date);
  }
}

export function getPageModifiedTime(route, ...sourceDates) {
  const path = normalizePagePath(new URL(route, 'https://www.cncpioneer.com').pathname);
  const candidates = [revisions.get(path), ...sourceDates].filter((value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value) && !Number.isNaN(Date.parse(value)));
  // A recorded day has day precision; do not invent a midnight timestamp for it.
  // A later source date can supersede the ledger when real content is updated.
  return candidates.reduce((latest, value) => value.slice(0, 10) > (latest || '').slice(0, 10) ? value : latest, undefined);
}
