import { buildSearchIndex } from "../search-index.mjs";
import { getBlogArticles } from "../blog-archive.mjs";

const blogPages = import.meta.glob("../mirrored-pages/blog/*/index.html", { query: "?raw", import: "default", eager: true });
export function GET() {
  return new Response(JSON.stringify(buildSearchIndex(getBlogArticles(blogPages))), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
