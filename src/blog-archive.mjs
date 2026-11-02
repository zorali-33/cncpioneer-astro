import { applyArchiveMetadata, getReviewedSeo } from "./data/pageSeoOverrides.mjs";
import { addArchiveContentTarget } from "./blog-link-repairs.mjs";
import { existsSync } from "node:fs";
import path from "node:path";
import { blogEditorialOverrides } from "./blog-editorial-overrides.mjs";
import { blogConsolidatedArticles } from "./data/blogConsolidatedArticles.mjs";
import { consolidatedBlogSlugs } from "./data/blogConsolidation.mjs";
import { removedBlogSlugs } from "./data/blogRemovals.mjs";
import { optimizedImageUrl } from './image-assets.mjs';

export const postsPerPage = 9;
const publicRoot = path.resolve(process.cwd(), "public");
const archivePath = (page) => page === 1 ? "/blog" : `/blog/page/${page}`;

function meta(html, property) {
  const value = html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`, "i"))?.[1];
  if (!value) throw new Error(`Missing ${property} in blog post`);
  return value;
}

function optionalMeta(html, property) {
  return html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`, "i"))?.[1] || "";
}

function localImage(html) {
  const available = (image) => (image?.startsWith("/wp-content/uploads/") || image?.startsWith('/assets/images/'))
    && existsSync(path.join(publicRoot, optimizedImageUrl(image).slice(1)));
  const featured = meta(html, "og:image");
  if (available(featured)) return featured;

  const content = html.slice(html.indexOf('id="main-article-content"'));
  const candidates = [...content.matchAll(/(?:data-lazy-src|src)="(\/wp-content\/uploads\/[^"?]+)(?:\?[^\"]*)?"/g)]
    .map((match) => match[1]);
  const replacement = candidates.find((image) =>
    !/(?:ryan-wang|david-li|logo|site-icon|avatar)/i.test(image) && available(image));
  if (!replacement) throw new Error(`No local blog image for ${featured}`);
  return replacement;
}

export function getBlogArticles(pages) {
  return Object.entries(pages)
    .map(([file, html]) => {
      const published = optionalMeta(html, "article:published_time");
      if (!published || /<meta\s+name="robots"\s+content="noindex,\s*follow"/i.test(html)) return null;

      const slug = file.split("/").at(-2);
      if (Object.hasOwn(consolidatedBlogSlugs, slug) || removedBlogSlugs.has(slug)) return null;
      const editorial = blogConsolidatedArticles[slug] || blogEditorialOverrides[slug];

      return {
        slug,
        title: editorial?.title || meta(html, "og:title").replace(/ [|\-] CNCPioneer$/, ""),
        displayTitle: editorial?.title || postTitle(html),
        published,
        image: editorial?.image || localImage(html),
        authorName: authorName(html),
        authorSlug: authorSlug(html),
      };
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published) || a.slug.localeCompare(b.slug));
}

function authorName(html) {
  const postInfo = html.match(/elementor-post-info__item--type-author[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)?.[1];
  const boxName = html.match(/elementor-author-box__name[\s\S]*?>([\s\S]*?)<\/h4>/i)?.[1];
  return cleanText(postInfo || boxName || "");
}

function authorSlug(html) {
  const link = html.match(/href="\/author\/([^"]+)"/i)?.[1] || "";
  return link.replace(/\/+$/, "");
}

