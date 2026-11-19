const faqs = [
  {
    question: 'Can I split the order after a shop has quoted the whole BOM?',
    answer: 'Yes. Ask for a revised quote before issuing the purchase orders. Setup costs and inspection scope may change when you remove parts. If the original quote included a fit check, confirm who will do it under the new arrangement.',
  },
  {
    question: 'Who checks the fit when two suppliers make mating parts?',
    answer: 'Each supplier checks the features on its own drawing. Assign the assembly check to your team or to a shop that has agreed to receive both parts and perform the check. Give that team the same drawings, mating hardware and acceptance criteria.',
  },
  {
    question: 'Can one supplier ship the package in stages?',
    answer: 'Yes. Put a delivery date against each group on the purchase order. Release independent parts as they are ready and hold any parts that still need a shared inspection.',
  },
];

export const automationSourcingBlogPost = {
  slug: 'automation-parts-one-supplier-or-several',
  title: 'Custom Automation Parts: One Supplier or Several?',
  description: 'Decide which custom automation parts to quote together, which to split between shops, and who checks the fit before assembly.',
  published: '2026-11-18T00:00:00+08:00',
  modifiedTime: '2026-11-19T00:00:00+08:00',
  authorSlug: 'zora',
  authorName: 'Zora',
  image: '/assets/images/automation-assembly-station-parts.webp',
  imageWidth: 1200,
  imageHeight: 800,
  articleHtml: `
<figure>
  <img src="/assets/images/automation-assembly-station-parts.webp" width="1200" height="800" alt="Automation assembly station with a machined base plate, fixture nest, gripper fingers and sensor brackets" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Machined parts for an assembly station. AI-generated illustration.</figcaption>
</figure>
<p>The plate is on the bench, the nest has arrived, and both suppliers have sent inspection reports. But the nest binds on the dowels when the fitter goes to install it. Now someone has to check the hole patterns against the assembly drawing and decide who needs to rework what.</p>
<p><strong>Keep parts on one order when you want the shop to check them together.</strong> Split out parts when a specialist can meet a process or delivery requirement and you have someone lined up to check the fit. Make that decision on the BOM before sending out the RFQ.</p>
<p>If you are still separating catalogue components from made-to-drawing parts, start with <a href="/blog/spm-machined-vs-bought-parts">which SPM parts are machined and which are bought</a>.</p>

<h2>Mark the parts that need to fit together</h2>
<p>Start with the assembly drawing. Mark the locating faces, dowel patterns and other interfaces that matter when the parts go together. Then ask what a receiving inspector could check with the parts in separate boxes.</p>
<p>For a dowelled nest, each shop can measure its hole pattern to the drawing. If you need the supplier to verify that the actual nest seats on the actual plate, ask for a trial fit on the order. Give the shop the dowels or specify which ones to use. Say whether the fit is checked after finishing and what record you want back.</p>
<figure>
  <img src="/assets/images/automation-fixture-plate-fit-check.webp" width="1050" height="700" alt="Technician positioning a machined nest over two locating dowels on a tooling plate" loading="lazy" decoding="async">
  <figcaption>Positioning a nest over the locating dowels before a trial fit. AI-generated illustration.</figcaption>
</figure>
<table>
  <thead><tr><th scope="col">Parts</th><th scope="col">Acceptance check</th><th scope="col">What to quote together</th></tr></thead>
  <tbody>
    <tr><th scope="row">Base plate and nest</th><td>Nest seats against the mounting face with the specified dowels installed.</td><td>Quote both with a trial fit if the shop will sign off on the pair.</td></tr>
    <tr><th scope="row">Left and right gripper fingers</th><td>Fingers contact the part correctly in the specified gripper at the agreed stroke position.</td><td>Quote as a pair when the shop is doing the grip check. Provide the gripper and a sample part or agreed gauge.</td></tr>
    <tr><th scope="row">Shaft and bearing housing</th><td>Check the shaft journal and housing bore against their respective fits for the specified bearing. Check alignment at assembly if required.</td><td>Separate orders can work if both drawings use the same bearing designation and someone owns the assembly check.</td></tr>
    <tr><th scope="row">Slotted sensor brackets</th><td>Check mounting dimensions and usable adjustment range.</td><td>Order separately if the drawing defines the bracket and the build team can verify clearance.</td></tr>
  </tbody>
</table>

<h2>Get the inspection scope in writing on a single order</h2>
<p>For housing halves, fixture sets and other mating parts, see <a href="/blog/automation-parts-supplied-inspected-as-sets">which automation parts need set inspection and identification</a> before defining the checks on the order.</p>
<p>A shop may quote a full set based on inspecting each drawing. If you also want the nest fitted to the plate, put that check on its own line. Agree what counts as a pass, who provides the mating hardware and how the shop records the result. If you want that particular nest and plate packed together after the check, say how to identify the set.</p>
<p>Ask who handles grinding, heat treatment and finishing. If the shop sends a part out for anodizing, confirm who verifies the specified locating features in the finished condition. Put the inspection record and delivery dates on the same order as the parts.</p>

<h2>Split the lines with a clear process or lead-time reason</h2>
<p>A ground guide shaft may be better placed with a shop that can heat-treat and finish-grind it on the required schedule. Use the same released BOM for both orders. Give the shaft shop the final journal requirements and get the mating bearing or bushing designation onto the relevant drawings. At receiving, check the shaft report and assign the actual fit check to the assembly team.</p>
<p>Give each shop its drawing revisions on the purchase order. If the bearing changes, review both drawings and make sure both suppliers have the updated issue before they continue work. Keep the dates for each delivery against the assembly schedule so you can see which late part will hold up the build.</p>
<figure>
  <img src="/assets/images/automation-shaft-and-sensor-brackets.webp" width="1050" height="700" alt="Ground guide shaft on V-blocks with separate trays of machined brackets and gripper fingers" loading="lazy" decoding="async">
  <figcaption>A ground shaft and separate batches of brackets and fingers at a receiving bench. AI-generated illustration.</figcaption>
</figure>

<h2>Example order for one assembly station</h2>
<p>Suppose the frame is ready to build and the station needs a plate, a dowelled nest, two fingers, a ground shaft and four sensor brackets. The plate and nest can go to the same shop with a trial fit on the order. If the frame team needs the plate first, agree how the nest will be checked once it arrives before you release the plate.</p>
<p>Keep the fingers together and order them once the gripper and the test part are agreed. Send the shaft to the grinding shop and give receiving the final journal dimensions to check. Put the four brackets on the order that gets them to the bench by installation day. The builder still signs off on the complete station.</p>

<h2>Compare the cost at the assembly bench</h2>
<p>Get line prices for both options using the same quantities, drawings, finishes and inspection scope. Ask for the dates each group can actually ship. Then add the work your team will still have to do.</p>
<ul>
  <li>Setup, tooling, minimum charges and first articles.</li>
  <li>Outside processing and checks after finishing.</li>
  <li>Freight, receiving inspection and any trial fit still outstanding.</li>
  <li>The cost of a second shipment or repeat inspection if a part needs rework.</li>
</ul>
<p>For example, say two shops quote $300 less in total for the parts. Add $120 for extra freight and $250 for inspection and fit checks. The split costs $70 more before any schedule or rework costs. Use the freight and inspection costs you expect on your own order. See <a href="/blog/cnc-machining-costs">what goes into a CNC machining quote</a> for the machining side of the comparison.</p>

<h2>What to send with the RFQ</h2>
<ul>
  <li>The BOM with part numbers, drawing revisions, quantities, materials and finishes.</li>
  <li>Released 2D drawings, any available 3D models and the assembly view for parts that locate on each other.</li>
  <li>Parts to quote as a set, the required checks and who supplies mating parts or gauges.</li>
  <li>The date each group is needed on the assembly bench and any parts that can ship early.</li>
</ul>
<p>When you send an <a href="/industries/automation-equipment">automation equipment parts RFQ</a>, flag any lines another shop will make if they affect the fit. Include the mating drawing or assembly view so the quoting shop can see the interfaces it needs to work to.</p>

<h2>Frequently Asked Questions</h2>
<div class="spm-article-faq">
${faqs.map(({ question, answer }) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('\n')}
</div>`,
  faqs,
};
