// Reviewed primary categories: one category per live article; article URLs stay unchanged.
export const blogCategories = [
  {
    "id": "machining-processes",
    "name": "Machining Processes",
    "description": "Explore CNC turning, milling, Swiss machining, holemaking and comparisons that help you choose a manufacturing process.",
    "title": "CNC Machining Processes & Comparisons",
    "href": "/blog/category/machining-processes",
    "articleSlugs": [
      "cnc-milling-machine-parts",
      "slot-milling",
      "thread-milling-vs-tapping",
      "what-is-a-cnc-lathe",
      "cnc-milling",
      "precision-cnc-turning",
      "cnc-boring",
      "cnc-drilling",
      "face-milling",
      "cnc-turning",
      "casting-vs-cnc-machining",
      "3d-printing-vs-cnc-machining",
      "cnc-milling-vs-laser-cutting",
      "cnc-vs-sheet-metal",
      "cnc-machining-vs-manual-machining",
      "cnc-lathe-vs-mill",
      "cnc-metalworks",
      "cnc-machining-vs-injection-molding",
      "what-is-cnc",
      "swiss-machining"
    ]
  },
  {
    "id": "materials",
    "name": "Materials",
    "description": "Compare metals and engineering plastics by machinability, functional requirements and the material grade specified on your drawing.",
    "title": "CNC Machining Materials Guides",
    "href": "/blog/category/materials",
    "articleSlugs": [
      "abrasion-resistant-vs-carbon-steel-cnc-machining",
      "cast-iron-cnc-machining-parts",
      "copper-t2-cnc-machining",
      "bakelite-cnc-machining",
      "fr4-cnc-machining",
      "aluminum-vs-stainless-steel",
      "anodized-aluminum-vs-stainless-steel",
      "aluminium-melting-point",
      "inconel-vs-monel",
      "inconel-vs-titanium",
      "copper-cnc-machining",
      "brass-cnc-machining",
      "acrylic-cnc-machining",
      "nylon-cnc-machining",
      "bronze-cnc-machining",
      "stainless-steel-cnc-machining",
      "aluminum-cnc-machining",
      "swiss-machining-materials",
      "cnc-machining-materials"
    ]
  },
  {
    "id": "design-quality",
    "name": "Design & Quality",
    "description": "Plan part geometry, tolerances, workholding and inspection, from locating features and shafts to drawing-based quality checks.",
    "title": "CNC Part Design & Quality Guides",
    "href": "/blog/category/design-quality",
    "articleSlugs": [
      "cnc-locating-pins",
      "precision-cnc-milling-parts",
      "cnc-precision-parts",
      "cnc-turned-parts",
      "cnc-machining-quality-testing",
      "cnc-machining-fillets",
      "chamfer-cnc-machining",
      "beveled-edges-cnc-machining",
      "complex-cnc-machining-tasks",
      "fastener-machining",
      "shaft-machining",
      "connector-machining"
    ]
  },
  {
    "id": "surface-finishing",
    "name": "Surface Finishing",
    "description": "Understand surface treatments, roughness values, drawing symbols and measurement before specifying a finish for your part.",
    "title": "Surface Finishing & Roughness Guides",
    "href": "/blog/category/surface-finishing",
    "articleSlugs": [
      "aluminum-surface-finishes",
      "stainless-steel-surface-finishes",
      "surface-finish-chart",
      "surface-roughness",
      "surface-finish-symbols",
      "surface-finish"
    ]
  },
  {
    "id": "industry-applications",
    "name": "Industry Applications",
    "description": "Explore component requirements for automation, robotics, aerospace, medical, semiconductor and other industrial applications.",
    "title": "CNC Machining Industry Applications",
    "href": "/blog/category/industry-applications",
    "articleSlugs": [
      "spm-machined-vs-bought-parts",
      "what-is-automation-equipment",
      "robot-hands",
      "building-a-humanoid-robot",
      "cnc-machining-for-semiconductor-industry",
      "precision-aerospace-cnc-machined-parts",
      "oil-gas-cnc-machining-parts",
      "cnc-machining-heavy-truck-industry",
      "cnc-ev-motor-housings",
      "aerospace-cnc-machining",
      "cnc-machining-for-automotive-industry",
      "cnc-machining-robot-parts",
      "cnc-machining-for-renewable-energy",
      "cnc-machining-for-furniture-industry",
      "cnc-electronic-housings",
      "cnc-machined-uav-parts",
      "cnc-heat-sink-manufacturing",
      "oil-and-gas-plastic-machining",
      "oil-and-gas-machining",
      "railroad-machining",
      "electronics-machining",
      "medical-cnc-machining",
      "cnc-milling-and-turning-defense"
    ]
  },
  {
    "id": "sourcing-production",
    "name": "Sourcing & Production",
    "description": "Prepare better RFQs, compare suppliers and plan prototypes, low-volume orders, machining costs and production requirements.",
    "title": "CNC Sourcing & Production Guides",
    "href": "/blog/category/sourcing-production",
    "articleSlugs": [
      "5-axis-cnc-machining-manufacturers-in-china",
      "china-humanoid-robot-companies",
      "cnc-machining-costs",
      "low-volume-cnc-machining",
      "choose-cnc-machining-company",
      "cnc-near-me-vs-online-cnc-machining",
      "cnc-prototyping",
      "cnc-services-for-startups",
      "zero-waste-cnc-machining",
      "railroads-cnc-machining-companies"
    ]
  }
];

const categoryByArticle = new Map();
for (const category of blogCategories) for (const slug of category.articleSlugs) {
  if (categoryByArticle.has(slug)) throw new Error(`Duplicate blog category: ${slug}`);
  categoryByArticle.set(slug, category);
}
export const blogCategoryFor = slug => categoryByArticle.get(slug);
export const blogCategoryById = id => blogCategories.find(category => category.id === id);
export const blogCategoryCounts = articles => blogCategories.map(category => ({...category,count:articles.filter(article=>blogCategoryFor(article.slug)?.id===category.id).length}));

export function validateBlogCategories(articles) {
  const live = new Set(articles.map(article=>article.slug));
  const missing = articles.filter(article=>!categoryByArticle.has(article.slug)).map(article=>article.slug);
  const stale = [...categoryByArticle.keys()].filter(slug=>!live.has(slug));
  if (missing.length || stale.length) throw new Error(`Blog categories need review: ${JSON.stringify({missing,stale})}`);
}
