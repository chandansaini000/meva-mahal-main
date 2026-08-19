const CACHE_PREFIX = "mevamahal_related_products_";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

function getCacheKey(categorySlug) {
  return `${CACHE_PREFIX}${categorySlug}`;
}

export function getCachedRelatedProducts(categorySlug) {
  try {
    if (!categorySlug) return null;

    const cached = localStorage.getItem(
      getCacheKey(categorySlug)
    );

    if (!cached) return null;

    const data = JSON.parse(cached);

    if (Date.now() - data.timestamp > CACHE_TIME) {
      localStorage.removeItem(getCacheKey(categorySlug));
      return null;
    }

    return data.products;
  } catch (error) {
    console.error(
      "Related products cache read error:",
      error
    );

    return null;
  }
}

export function setCachedRelatedProducts(
  categorySlug,
  products
) {
  try {
    if (!categorySlug || !Array.isArray(products)) return;

    localStorage.setItem(
      getCacheKey(categorySlug),
      JSON.stringify({
        timestamp: Date.now(),
        products,
      })
    );
  } catch (error) {
    console.error(
      "Related products cache save error:",
      error
    );
  }
}

export function clearRelatedProductsCache(categorySlug) {
  if (!categorySlug) return;

  localStorage.removeItem(
    getCacheKey(categorySlug)
  );
}