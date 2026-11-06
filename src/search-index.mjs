import { nativeParts } from "./data/nativeParts.mjs";
import { productContent } from "./data/productContent.mjs";
import { nativeMaterials } from "./data/nativeMaterials.mjs";
import { nativeIndustries } from "./data/nativeIndustries.mjs";
import { isRetiredProduct } from "./data/productRedirects.mjs";
import { isRetiredIndustry } from "./data/industryRedirects.mjs";

const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”" };
const clean = (value = "") => String(value).replace(/<[^>]+>/g, " ")
  .replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (match, hex, decimal, named) => {
    if (named) return entities[named.toLowerCase()] || match;
    const code = parseInt(hex || decimal, hex ? 16 : 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  }).replace(/\s+/g, " ").trim();
const trimDescription = (value) => {
  const text = clean(value);
  return text.length > 190 ? `${text.slice(0, 187).replace(/\s+\S*$/, "")}…` : text;
};

export function buildSearchIndex(articles = []) {
  const pages = [
    { title: 'Automation Equipment Parts', href: '/industries/automation-equipment', type: 'industries', description: 'Custom plates, brackets, shafts, fixtures and gripper fingers for special-purpose machine builders.', keywords: 'automation equipment custom machine BOM fixtures tooling gripper manifold non-standard special purpose' },
    { title: "CNC Turning and Milling", href: "/services/cnc-turning-and-milling", type: "services", description: "Combined turning and milling for custom precision components, prototypes and production.", keywords: "mill turn lathe 5 axis machining" },
    { title: "Swiss Machining", href: "/services/swiss-machining", type: "services", description: "Precision Swiss turning for small, complex parts, pins, shafts and connectors.", keywords: "swiss screw turning sliding headstock" },
    { title: "3-Axis CNC Machining Services", href: "/services/3-axis-cnc-machining", type: "services", description: "Custom milling for metal and engineering plastic plates, brackets, frames and pocketed parts.", keywords: "3 axis three axis CNC milling machining plates brackets pockets" },
    { title: "5-Axis CNC Machining Services", href: "/services/5-axis-cnc-machining", type: "services", description: "Custom machining for angled features, contoured surfaces and multi-face components, with drawing-based process and inspection review.", keywords: "5 axis five axis CNC machining milling 3+2 indexed simultaneous complex parts China quotes" },
    { title: "Custom CNC Parts Library", href: "/custom-cnc-parts", type: "parts", description: "Browse CNC machined parts by component type, material and process.", keywords: "catalog products library" },
    { title: "CNC Machining Services", href: "/services", type: "services", description: "Explore machining processes and discuss your drawing requirements." },
    { title: "CNC Machining Materials", href: "/materials", type: "materials", description: "Explore aluminum, stainless steel, titanium, brass and engineering plastics." },
    { title: "Industries We Serve", href: "/industries", type: "industries", description: "Explore CNC machining for aerospace, medical, semiconductor, automotive and other industries." },
    { title: "Resources & Engineering Guides", href: "/resources", type: "resources", description: "Machining resources, design guidance and answers to common questions." },
    { title: "CNC Machining FAQ", href: "/resources/faqs", type: "resources", description: "Questions about drawings, materials, quotations, manufacturing and inspection." },
    { title: "Equipment List", href: "/resources/equipment-list", type: "resources", description: "Download equipment and inspection lists grouped by CNC turning and milling and Swiss machining services.", keywords: "equipment machines machine list CNC turning milling mill turn Swiss machining lathe measurement metrology inspection PDF" },
    { title: "CNC Machining Blog", href: "/blog", type: "resources", description: "Engineering articles about CNC processes, materials and component design." },
    ...nativeParts.filter(page => !isRetiredProduct(`custom-cnc-parts/${page.slug}`)).map(page => ({
      title: productContent[page.slug]?.h1 || page.title,
      href: `/custom-cnc-parts/${page.slug}`, type: "parts",
      description: page.seo.description,
      keywords: `${page.slug.replaceAll("-", " ")} ${page.title} ${page.seo.title}`,
    })),
    ...nativeMaterials.map(page => ({ title: page.hero.title, href: `/materials/${page.slug}`, type: "materials", description: page.seo.description, keywords: page.slug.replaceAll("-", " ") })),
    ...nativeIndustries.filter(page => !isRetiredIndustry(`industries/${page.slug}`)).map(page => ({ title: page.hero.title, href: `/industries/${page.slug}`, type: "industries", description: page.seo.description, keywords: page.slug })),
    ...articles.map(article => ({ title: article.displayTitle || article.title, href: `/blog/${article.slug}`, type: "resources", description: "Engineering guide from the CNCPioneer machining resource library.", keywords: article.slug.replaceAll("-", " ") })),
  ];
  return [...new Map(pages.map(page => [page.href, {
    ...page, title: clean(page.title), description: trimDescription(page.description), keywords: clean(page.keywords),
  }])).values()];
}
