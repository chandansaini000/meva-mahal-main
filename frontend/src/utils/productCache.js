const CACHE_KEY = "mevamahal_products_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function getCachedProducts() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) return null;

    const data = JSON.parse(cached);

    // Cache expire ho gaya
    if (Date.now() - data.timestamp > CACHE_TIME) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.products;
  } catch (error) {
    console.error("Product cache read error:", error);
    return null;
  }
}

export function setCachedProducts(products) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        products,
      })
    );
  } catch (error) {
    console.error("Product cache save error:", error);
  }
}

export function clearProductCache() {
  localStorage.removeItem(CACHE_KEY);
}