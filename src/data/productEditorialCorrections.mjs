// Reviewed 2026-10-27. Preserve route identities and commercial claims outside this correction scope.
// 17-4PH is a magnetic precipitation-hardening martensitic stainless steel:
// https://www.sandmeyersteel.com/wp-content/uploads/17-4PH-Spec-Sheet.pdf
export const overviewHeadingCorrections = {
  '5-axis-sensor-housing-machining': 'Mounting and Wall-Thickness Review',
  'aluminium-alloy-cnc-turning-milling-parts': 'Drawing and Datum Review',
  'bearing-housing': 'Bearing Fits and Bore Review',
  'brass-nipple': 'Thread and Sealing Review',
  'brass-pneumatic-fittings': 'Production Cost Comparison',
  'brass-turning-milling-parts': 'Drawing and Feature Review',
  'cnc-machined-brass-parts': 'Functional Dimension Review',
  'cnc-machinery-parts': 'Datums and Mating Features',
  'cnc-turning-precision-washers': 'Washer Dimension Review',
  'cnc-turning-titanium-nuts': 'Nut Drawing and Fit Review',
  'cylinder-head-machining': 'Critical Interface Review',
  'evtol-titanium-fasteners': 'Assembly and Geometry Review',
  'humanoid-robot-joint-components': 'Joint Interface Review',
  'hydraulic-cylinder-piston-machining': 'Piston Dimension Review',
  'liquid-cooling-connectors': 'Flow and Sealing Review',
  'rail-machining': 'Rail Drawing and Datum Review',
  'reducer-hex-nipple': 'Threads and Sealing Surfaces',
  'reducer-shaft': 'Journal and Drive Interface Review',
  'robot-actuator-housings': 'Housing Mounting and Wall Review',
  'turned-cooling-fittings': 'Flow Channel and Sealing Review',
};

export function applyProductEditorialCorrections(content) {
  for(const [slug,title] of Object.entries(overviewHeadingCorrections)) {
    const point=content[slug]?.overviewPoints?.find(point=>point.title==='40'||point.title===title);
    if(!point)throw new Error(`Missing reviewed overview heading: ${slug}`);
    point.title=title;
  }
  const bearing=content['bearing-housing']?.materials?.find(material=>material.title==='17-4PH H900 Stainless AMS 5643');
  const robot=content['industrial-robot-arms']?.materials?.find(material=>material.title==='17-4PH H900');
  if(!bearing||!robot)throw new Error('Missing reviewed 17-4PH material cards');
  bearing.tag='High Strength & Corrosion Resistance';
  bearing.text='Magnetic precipitation-hardening stainless steel. Specify the H900 condition, required surface treatment and dimensional inspection against the approved drawing.';
  robot.text='Magnetic precipitation-hardening stainless steel for specified high-strength components. Confirm the H900 condition, mechanical-property requirements and inspection scope with the drawing.';
}
