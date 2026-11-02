import fs from "node:fs";
import path from "node:path";
import { nativeParts } from "../src/data/nativeParts.mjs";
import { productContent } from "../src/data/productContent.mjs";

const arg = (key) => { const index = process.argv.indexOf(key); return index < 0 ? undefined : process.argv[index + 1]; };
const dist = path.resolve(arg("--dist") || "dist");
const reportDir = path.resolve(arg("--report-dir") || "work/product-template");
fs.mkdirSync(reportDir, { recursive: true });
const failures = [];
const pages = [];
const requiredIds = ["product-overview", "machining-benefits", "product-portfolio", "industries-applications", "product-materials", "surface-treatments", "quality-control", "product-faq", "related-custom-cnc-parts"];
const resolve = (url) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(url, "http://local.test").pathname); } catch { return ""; }
  const file = path.join(dist, pathname);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  if (fs.existsSync(path.join(file, "index.html"))) return path.join(file, "index.html");
  return "";
};
for (const page of nativeParts) {
  const slug = page.slug;
  const reference = slug === "stainless-steel-cnc-turning-flanges";
  const file = resolve(`/custom-cnc-parts/${slug}`);
  if (!file) { failures.push({ slug, issue: "Missing built route" }); continue; }
  const html = fs.readFileSync(file, "utf8");
  const h1s = [...html.matchAll(/<h1\b[^>]*>/g)].length;
  const faqs = [...html.matchAll(/<details\b[^>]*class="[^"]*\bflange-faq-item\b/g)].length;
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => ({ src: tag.match(/\bsrc="([^"]*)"/)?.[1] || "", alt: tag.match(/\balt="([^"]*)"/)?.[1] || "" }));
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((m) => m[1]);
  const missingImages = images.filter((image) => !image.src || image.src.startsWith("/") && !resolve(image.src));
  const missingLinks = [...new Set(links.filter((url) => url.startsWith("/") && !resolve(url.split("#")[0] || "/")))];
  const missingSections = reference ? [] : requiredIds.filter((id) => !html.includes(`id="${id}"`));
  if (h1s !== 1) failures.push({ slug, issue: "H1 count", actual: h1s });
  if (faqs !== 5) failures.push({ slug, issue: "FAQ count", actual: faqs });
  if (!reference && !html.includes('data-product-template="flange-v1"')) failures.push({ slug, issue: "Missing common template" });
  if (missingSections.length) failures.push({ slug, issue: "Missing sections", actual: missingSections });
  if (missingImages.length) failures.push({ slug, issue: "Missing images", actual: missingImages });
  if (missingLinks.length) failures.push({ slug, issue: "Missing local links", actual: missingLinks });
  if (images.some((image) => !image.alt.trim())) failures.push({ slug, issue: "Empty image alt" });
  if (/<details\b[^>]*\bopen(?:\s|=|>)/.test(html)) failures.push({ slug, issue: "FAQ expanded by default" });
  pages.push({ slug, title: productContent[slug]?.title || page.title, template: reference ? "Approved reference" : "Shared product template", faqCount: faqs, images: images.length, industryLinks: productContent[slug]?.applications.length || 6, illustrationCount: productContent[slug]?.portfolio.filter((p) => p.illustration).length || 0, url: `http://127.0.0.1:4321/custom-cnc-parts/${slug}` });
}
const result = { checked: pages.length, migrated: pages.filter((p) => p.template === "Shared product template").length, reference: pages.filter((p) => p.template === "Approved reference").length, failures, pages };
fs.writeFileSync(path.join(reportDir, "built-pages-audit.json"), JSON.stringify(result, null, 2));
const csvCell = (s) => `"${String(s).replaceAll('"', '""')}"`;
const csv = ["Product,Slug,Template,FAQ count,Images,Industry links,Illustrations,Local URL", ...pages.map((p) => [p.title, p.slug, p.template, p.faqCount, p.images, p.industryLinks, p.illustrationCount, p.url].map(csvCell).join(","))].join("\r\n");
fs.writeFileSync(path.join(reportDir, "product-pages.csv"), "\ufeff" + csv);
console.log(JSON.stringify({ checked: result.checked, migrated: result.migrated, reference: result.reference, failures }, null, 2));
if (failures.length) process.exitCode = 1;
