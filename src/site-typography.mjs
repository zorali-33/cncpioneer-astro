import * as css from 'css-tree';
import {list} from 'postcss';

export const siteFontFamily = 'var(--font-sans)';
export const siteFonts = [
  {family: 'Inter', token: '--font-sans', url: '/assets/fonts/inter-latin-variable.woff2'},
  {family: 'DM Sans', token: '--font-heading', url: '/assets/fonts/dm-sans-latin-variable.woff2'},
  {family: 'JetBrains Mono', token: '--font-mono', url: '/assets/fonts/jetbrains-mono-latin-variable.woff2'},
];
export const siteFontUrl = siteFonts[0].url;
export const headingFontUrl = siteFonts[1].url;

// Classify the element receiving a declaration, never a heading ancestor or
// a class inside :not(). The shared theme supplies roles without declarations.
function subject(selector='') {
  return selector.replace(/:not\([^)]*\)|\[[^\]]*\]/g,'').trim().split(/[\s>+~]+/).at(-1)||'';
}

export function headingType(selector='') {
  if(/footer|copyright|site-search|article-share__label/.test(selector))return null;
  const target=subject(selector);
  if(/\bh1\b|\.author-name(?:\b|$)/.test(target)) {
    if(/home-hero/.test(selector))return 'h1-home';
    if(/detail-title-hero/.test(selector))return 'h1-article';
    return 'h1';
  }
  if(/\bh2\b|\.(?:section-title|detail-section-title|learning-title|archive-heading)(?:\b|$)/.test(target))return /article-content/.test(selector)?'h2-article':'h2';
  if(/\bh3\b/.test(target))return 'h3';
  if(/\bh4\b/.test(target))return 'h4';
  return null;
}

export function typographyRole(selector='') {
  const target=subject(selector);
  if(/faq/i.test(selector)&&(/summary|faq-question/.test(target)))return 'faq-question';
  if(/faq/i.test(selector)&&(/^(p|li)(?:[.:#]|$)|faq-answer$/.test(target)))return 'faq-answer';
  if(/eyebrow|kicker|(?:stat|badge|param(?:eter)?)[-_]label|pl-step/.test(target))return 'label';
  if(/step[-_]number|cert(?:ificate)?[-_]code|status[-_](?:tag|label)|number-label/.test(target))return 'micro';
  if(/figcaption|caption/.test(target))return 'caption';
  if(/^small(?:[.:#]|$)|\.text-small(?:\b|$)/.test(target))return 'small';
  if(/\.body-small(?:\b|$)/.test(target))return 'body-small';
  return headingType(selector);
}

export function familyForRole(role) {
  return /^(?:h[1-4]|faq-question)/.test(role||'')?'var(--font-heading)':
    ['label','micro'].includes(role)?'var(--font-mono)':siteFontFamily;
}

// Preserve font sizes, weights, line heights and responsive expressions while
// replacing the family in CSS shorthands, including quoted multiword families.
export function normalizeFontShorthand(value, family=siteFontFamily) {
  if(/^(?:inherit|initial|unset|revert(?:-layer)?)$/.test(value.trim()))return value;
  if(/var\(--font-(?:sans|heading|mono)\)/.test(value))return value.replace(/var\(--font-(?:sans|heading|mono)\)/g,family);
  const ast=css.parse(value,{context:'value',positions:true});
  const fragments=css.lexer.findValueFragments('font',ast,'Property','font-family');
  const offsets=fragments.flatMap(fragment=>fragment.nodes.toArray().map(n=>n.loc.start.offset));
  if(!offsets.length)throw Error(`Cannot safely normalize font shorthand: ${value}`);
  return value.slice(0,Math.min(...offsets))+family;
}

export function normalizeFontDeclarations(root, inlineSelector='') {
  // Only the three local faces declared centrally in /brand-theme.css may load.
  root.walkAtRules('font-face',rule=>rule.remove());
  root.walkAtRules('import',rule=>{if(/fonts\.(?:googleapis|gstatic)\.com/.test(rule.params))rule.remove();});
  if(!inlineSelector)root.walkRules(rule=>{
    const selectors=list.comma(rule.selector);
    if(new Set(selectors.map(typographyRole)).size<2)return;
    for(const selector of selectors)rule.cloneBefore({selector});
    rule.remove();
  });
  root.walkDecls(decl=>{
    const role=typographyRole(inlineSelector||decl.parent.selector||'');
    if(decl.prop.toLowerCase()==='font-family')decl.value=familyForRole(role);
    else if(decl.prop.toLowerCase()==='font')decl.value=normalizeFontShorthand(decl.value,familyForRole(role)).replace(/\b[6-9]00\b/g,'500');
    if(role) {
      if(decl.prop==='font-size')decl.value=`var(--type-${role})`;
      if(decl.prop==='font-weight')decl.value=/^h[12]|faq-answer|caption|small|body-small/.test(role)?'400':'500';
      if(decl.prop==='line-height')decl.value=role.startsWith('h1')?'1.12':/^h[234]/.test(role)?'1.2':'1.6';
    } else if(decl.prop==='font-weight') {
      if(/^[123]00$/.test(decl.value))decl.value='400';
      if(/^[6-9]00$/.test(decl.value)||decl.value==='bold')decl.value='500';
    }
  });
}