function postTitle(html) {
  const title = html.match(/<h1[^>]*class="[^"]*elementor-heading-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    || meta(html, "og:title").replace(/(?: -|\s\|)\s*CNCPioneer$/, "");
  return cleanText(title);
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function postCard(post) {
  const url = `/blog/${post.slug}`;
  return `<article class="elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry category-blog" role="listitem">
    <div class="elementor-post__card">
      <a class="elementor-post__thumbnail__link" href="${url}" tabindex="-1"><div class="elementor-post__thumbnail"><img src="${post.image}" class="attachment-full size-full" alt="${post.title}" loading="lazy" decoding="async" /></div></a>
      <div class="elementor-post__text">
        <h4 class="elementor-post__title"><a href="${url}">${post.title}</a></h4>
        <a class="elementor-post__read-more" href="${url}" aria-label="Read more about ${post.title}" tabindex="-1">Read More</a>
      </div>
    </div>
  </article>`;
}

function pagination(page, lastPage) {
  const visible = new Set([1, lastPage]);
  for (let number = Math.max(1, page - 2); number <= Math.min(lastPage, page + 2); number++) {
    visible.add(number);
  }
  const numbers = [...visible].sort((a, b) => a - b);
  const items = [`<a class="page-numbers prev" href="${archivePath(page - 1)}">&laquo; Previous</a>`];
  let previous = 0;
  for (const number of numbers) {
    if (number - previous > 1) items.push('<span class="page-numbers dots">&hellip;</span>');
    items.push(number === page
      ? `<span aria-current="page" class="page-numbers current"><span class="elementor-screen-only">Page</span>${number}</span>`
      : `<a class="page-numbers" href="${archivePath(number)}"><span class="elementor-screen-only">Page</span>${number}</a>`);
    previous = number;
  }
  if (page < lastPage) items.push(`<a class="page-numbers next" href="${archivePath(page + 1)}">Next &raquo;</a>`);
  return `<nav class="elementor-pagination" aria-label="Pagination">${items.join("\n")}</nav>`;
}

export function renderBlogArchive(template, articles, page) {
  const lastPage = Math.ceil(articles.length / postsPerPage);
  if (!Number.isInteger(page) || page < 2 || page > lastPage) throw new Error(`Invalid blog page: ${page}`);

  const listStartTag = '<div class="elementor-posts-container elementor-posts elementor-posts--skin-cards elementor-grid" role="list">';
  const listStart = template.indexOf(listStartTag);
  const anchorStart = template.indexOf('<div class="e-load-more-anchor"', listStart);
  const listEnd = template.lastIndexOf("</div>", anchorStart);
  if (listStart < 0 || anchorStart < 0 || listEnd < 0 || template.slice(listEnd + 6, anchorStart).trim()) {
    throw new Error("Blog archive card container changed");
  }

  const cards = articles.slice((page - 1) * postsPerPage, page * postsPerPage).map(postCard);
  const { title, description } = {
    title: `CNC Machining Blog – Page ${page} | CNCPioneer`,
    description: `Browse page ${page} of CNCPioneer’s CNC machining blog. Explore more guides to processes, materials, component design, and inspection.`,
    ...getReviewedSeo(archivePath(page)),
  };
  const previous = `<link rel="prev" href="${archivePath(page - 1)}" />`;
  const next = page < lastPage ? `\n\t<link rel="next" href="${archivePath(page + 1)}" />` : "";
  return addArchiveContentTarget(applyArchiveMetadata(template
    .slice(0, listStart + listStartTag.length)
    .concat(`\n${cards.join("\n")}\n`, template.slice(listEnd))
    .replace('rel="canonical" href="/blog"', `rel="canonical" href="${archivePath(page)}"`)
    .replace('<link rel="next" href="/blog/page/2" />', `${previous}${next}`)
    .replace('property="og:url" content="/blog"', `property="og:url" content="${archivePath(page)}"`)
    .replace(/<div class="e-load-more-anchor"[^>]*><\/div>/, `<div class="e-load-more-anchor" data-page="${page}" data-max-page="${lastPage}" data-next-page="${page < lastPage ? archivePath(page + 1) : ""}"></div>`)
    .replace(/<nav class="elementor-pagination"[\s\S]*?<\/nav>/, pagination(page, lastPage))
    .replace(/(<a\b[^>]*\bhref=")https:\/\/www\.cncpioneer\.com(?=\/|")\/?/gi, "$1/"), { title, description }));
}
