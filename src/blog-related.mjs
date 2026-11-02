import { curatedRelatedPosts } from "./blog-related-curated.mjs";

// Title-based ranking remains a fallback for new articles and unavailable selections.
// The reviewed archive uses explicit editorial selections before this fallback.
const subjectRules = [
  ["material:aluminum", 12, /\balumin(?:i)?um\b/],
  ["material:stainless", 12, /\bstainless\s+steel\b/],
  ["material:carbon-steel", 12, /\bcarbon\s+steel\b/],
  ["material:ar-steel", 12, /\babrasion\s+resistant|\bar\s+steel\b/],
  ["material:cast-iron", 12, /\bcast\s+iron\b/],
  ["material:copper", 12, /\bcopper\b/],
  ["material:brass", 12, /\bbrass\b/],
  ["material:bronze", 12, /\bbronze\b/],
  ["material:nylon", 12, /\bnylon\b/],
  ["material:acrylic", 12, /\bacrylic|\bpmma\b/],
  ["material:bakelite", 12, /\bbakelite\b/],
  ["material:fr4", 12, /\bfr\s*4\b/],
  ["material:inconel", 12, /\binconel\b/],
  ["material:monel", 12, /\bmonel\b/],
  ["material:titanium", 12, /\btitanium\b/],
  ["material:plastic", 8, /\bplastics?\b/],
  ["family:copper-alloys", 5, /\bcopper|\bbrass|\bbronze\b/],
  ["family:difficult-alloys", 5, /\binconel|\bmonel|\btitanium|\bstainless\s+steel\b/],
  ["process:swiss", 10, /\bswiss\b/],
  ["process:turning", 8, /\bturning|\bturned|\blathes?\b/],
  ["process:milling", 8, /\bmilling|\bmills?\b/],
  ["process:laser", 10, /\blaser\b/],
  ["process:sheet-metal", 8, /\bsheet\s+metal\b/],
  ["process:injection", 10, /\binjection\s+mold/],
  ["process:mold", 6, /\bmold/],
  ["process:casting", 8, /\bcasting\b/],
  ["process:printing", 8, /\b3d\s+print/],
  ["process:threading", 10, /\bthread|\btapping\b/],
  ["process:drilling", 8, /\bdrilling\b/],
  ["process:boring", 8, /\bboring\b/],
  ["process:routing", 8, /\brouters?|\brouting\b/],
  ["industry:robotics", 12, /\brobots?|\brobotics|\bhumanoid\b/],
  ["industry:aerospace", 12, /\baerospace\b/],
  ["industry:automotive", 12, /\bautomotive|\bheavy\s+trucks?|\bev\b/],
  ["industry:railway", 12, /\brailroads?|\brailway/],
  ["industry:oil-gas", 12, /\boil\s+(?:and\s+)?gas\b/],
  ["industry:medical", 12, /\bmedical\b/],
  ["industry:electronics", 10, /\belectronics?|\bsemiconductor|\bheat\s+sinks?\b/],
  ["industry:semiconductor", 12, /\bsemiconductor/],
  ["industry:furniture", 12, /\bfurniture\b/],
  ["industry:energy", 10, /\brenewable\s+energy\b/],
  ["industry:defense", 10, /\bdefense\b/],
  ["part:shaft", 8, /\bshafts?\b/],
  ["part:fastener", 8, /\bfasteners?|\bpins?\b/],
  ["part:connector", 8, /\bconnectors?\b/],
  ["part:housing", 8, /\bhousings?|\benclosures?\b/],
  ["topic:surface", 12, /\bsurface\s+(?:finish|roughness)|\banodized|\bra\s+values?\b/],
  ["topic:edge-design", 12, /\bfillets?|\bchamfers?|\bbeveled\s+edges?\b/],
  ["topic:prototyping", 10, /\bprototyp|\blow\s+volume|\bstartups?\b/],
  ["topic:cost", 8, /\bcosts?|\bpricing\b/],
  ["topic:quality", 8, /\bquality|\btesting|\bgd\s+t\b/],
  ["topic:dfm", 5, /\bdfm|\bdesign\b/],
  ["topic:equipment", 7, /\bmachine\s+parts|\bmaintenance\b/],
  ["topic:size", 6, /\blarge\s+part|\bmicro\b/],
];

const fallbackSlugs = new Set([
  "cnc-machining-materials",
  "cnc-lathe-vs-mill",
  "choose-cnc-machining-company",
  "cnc-machining-quality-testing",
]);

function subjectsFor(article) {
  const text = `${article.slug} ${article.displayTitle || article.title || ""}`
    .toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const subjects = new Map(subjectRules
    .filter(([, , pattern]) => pattern.test(text))
    .map(([subject, weight]) => [subject, weight]));

  if (/\bcnc\b/.test(text) && /\bmanufacturers?|\bcompanies|\bcompany\b/.test(text)) subjects.set("topic:cnc-suppliers", 8);
  if ([...subjects.keys()].some((key) => key.startsWith("material:")) || /\bmaterials?\b/.test(text)) subjects.set("category:materials", 3);
  if ([...subjects.keys()].some((key) => key.startsWith("process:"))) subjects.set("category:processes", 2);
  if ([...subjects.keys()].some((key) => key.startsWith("industry:"))) subjects.set("category:industries", 0.25);
  return subjects;
}

export function rankRelatedArticles(currentSlug, articles, count = 3) {
  const current = articles.find((article) => article.slug === currentSlug);
  if (!current || !Number.isInteger(count) || count <= 0) return [];
  const subjects = subjectsFor(current);
  const unique = new Map(articles.map((article) => [article.slug, article]));
  const selected = (curatedRelatedPosts[currentSlug] || [])
    .map(([slug]) => unique.get(slug))
    .filter((article) => article && article.slug !== currentSlug);
  const selectedSlugs = new Set(selected.map((article) => article.slug));

  const fallback = [...unique.values()]
    .filter((article) => article.slug !== currentSlug && !selectedSlugs.has(article.slug))
    .map((article) => ({
      article,
      score: [...subjectsFor(article)].reduce((score, [subject, weight]) => score + (subjects.has(subject) ? weight : 0), 0)
        + (fallbackSlugs.has(article.slug) ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score
      || Number(b.article.authorSlug === current.authorSlug) - Number(a.article.authorSlug === current.authorSlug)
      || (Date.parse(b.article.published) || 0) - (Date.parse(a.article.published) || 0)
      || a.article.slug.localeCompare(b.article.slug))
    .map(({ article }) => article);

  return [...selected, ...fallback].slice(0, count);
}
