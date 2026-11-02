// Reviewed 2026-10-27 against publisher and standards-body pages.
export const ASME_Y145='https://www.asme.org/codes-standards/find-codes-standards/y14-5-dimensioning-tolerancing';
export const SAE_AS9102C='https://saemobilus.sae.org/standards/as9102c-aerospace-series-first-article-inspection-requirements';
export const externalUrlCorrections={
  'https://www.industrialpress.com/machinery-s-handbook-31st-edition-large-print/':'https://books.industrialpress.com/machinery-handbook/',
  'https://www.asme.org/codes-standards/find-codes-standards/y14-5-geometric-dimensioning-tolerancing':ASME_Y145,
};
export const removedCitationUrls=[
  'https://www.factmr.com/report/aerospace-cnc-machining-market',
  'https://mner.net/wp-content/uploads/2024/08/Technical-Drawing-for-Product-Design.pdf',
];

export function applyReviewedUrlCorrections(html,route){
  for(const [before,after] of Object.entries(externalUrlCorrections))html=html.replaceAll(before,after);
  const pathname=route.replace(/\/index\.html$/,'').replace(/\/$/,'');
  if(pathname==='/blog/cnc-turned-parts'){
    html=html.replace(/<p>Aerospace and defense demand the highest levels[\s\S]*?<\/p>/,
      '<p>Aerospace turned components can include bushings, actuator shafts, hydraulic fittings and fasteners. Specify the alloy, material condition, drawing datums and inspection records for each part. Confirm first-article inspection requirements against the customer contract and the applicable revision of SAE AS9102; these requirements complement the customer and regulatory requirements. <a href="/blog/cnc-turned-parts#ref05">[5]</a></p>');
    html=html.replace(/<p id="ref05">[\s\S]*?<\/p>/,
      `<p id="ref05">[5] SAE International. <em>AS9102C: Aerospace Series - First Article Inspection Requirements</em> (2023). <a href="${SAE_AS9102C}" target="_blank" rel="noreferrer noopener">SAE International standard overview</a>.</p>`);
  }
  if(pathname==='/blog/cnc-locating-pins'){
    html=html.replace(/<p id="ref02">[\s\S]*?<\/p>/,
      `<p id="ref02">[2] American Society of Mechanical Engineers. <em>Y14.5: Dimensioning and Tolerancing</em>. <a href="${ASME_Y145}" target="_blank" rel="noreferrer noopener">ASME standard overview</a>.</p>`);
  }
  return html;
}
