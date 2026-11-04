// Link existing prose only. Specific destinations precede broader service terms.
const rules = [
  ['/services/swiss-machining', /\b(?:Swiss(?:-type)? CNC machining|Swiss(?:-type)? machining|Swiss turning)\b/i, 'service'],
  ['/services/5-axis-cnc-machining', /\b(?:5-axis CNC machining|five-axis machining|5-axis machining)\b/i, 'service'],
  ['/services/3-axis-cnc-machining', /\b(?:3-axis CNC machining|three-axis machining|3-axis machining)\b/i, 'service'],
  ['/services/cnc-turning-and-milling', /\b(?:CNC turning and milling|CNC turning|mill-turn machining|turn-mill machining)\b/i, 'service'],
  ['/services', /\bCNC machining services\b/i, 'service'],
  ['/', /\bCNCPioneer\b/, 'home'],
  ['/materials/nylon-66-cnc-machining', /\b(?:Nylon 66|PA66)\b/i, 'topic'],
  ['/materials/inconel-600-cnc-machining', /\bInconel 600\b/i, 'topic'],
  ['/materials/peek-cnc-turning-and-milling', /\bPEEK (?:turning and milling|turning|mill-turn machining)\b/i, 'topic'],
  ['/custom-cnc-parts/cnc-turning-precision-washers', /\bprecision washers\b/i, 'topic'],
  ['/custom-cnc-parts/satellite-connectors', /\bsatellite connectors\b/i, 'topic'],
  ['/custom-cnc-parts/screw-threaded-sleeve', /\b(?:screw threaded sleeves?|threaded sleeves?)\b/i, 'topic'],
  ['/custom-cnc-parts/semiconductor-probe-pin', /\bsemiconductor probe pins?\b/i, 'topic'],
  ['/custom-cnc-parts/robotic-machining-cells', /\brobotic machining cells?\b/i, 'topic'],
  ['/custom-cnc-parts/radar-systems-parts-machining', /\bradar (?:system )?(?:components|parts)\b/i, 'topic'],
  ['/custom-cnc-parts/cnc-custom-aluminum-shift-knob', /\balumin(?:um|ium) shift knobs?\b/i, 'topic'],
  ['/custom-cnc-parts/5-axis-cnc-machining-mechanical-parts', /\b5-axis machined mechanical parts\b/i, 'topic'],
  ['/industries/oil-gas-swiss-machining', /\bSwiss machining for oil and gas\b/i, 'topic'],
  ['/industries/defense-swiss-machining', /\bSwiss machining for defen[sc]e\b/i, 'topic'],
  ['/blog/cnc-boring', /\bCNC boring\b/i, 'topic'],
  ['/blog/cnc-drilling', /\bCNC drilling\b/i, 'topic'],
  ['/blog/3d-printing-vs-cnc-machining', /\b3D printing (?:versus|vs\.?|and) CNC machining\b/i, 'topic'],
  ['/blog/casting-vs-cnc-machining', /\bcasting (?:versus|vs\.?|and) CNC machining\b/i, 'topic'],
];

