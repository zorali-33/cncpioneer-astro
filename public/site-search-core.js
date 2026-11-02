export const searchTypes = { all: "All", parts: "Parts", services: "Services", materials: "Materials", industries: "Industries", resources: "Resources" };

export function normalizeSearch(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/aluminium/g, "aluminum").replace(/5axis/g, "5 axis").replace(/millturn/g, "mill turn")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

const stem = value => value.length > 3 && value.endsWith("s") && !/(ss|us|is)$/.test(value) ? value.slice(0, -1) : value;
const tokens = value => normalizeSearch(value).split(/\s+/).filter(Boolean).map(stem);

export function prepareSearchIndex(pages) {
  return pages.map(page => ({ ...page, normalizedTitle: normalizeSearch(page.title), titleTokens: tokens(page.title), otherTokens: tokens(`${page.keywords || ""} ${page.description || ""}`) }));
}

export function searchPages(index, query, type = "all") {
  const normalized = normalizeSearch(query);
  const terms = [...new Set(tokens(query))];
  const counts = Object.fromEntries(Object.keys(searchTypes).map(key => [key, 0]));
  if (normalized.length < 2) return { items: [], total: 0, counts };
  const matches = index.flatMap(page => {
    let score = page.normalizedTitle === normalized ? 150 : page.normalizedTitle.includes(normalized) ? 70 : 0;
    for (const term of terms) {
      const matchesTerm = word => word === term || (term.length >= 2 && word.startsWith(term));
      if (page.titleTokens.includes(term)) score += 15;
      else if (page.titleTokens.some(matchesTerm)) score += 9;
      else if (page.otherTokens.some(matchesTerm)) score += 2;
      else return [];
    }
    return [{ page, score }];
  }).sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title, "en"));
  for (const { page } of matches) { counts.all++; counts[page.type]++; }
  const items = matches.filter(({ page }) => type === "all" || page.type === type).map(({ page }) => page);
  return { items, total: items.length, counts };
}
