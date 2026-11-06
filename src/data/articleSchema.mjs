import { SITE_URL, canonicalPageUrl, absoluteAssetUrl } from './siteUrls.mjs';
import { getPageModifiedTime } from './pageDates.mjs';
import {blogCategoryFor} from './blogCategories.mjs';

export const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

export function createArticleSchema(article, author, contributors = []) {
  const canonical = canonicalPageUrl(article.canonical);
  const category=blogCategoryFor(new URL(canonical).pathname.split('/').pop());
  const person = (value) => ({
    '@type': 'Person', '@id': canonicalPageUrl(value.href) + '#person',
    name: value.name, url: canonicalPageUrl(value.href),
  });
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    '@id': canonical + '#article', url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline: article.articleTitle, description: article.description,
    ...(category?{articleSection:category.name}:{}),
    ...(article.image ? { image: [absoluteAssetUrl(article.image)] } : {}),
    ...(article.publishedTime ? { datePublished: article.publishedTime } : {}),
    dateModified: getPageModifiedTime(canonical, article.modifiedTime, article.publishedTime),
    author: person(author),
    ...(contributors.length ? { contributor: contributors.map(person) } : {}),
    publisher: { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'CNCPioneer', url: SITE_URL + '/' },
    inLanguage: 'en-US',
  };
}
