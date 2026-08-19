const CACHE_KEY = "mevamahal_categories_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function getCachedCategories() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) return null;

    const data = JSON.parse(cached);

    if (Date.now() - data.timestamp > CACHE_TIME) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.categories;
  } catch (error) {
    console.error("Category cache read error:", error);
    return null;
  }
}

export function setCachedCategories(categories) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        categories,
      })
    );
  } catch (error) {
    console.error("Category cache save error:", error);
  }
}

export function clearCategoryCache() {
  localStorage.removeItem(CACHE_KEY);
}