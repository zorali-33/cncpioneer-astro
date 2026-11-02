import { applyArchiveMetadata, getReviewedSeo } from "./data/pageSeoOverrides.mjs";
import { addArchiveContentTarget } from "./blog-link-repairs.mjs";

export const authorPostsPerPage = 6;

export function getAuthorPostsPerPage(author) {
  return author === "ryan-wang" || author === "david-li" ? 9 : authorPostsPerPage;
}

const siteUrl = "https://www.cncpioneer.com";
const authorCanonical = (author, page) => page === 1
  ? `${siteUrl}/author/${author}`
  : `${siteUrl}/author/${author}/page/${page}`;
const authorPaginationHref = (author, page) => page === 1
  ? `/author/${author}/`
  : `/author/${author}/page/${page}`;
const authorLocalPath = (author, page) => page === 1
  ? `/author/${author}`
  : `/author/${author}/page/${page}`;

export function getAuthorPageEntries(articles) {
  const counts = new Map();
  for (const article of articles) {
    if (!article.authorSlug) continue;
    counts.set(article.authorSlug, (counts.get(article.authorSlug) || 0) + 1);
  }

  return [...counts.entries()].flatMap(([author, count]) => {
    const lastPage = Math.ceil(count / getAuthorPostsPerPage(author));
    return Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) => ({
      author,
      page: index + 2,
    }));
  });
}

export function renderAuthorArchive(template, articles, author, page) {
  const authorArticles = articles.filter((article) => article.authorSlug === author);
  const perPage = getAuthorPostsPerPage(author);
  const lastPage = Math.ceil(authorArticles.length / perPage);
  if (!Number.isInteger(page) || page < 1 || page > lastPage) {
    throw new Error(`Invalid author page: ${author}/page/${page}`);
  }

  const authorName = authorDisplayName(author, authorArticles[0]?.authorName);
  const listStartTag = '<div class="elementor-posts-container elementor-posts elementor-posts--skin-classic elementor-grid" role="list">';
  const listStart = template.indexOf(listStartTag);
  const anchorStart = template.indexOf('<div class="e-load-more-anchor"', listStart);
  const listEnd = template.lastIndexOf("</div>", anchorStart);
  if (listStart < 0 || anchorStart < 0 || listEnd < 0 || template.slice(listEnd + 6, anchorStart).trim()) {
    throw new Error(`Author archive card container changed: ${author}`);
  }

  const cards = authorArticles
    .slice((page - 1) * perPage, page * perPage)
    .map(postCard);
  const title = page === 1
    ? decodeHtmlEntities(template.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || `${authorName}, Author at CNCPioneer`)
    : `${authorName}, Author at CNCPioneer - Page ${page} of ${lastPage}`;
  const previous = page > 1 ? `\n\t<link rel="prev" href="${authorCanonical(author, page - 1)}" />` : "";
  const next = page < lastPage ? `\n\t<link rel="next" href="${authorCanonical(author, page + 1)}" />` : "";

  const html = template
    .slice(0, listStart + listStartTag.length)
    .concat(`\n${cards.join("\n")}\n`, template.slice(listEnd))
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>\s*/i, (tag) => page === 1 ? tag : "")
    .replace(/<link rel="(?:prev|next)" href="[^"]+"\s*\/?>\s*/gi, "")
    .replace(/<link rel="canonical" href="[^"]+"\s*\/?>/i, `<link rel="canonical" href="${authorCanonical(author, page)}" />${previous}${next}`)
    .replace(/property="og:title" content="[^"]*"/i, `property="og:title" content="${escapeHtml(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>\s*/i, (tag) => page === 1 ? tag : "")
    .replace(/property="og:url" content="[^"]*"/i, `property="og:url" content="${authorCanonical(author, page)}"`)
    .replace(/<h4 class="elementor-author-box__name">\s*[\s\S]*?\s*<\/h4>/i, `<h1 class="elementor-author-box__name">${escapeHtml(authorName)}</h1>`)
    .replace(/<div class="e-load-more-anchor"[^>]*><\/div>/, renderAuthorLoadMoreAnchor(author, page, lastPage))
    .replace(/<nav class="elementor-pagination"[\s\S]*?<\/nav>/, renderAuthorPagination(author, page, lastPage));

  const description = getReviewedSeo(authorLocalPath(author, page)).description
    || `Read CNC machining articles by ${authorName} on Swiss machining, turning and milling, materials, and component design.${page > 1 ? ` Browse page ${page} of the article archive.` : ""}`;
  return addArchiveContentTarget(localizeBodyLinks(injectAuthorArchiveCardStyles(applyArchiveMetadata(html, { title, description }))));
}

function postCard(post) {
  const url = `/blog/${post.slug}`;
  const title = decodeHtmlEntities(post.displayTitle || post.title);
  return `<article class="elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry category-blog" role="listitem">
    <a class="elementor-post__thumbnail__link" href="${url}" tabindex="-1">
      <div class="elementor-post__thumbnail"><img src="${escapeHtml(post.image)}" class="attachment-medium size-medium" alt="${escapeHtml(title)}" loading="lazy" decoding="async" /></div>
    </a>
    <div class="elementor-post__text">
      <h3 class="elementor-post__title"><a href="${url}">${escapeHtml(title)}</a></h3>
      <div class="elementor-post__meta-data"><span class="elementor-post-date">${formatDate(post.published)}</span></div>
      <a class="elementor-post__read-more" href="${url}" aria-label="Read more about ${escapeHtml(title)}" tabindex="-1">Read More »</a>
    </div>
  </article>`;
}

