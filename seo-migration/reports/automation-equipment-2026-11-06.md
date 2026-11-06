# Automation equipment industry page

Route: `/industries/automation-equipment-parts`

Owner-requested URL correction: `/industries/automation-equipment` permanently redirects (301) to the parts-specific route, including trailing-slash and index.html variants. Navigation, directory, search index, canonical, structured data and sitemap use the new route.

Recreated the supplied HTML reference's content layout without importing its header, footer, React runtime, external fonts or placeholder media. Uses the existing BaseLayout and real quote endpoint, approved palette, type tokens and container edges. Includes industry-directory, navigation and site-search entry points.

Copy addresses special-purpose machine builders, BOM review, mating interfaces and shipment planning. Removed draft confirmation badges, blanket ISO fit recommendations and unsupported unconditional delivery/MOQ promises. Multi-file uploads use the existing ZIP support rather than advertising unsupported spreadsheet uploads.

The site's schema normalization supplies WebPage, Service and BreadcrumbList. Six visible FAQ questions supply FAQPage JSON-LD. Canonical, social metadata, sitemap and revision date use existing site integrations. No fabricated ratings or offers.

Generated application imagery uses the built-in imagegen tool; factory capability imagery retains the original photograph. Generated images are labelled as representative application imagery. All twelve final images are in `public/assets/images/automation-*.webp`, each below 100,000 bytes. They do not replace existing photographs.

Generation brief: realistic civilian automation component catalog photography, neutral light gray background, soft lighting, authentic machined metal textures, no logos, text, watermarks or company names. Subjects:

- `automation-parts-hero.webp`: A carefully arranged group of custom CNC machined automation machine components: aluminum tooling plate, L motor mount, stepped steel shaft, locating pins, black POM fixture nest, small manifold and bearing block. Three quarter studio view, all parts clearly distinct, no impossible geometry. Wide 4:3 composition.
- `automation-base-plates.webp`: Two silver machined aluminum base and mounting plates with regular tapped hole grids, precision dowel bores and milled counterbores. Three quarter view.
- `automation-motor-mounts.webp`: Two silver CNC machined aluminum motor mounting brackets, perpendicular mounting faces, circular pilot bore and four counterbored fixing holes, realistic practical mechanical geometry.
- `automation-shafts.webp`: Three precision turned steel stepped shafts and guide rods with ground journals, keyway and retaining ring groove arranged diagonally.
- `automation-pins-bushings.webp`: A small group of precision steel locating dowel pins and short cylindrical flanged bushings with clear hollow bores.
- `automation-fixtures.webp`: A black machined POM fixture nest on a silver aluminum pallet, contoured shallow locating pockets, recessed screw holes, practical assembly tooling.
- `automation-gripper-fingers.webp`: A matched pair of custom machined silver aluminum gripper fingers, slim rectangular arms with shaped gripping tips and two mounting bores per arm.
- `automation-manifolds.webp`: A rectangular machined aluminum pneumatic manifold block, clear threaded ports on two faces, straight cross drilled passages indicated only by exterior bores, no tubes.
- `automation-bearing-housings.webp`: Two machined aluminum bearing support blocks with circular precision bores and bolted feet, clean practical equipment components.
- `automation-drawing-review.webp`: Close view of an engineer's hands comparing a machined aluminum mounting plate with an unbranded technical drawing and digital caliper on a tidy engineering workbench. No face, no readable text. Horizontal 3:2.
- `automation-inspection.webp`: Close view of an unbranded coordinate measuring machine ruby probe inspecting a dowel bore on a silver machined tooling plate, realistic granite measurement table. Horizontal 3:2.
- `automation-kitted-parts.webp`: Custom machined aluminum plates, steel shafts and black plastic fixture nests carefully organized in separate protective foam compartments, plain small blank white inventory labels, organized dispatch bench. Horizontal 3:2.

Verification: `npm run release:verify`; desktop 1440 × 1000 and mobile 390 × 844 layout checks, working part anchors and FAQ disclosures. Upload form retains server validation; no test customer enquiry was sent.
