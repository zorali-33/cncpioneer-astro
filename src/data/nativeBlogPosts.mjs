import { automationBlogPost } from './automationBlogPost.mjs';
import { spmBlogPost } from './spmBlogPost.mjs';

// Native editorial posts share the archive, search and related-post pipeline.
export const nativeBlogPosts = [automationBlogPost, spmBlogPost];