export function renderAuthorLoadMoreAnchor(author, page, lastPage) {
  return `<div class="e-load-more-anchor" data-page="${page}" data-max-page="${lastPage}" data-next-page="${page < lastPage ? authorLocalPath(author, page + 1) : ""}"></div>`;
}

export function renderAuthorPagination(author, page, lastPage) {
  const visible = new Set([1, lastPage]);
  for (let number = Math.max(1, page - 2); number <= Math.min(lastPage, page + 2); number++) {
    visible.add(number);
  }

  const numbers = [...visible].sort((a, b) => a - b);
  const items = [];
  if (page > 1) items.push(`<a class="page-numbers prev" href="${authorPaginationHref(author, page - 1)}" rel="prev">&laquo; Previous</a>`);
  let previous = 0;
  for (const number of numbers) {
    if (number - previous > 1) items.push('<span class="page-numbers dots">&hellip;</span>');
    items.push(number === page
      ? `<span aria-current="page" class="page-numbers current"><span class="elementor-screen-only">Page</span>${number}</span>`
      : `<a class="page-numbers" href="${authorPaginationHref(author, number)}"><span class="elementor-screen-only">Page</span>${number}</a>`);
    previous = number;
  }
  if (page < lastPage) items.push(`<a class="page-numbers next" href="${authorPaginationHref(author, page + 1)}" rel="next">Next &raquo;</a>`);
  return `<nav class="elementor-pagination" aria-label="Pagination">${items.join("\n")}</nav>`;
}

export function getAuthorArchivePosts(articles, author, page = 1) {
  const perPage = getAuthorPostsPerPage(author);
  return articles
    .filter((article) => article.authorSlug === author)
    .slice((page - 1) * perPage, page * perPage)
    .map((article, index) => ({
      title: decodeHtmlEntities(article.displayTitle || article.title),
      href: `/blog/${article.slug}`,
      image: article.image,
      alt: decodeHtmlEntities(article.displayTitle || article.title),
      date: formatDate(article.published),
      priority: index < 2,
    }));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function titleCase(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function authorDisplayName(author, extractedName) {
  const knownAuthors = {
    "david-li": "David Li",
    "ryan-wang": "Ryan Wang",
  };
  const cleanName = String(extractedName || "").trim();
  if (knownAuthors[author]) return knownAuthors[author];
  if (cleanName && !/^written by$/i.test(cleanName)) return cleanName;
  return titleCase(author);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function localizeBodyLinks(html) {
  const headEnd = html.search(/<\/head>/i);
  if (headEnd < 0) return html;
  const splitAt = html.indexOf(">", headEnd) + 1;
  return html.slice(0, splitAt) + html.slice(splitAt)
    .replace(/href="https:\/\/www\.cncpioneer\.com\/?"/g, 'href="/"')
    .replace(/href="https:\/\/www\.cncpioneer\.com(\/[^"#?]*)"/g, 'href="$1"');
}

function injectAuthorArchiveCardStyles(html) {
  const style = `<style id="author-archive-card-ux">
.archive.author .elementor-widget-archive-posts .elementor-posts-container {
  align-items: start;
}
.archive.author .elementor-widget-archive-posts .elementor-post {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.archive.author .elementor-widget-archive-posts .elementor-post__thumbnail__link {
  display: block;
  width: 100%;
  margin-bottom: 16px !important;
}
.archive.author .elementor-widget-archive-posts .elementor-post__thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 1.52 / 1;
  padding-bottom: 0 !important;
  overflow: hidden;
  background: #f4f6f8;
}
.archive.author .elementor-widget-archive-posts .elementor-post__thumbnail img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: center;
}
.archive.author .elementor-widget-archive-posts .elementor-post__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.archive.author .elementor-widget-archive-posts .elementor-post__title {
  margin: 0;
  line-height: 1.25;
}
.archive.author .elementor-widget-archive-posts .elementor-post__meta-data {
  margin-top: 0;
}
.archive.author .elementor-widget-archive-posts .elementor-post__read-more {
  align-self: flex-start;
  margin-top: 10px;
  line-height: 1.35;
}
@media (max-width: 767px) {
  .archive.author .elementor-location-header nav.elementor-nav-menu--dropdown[aria-hidden="false"] {
    max-height: calc(100dvh - 180px) !important;
    overflow-y: auto !important;
    overscroll-behavior: contain;
  }

  .archive.author .elementor-author-box {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr);
    gap: 14px 25px;
    text-align: left;
  }

  .archive.author .elementor-author-box__avatar {
    grid-column: 1;
    grid-row: 1;
    width: 100px;
    margin: 0 !important;
  }

  .archive.author .elementor-author-box__text {
    display: contents;
  }

  .archive.author .elementor-author-box__text > a,
  .archive.author .elementor-author-box__text > .elementor-author-box__name {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
  }

  .archive.author .elementor-author-box__name {
    margin: 0;
  }

  .archive.author .elementor-author-box__bio {
    grid-column: 1 / -1;
    grid-row: 2;
    margin: 0;
  }

  .archive.author .elementor-location-header .e-con-boxed > .e-con-inner,
  .archive.author .elementor-location-archive > .e-con-boxed > .e-con-inner,
  .archive.author .elementor-location-footer > .e-con-boxed > .e-con-inner {
    box-sizing: border-box;
    padding-inline: 15px !important;
  }

  .archive.author .elementor-widget-archive-posts .elementor-post__thumbnail {
    aspect-ratio: 2 / 1;
  }
}
</style>`;

  return html.replace(/<\/head>/i, `${style}\n</head>`);
}
