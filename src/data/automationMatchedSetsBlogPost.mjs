const faqs = [
  {
    question: 'Do matched parts have to come from one supplier?',
    answer: 'The parts can come from different shops if one named party receives them, performs the agreed assembly checks and issues the set record. Confirm this scope before placing the orders.',
  },
  {
    question: 'Can I replace one piece from a matched set?',
    answer: 'Check the original drawing and inspection record. For a selectively fitted or jointly finished set, the supplier may need the mating pieces to verify the replacement. Parts qualified as interchangeable can follow the documented replacement procedure.',
  },
  {
    question: 'What should receiving check when a set arrives?',
    answer: 'Check the part numbers, revisions and set IDs against the order and inspection report. Confirm that the mating pieces, required hardware and any selected shims are present. Follow the agreed incoming inspection plan before releasing the set to assembly.',
  },
];

export const automationMatchedSetsBlogPost = {
  slug: 'automation-parts-supplied-inspected-as-sets',
  title: 'Which Custom Automation Parts Should Be Ordered and Inspected as Sets?',
  seoTitle: 'Custom Automation Parts: Matched Sets and Acceptance Checks',
  description: 'See which custom automation parts need matched-set control, which need assembly checks, and what inspection records to request before delivery.',
  published: '2026-11-19T00:00:00+08:00',
  modifiedTime: '2026-11-19T00:00:00+08:00',
  authorSlug: 'zora',
  authorName: 'Zora',
  image: '/assets/images/automation-split-housing-matched-set.webp',
  imageWidth: 1200,
  imageHeight: 800,
  articleHtml: `
<figure><img src="/assets/images/automation-split-housing-matched-set.webp" width="1200" height="800" alt="Machined split bearing housing base and removable cap with their fasteners and locating dowels" loading="eager" fetchpriority="high" decoding="async"><figcaption>A split housing base and cap. AI-generated illustration.</figcaption></figure>
<p>A purchase order can list a housing base and cap on separate lines while still requiring them to stay together through machining, inspection and packing. If the bore is finished with the two pieces bolted together, receiving needs to know which cap belongs to which base.</p>
<p>Other parts need a different arrangement. A pair of gripper fingers may need a trial with a sample workpiece, while replacement fixture nests may be required to fit every base already in service. The RFQ should state the pairing or interchangeability requirement before the shop quotes.</p>

<h2>Which parts need to stay together?</h2>
<p>Start with how the parts are made and accepted. Joint finishing or selective fitting can tie a particular group of pieces to one assembly. A trial assembly can also verify parts designed to be interchangeable. In that case, the inspection plan needs to say how replacement parts will be accepted.</p>
<table>
<thead><tr><th scope="col">Part group</th><th scope="col">When set control matters</th><th scope="col">Evidence to request</th></tr></thead>
<tbody>
<tr><th scope="row">Split housing base and cap</th><td>The bore is finished with the pieces assembled and the drawing requires the pair to stay together.</td><td>Shared set ID and bore results in the specified assembled condition.</td></tr>
<tr><th scope="row">Selected spacers or shim packs</th><td>Thickness is selected for a particular assembly.</td><td>Assembly ID, final thickness or shim combination, and the resulting measurement.</td></tr>
<tr><th scope="row">Gripper fingers</th><td>The order includes a grip or clearance check with the fingers installed.</td><td>Finger revisions, gripper and sample identity, test conditions and results.</td></tr>
<tr><th scope="row">Fixture base and locating nest</th><td>Acceptance includes seating, workpiece location or replacement-nest compatibility.</td><td>Trial-fit results and the agreed scope of interchangeability.</td></tr>
<tr><th scope="row">Guide supports and moving plates</th><td>The supplier is responsible for an installed alignment or movement check.</td><td>Checked travel, setup, results and any retained adjustments.</td></tr>
</tbody>
</table>

<h2>Keep jointly finished housing halves identified</h2>
<p>Consider a hypothetical order for six split housings. The shop finishes each bore with its cap installed. If the caps are then packed loose without identification, the fitter has six possible combinations to sort through for each base. A report for each individual part gives the fitter little help finding the checked pairing.</p>
<p>Carry the set ID through the machining record, inspection report and packing list. Identify orientation where the design requires it. Marking locations should be approved and clear of bearing seats, sealing surfaces and locating faces.</p>
<p>The bore report should state the fasteners and assembly condition used for inspection, including the specified tightening requirement. If spare caps are needed, ask whether they will be qualified to fit the existing bases or supplied against a particular housing number.</p>

<h2>Define what a gripper-finger trial proves</h2>
<p>A finger pair can be checked for its contact with a sample component, opening clearance and release at the specified jaw position. To quote that work, the shop needs the gripper model, current workpiece revision and an actual sample or agreed gauge.</p>
<p>Record mounting adjustments used during the trial. If the fingers are intended for several identical grippers, state whether acceptance covers the supplied gripper only or includes a defined interchangeability check.</p>
<p>A stationary trial establishes contact and clearance under its recorded conditions. A requirement to hold the part during machine movement needs its own operating conditions and acceptance criteria. Finger length and load limits should follow the selected gripper's documentation. <a href="https://schunk.com/us/en/gripping-systems/parallel-gripper/wsg/wsg-050-110-b/p/000000000000306120" target="_blank" rel="noopener noreferrer">Manufacturer technical reference</a>.</p>
<figure><img src="/assets/images/automation-matched-gripper-fingers.webp" width="1200" height="800" alt="Two custom machined fingers mounted on a parallel gripper around a sample workpiece" loading="lazy" decoding="async"><figcaption>Gripper fingers shown with a sample workpiece. AI-generated illustration.</figcaption></figure>

<h2>Decide how replacement nests will fit</h2>
<p>Suppose, as an example, a builder orders two fixture bases and two nests, then plans to buy replacement nests later. Checking base A with nest A and base B with nest B verifies those two combinations. The builder still needs an agreed way to accept a new nest for either base.</p>
<p>Put that replacement requirement on the drawings and order. The inspection plan can then define the relevant interface measurements, reference gauge or trial combinations. A common locating interface also makes the requirement easier to repeat on later orders.</p>
<p>During the fixture check, use the specified locators, fasteners and sample workpiece. Record seating and workpiece-location results against the assembly drawing. Follow the released pin arrangement, including any round and relieved locating pins. Locator geometry affects how the assembly seats. <a href="https://www.carrlane.com/product/locating-pins/fixture-keys/fixture-locating-pins" target="_blank" rel="noopener noreferrer">Locating pin reference</a>.</p>

<h2>Record selected adjustments with the assembly</h2>
<p>A spacer selected to obtain a specified end float or a shim pack used to set alignment belongs in the assembly record. Keep its final thickness or combination with the assembly ID and the measurement obtained. The drawing or approved procedure should define the adjustment and acceptance limits.</p>
<p>Guide supports and moving plates need a similar record when the supplier checks them together. Agree who provides the rails, shafts or bearings, what travel is checked, and which movement or alignment results are required. Retain the shim positions and other adjustments needed to reproduce the checked setup.</p>
<p>Where final guide alignment is performed on the machine frame, assign that check to the builder's assembly plan. The parts order can cover the mounting features and other measurements within the machining supplier's scope.</p>

<h2>Specify the delivered condition and packing</h2>
<p>Identify which checks take place after coating, plating, heat treatment or other outside processing. If the order requires a final trial assembly, state the condition in which the pieces will be checked and whether they ship assembled or separated for protection.</p>
<p>At receiving, the report and packing list should let someone find every piece of the checked set. Include the part numbers, drawing revisions, set ID, any selected shims and the hardware required by the order. Separately protected pieces can share a clearly identified package.</p>
<figure><img src="/assets/images/automation-fixture-set-packing.webp" width="1200" height="800" alt="Fixture base, locating nest and mounting screws protected in separate foam pockets within one shipping box" loading="lazy" decoding="async"><figcaption>A fixture set grouped in protective packaging. AI-generated illustration.</figcaption></figure>

<h2>Example purchase-order note</h2>
<p>For a fixture base and nest, an order note could read as follows.</p>
<blockquote><p>Supply one fixture set comprising base P-101 Rev C and nest P-102 Rev B. Inspect each part to its released drawing. After finishing, assemble using the specified locators and fasteners and perform the seating and workpiece-location checks on assembly A-100 Rev D. Record the part numbers, revisions, set ID and results. Pack the checked set together.</p></blockquote>
<p>This is an illustrative note. The referenced drawing still needs to define measurable acceptance limits. Add any requirement for replacement nests to fit other bases before requesting a quote.</p>
<p>Flag these sets on your <a href="/industries/automation-equipment">automation equipment parts RFQ</a>. For allocating the remaining BOM lines, see <a href="/blog/automation-parts-one-supplier-or-several">ordering custom automation parts from one supplier or several</a>.</p>

<h2>Frequently Asked Questions</h2>
<div class="spm-article-faq">
${faqs.map(({question, answer}) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('\n')}
</div>`,
  faqs,
};
