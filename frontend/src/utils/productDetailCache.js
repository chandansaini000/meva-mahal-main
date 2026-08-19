const CACHE_PREFIX = "mevamahal_product_detail_";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

function getCacheKey(slug) {
  return `${CACHE_PREFIX}${slug}`;
}

export function getCachedProductDetail(slug) {
  try {
    if (!slug) return null;

    const cached = localStorage.getItem(getCacheKey(slug));

    if (!cached) return null;

    const data = JSON.parse(cached);

    if (Date.now() - data.timestamp > CACHE_TIME) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    return data.product;
  } catch (error) {
    console.error("Product detail cache read error:", error);
    return null;
  }
}

export function setCachedProductDetail(slug, product) {
  try {
    if (!slug || !product) return;

    localStorage.setItem(
      getCacheKey(slug),
      JSON.stringify({
        timestamp: Date.now(),
        product,
      })
    );
  } catch (error) {
    console.error("Product detail cache save error:", error);
  }
}

export function clearCachedProductDetail(slug) {
  if (!slug) return;

  localStorage.removeItem(getCacheKey(slug));
}