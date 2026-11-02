// Keep the requested brand suffix while preserving the subject and pagination.
export const titleBrandOverrides = {
  '/about-us': 'About Us: Swiss & Mill-Turn Machining | CNCPioneer',
  '/author/ryan-wang': 'Ryan Wang CNC Machining Articles | CNCPioneer',
  '/blog/5-axis-cnc-machining-manufacturers-in-china': 'Top 20 5-Axis CNC Companies in China | CNCPioneer',
  '/blog/abrasion-resistant-vs-carbon-steel-cnc-machining': 'AR Steel vs Carbon Steel CNC Machining | CNCPioneer',
  '/blog/aluminum-surface-finishes': 'Aluminum Surface Finishes: Types & Testing | CNCPioneer',
  '/blog/aluminum-vs-stainless-steel': 'Aluminum vs Stainless Steel: Key Differences | CNCPioneer',
  '/blog/building-a-humanoid-robot': 'Building a Humanoid Robot with CNC Parts | CNCPioneer',
  '/blog/cnc-electronic-housings': 'CNC Electronic Housings: Materials & Design | CNCPioneer',
  '/blog/cnc-locating-pins': 'CNC Locating Pins: Fixture Design Guide | CNCPioneer',
  '/blog/cnc-metalworks': 'CNC Metalworks: Custom Metal Parts Guide | CNCPioneer',
  '/blog/cnc-milling': 'CNC Milling: Process, Tools & Applications | CNCPioneer',
  '/blog/cnc-turning': 'CNC Turning: Basics, Machines & Operations | CNCPioneer',
  '/blog/cnc-vs-sheet-metal': 'CNC vs Sheet Metal: Cost & Volume Comparison | CNCPioneer',
  '/blog/oil-and-gas-plastic-machining': 'Oil and Gas Plastic Machining Guide | CNCPioneer',
  '/blog/railroads-cnc-machining-companies': 'Top 10 Railroad CNC Machining Companies | CNCPioneer',
  '/blog/stainless-steel-surface-finishes': 'Stainless Steel Surface Finishes Guide | CNCPioneer',
};
for(const [slug,name,lastPage] of [['david-li','David Li',3],['ryan-wang','Ryan Wang',8]]) {
  for(let page=2;page<=lastPage;page++)titleBrandOverrides[`/author/${slug}/page/${page}`]=`${name} Articles – Page ${page} of ${lastPage} | CNCPioneer`;
}