// Page-specific editorial additions, tied to an existing paragraph's subject.
const bridges = {
  '/services/5-axis-cnc-machining': ['Angled features, contoured surfaces', ' Examples to review include <a href="/custom-cnc-parts/5-axis-cnc-machining-mechanical-parts">multi-face mechanical parts</a> and components used in <a href="/custom-cnc-parts/robotic-machining-cells">robotic machining cells</a>.'],
  '/services/cnc-turning-and-milling': ['For parts that combine turned diameters', ' Part families include <a href="/custom-cnc-parts/cnc-turning-precision-washers">precision turned washers</a>, <a href="/custom-cnc-parts/screw-threaded-sleeve">threaded sleeves</a> and <a href="/custom-cnc-parts/cnc-custom-aluminum-shift-knob">custom aluminum shift knobs</a>; each requires its own drawing review.'],
  '/services/swiss-machining': ['Custom pins, shafts, terminals', ' For an application-specific starting point, see <a href="/custom-cnc-parts/semiconductor-probe-pin">semiconductor probe pins</a>, <a href="/industries/defense-swiss-machining">small turned defense components</a> or <a href="/industries/oil-gas-swiss-machining">Swiss-machined oil and gas components</a>.'],
  '/industries/satellites': ['Share drawings for structural frames', ' For connector interfaces, review the drawing considerations for <a href="/custom-cnc-parts/satellite-connectors">machined satellite connectors</a>.'],
  '/industries/defense': ['Get defense precision', ' For radar-related hardware, see <a href="/custom-cnc-parts/radar-systems-parts-machining">radar system component machining</a>.'],
  '/materials/nylon-cnc-machining': ['Nylon parts should be quoted', ' If the drawing specifies PA66, review the grade-specific considerations for <a href="/materials/nylon-66-cnc-machining">Nylon 66 machining</a>.'],
  '/materials/peek-cnc-machining': ['PEEK CNC Machining is suitable', ' For cylindrical parts with milled features, review <a href="/materials/peek-cnc-turning-and-milling">turning and milling PEEK components</a>.'],
  '/services/3-axis-cnc-machining': ['From flat mounting surfaces', ' Related process guides explain <a href="/blog/cnc-drilling">CNC drilling</a> and <a href="/blog/cnc-boring">CNC boring</a> when planning holes and finished bores.'],
  '/blog': ['Explore', ' For process comparisons, read about <a href="/blog/3d-printing-vs-cnc-machining">3D printing versus CNC machining</a> and <a href="/blog/casting-vs-cnc-machining">casting versus machining</a>.'],
};

export function applyContextualLinks(html, pathname) {
  if (html.includes('data-contextual-link=') || html.includes('data-contextual-bridge')) return html;
  const route = pathname.replace(/\/$/, '') || '/';
  if (/^\/(?:author|search)(?:\/|$)|\/page\//.test(route) || route === '/404.html' || route === '/resources/equipment-list') return html;
  const bridge = bridges[route];
  if (bridge && !html.includes('data-contextual-bridge')) {
    let added=false;
    html=html.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, block=>{
      if(added || !block.replace(/<[^>]*>/g,'').trim().startsWith(bridge[0])) return block;
      added=true;
      return block.replace('</p>',`<span data-contextual-bridge>${bridge[1]}</span></p>`);
    });
  }
  const used = new Set();
  // Do not duplicate a destination already linked in prose.
  for (const p of html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)) {
    for (const a of p[0].matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) used.add(a[1].replace(/\/$/, '') || '/');
  }
  const counts = {service:0, home:0, topic:0};
  const limits = {service:2, home:1, topic:2};
  const stack = [];
  let inParagraph = false, paragraphLinked = false;
  return html.split(/(<!--[\s\S]*?-->|<[^>]+>)/g).map(part => {
    if (part.startsWith('<')) {
      const close = part.match(/^<\/([\w-]+)/);
      const open = part.match(/^<([\w-]+)/);
      if (close) {
        const i=stack.map(x=>x.tag).lastIndexOf(close[1].toLowerCase());
        if(i>=0) stack.splice(i);
        if(close[1].toLowerCase()==='p') inParagraph=false;
      } else if(open) {
        const tag=open[1].toLowerCase();
        if(tag==='p') {inParagraph=true;paragraphLinked=false;}
        if(!/^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag)) stack.push({tag,blocked:/^(?:a|script|style|nav|header|footer|aside|form|button|noscript|svg)$/.test(tag)||/breadcrumb|quote-cta|quote-form|post-meta|caption/i.test(part)||/\bdata-no-contextual-links(?:[=\s>])/i.test(part)});
      }
      return part;
    }
    if(!inParagraph||paragraphLinked||!stack.some(x=>x.tag==='main')||stack.some(x=>x.blocked)) return part;
    for(const [to,pattern,kind] of rules) {
      if(to===route||used.has(to)||counts[kind]>=limits[kind]) continue;
      const match=pattern.exec(part);
      if(!match) continue;
      used.add(to);counts[kind]++;paragraphLinked=true;
      return part.slice(0,match.index)+`<a href="${to}" data-contextual-link="${kind}">${match[0]}</a>`+part.slice(match.index+match[0].length);
    }
    return part;
  }).join('');
}
