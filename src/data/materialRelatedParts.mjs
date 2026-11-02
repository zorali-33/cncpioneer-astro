import { productContent } from "./productContent.mjs";
import { nativeParts } from "./nativeParts.mjs";

const relatedProductSlugs = {
  "brass-swiss-machining": [
    "brass-contact-pins",
    "brass-threaded-bushings",
    "brass-pneumatic-fittings",
  ],
  "stainless-steel-swiss-machining": [
    "stainless-steel-precision-turning-shaft",
    "stainless-steel-bushing",
    "stainless-steel-fittings",
  ],
  "stainless-steel-cnc-turning-and-milling": [
    "stainless-steel-cnc-turning-flanges",
    "stainless-steel-fittings",
    "stainless-steel-precision-turning-shaft",
  ],
};

// Single-component restagings for the material pages' catalog style.
const productCardImages = {
  "brass-contact-pins": "/assets/material-cards/brass-swiss-contact-pin-studio-v1.webp",
  "brass-threaded-bushings": "/assets/material-cards/brass-swiss-threaded-bushing-studio-v1.webp",
  "brass-pneumatic-fittings": "/assets/material-cards/brass-swiss-pneumatic-fitting-studio-v1.webp",
  "stainless-steel-cnc-turning-flanges": "/assets/material-cards/stainless-turnmill-flange-studio-v1.webp",
  "stainless-steel-precision-turning-shaft": "/assets/material-cards/stainless-swiss-shaft-studio-v1.webp",
  "stainless-steel-bushing": "/assets/material-cards/stainless-swiss-bushing-studio-v1.webp",
  "stainless-steel-fittings": "/assets/material-cards/stainless-swiss-fitting-studio-v1.webp",
};

export function getMaterialRelatedParts(materialSlug, fallbackParts) {
  const slugs = relatedProductSlugs[materialSlug];
  if (!slugs) return fallbackParts;

  return slugs.map((slug) => {
    const product = productContent[slug];
    const nativeProduct = nativeParts.find((part) => part.slug === slug);
    const name = product?.label || nativeProduct?.title;
    const overviewImage = product?.overviewImage || nativeProduct?.sections?.[0]?.image;
    if (!name || !overviewImage) {
      throw new Error(`Missing related product overview image: ${slug}`);
    }

    return {
      name,
      href: `/custom-cnc-parts/${slug}`,
      image: productCardImages[slug] || overviewImage,
      alt: name,
    };
  });
}
