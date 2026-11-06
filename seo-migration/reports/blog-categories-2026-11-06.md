# Blog categories

Reviewed 90 live articles, each assigned one primary category. Existing article URLs and editorial publication dates are preserved.

| Category | Articles | Archive |
| --- | ---: | --- |
| Machining Processes | 20 | /blog/category/machining-processes |
| Materials | 19 | /blog/category/materials |
| Design & Quality | 12 | /blog/category/design-quality |
| Surface Finishing | 6 | /blog/category/surface-finishing |
| Industry Applications | 23 | /blog/category/industry-applications |
| Sourcing & Production | 10 | /blog/category/sourcing-production |

The blog directory now provides a search form, category navigation with live counts, Automation Equipment and Robotics topic entry points, and the existing chronological article list. Card grids share the content container edges. Categories have unique introductions, complete server-rendered pagination, canonical URLs, CollectionPage/ItemList and breadcrumb schema, and sitemap/search discovery. Article cards and breadcrumbs link their primary category; BlogPosting articleSection matches the visible category.

Source of truth: `src/data/blogCategories.mjs`. Category builds validate coverage and reject unclassified new articles or stale assignments. When publishing another article, explicitly add its slug to one category; do not infer multiple primary categories from keywords.

Validation: reviewed category counts and unique coverage; pagination has no repeated or missing entries; category pagination breadcrumbs retain their parent; category archives are collections rather than articles/services. Full release verification retained. Desktop 1440 × 1000 and mobile 390 × 844 inspection covered the directory, material category pages 1–3, article category breadcrumbs and the resource search form. The existing left sticky article contents remains in place.
