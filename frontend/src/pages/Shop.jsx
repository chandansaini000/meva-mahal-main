import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const quickFilters = ["Best seller", "New arrival", "On sale", "In stock", "Featured"];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [query, setQuery] = useState(searchQuery);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("newest");
  const [price, setPrice] = useState("");
  const [quick, setQuick] = useState("");

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const selectedCategory = searchParams.get("category") || "";
    setCategory(selectedCategory);
    setQuery(searchQuery);
  }, [searchParams, searchQuery]);

  useEffect(() => {
    setLoading(true);

    const params = {
      q: query,
      category,
      sort,
      limit: 100,
      newArrival: quick === "New arrival" ? "true" : undefined,
      bestSeller: quick === "Best seller" ? "true" : undefined,
      featured: quick === "Featured" ? "true" : undefined,
    };

    if (price === "under-500") params.maxPrice = 500;
    if (price === "500-1000") {
      params.minPrice = 500;
      params.maxPrice = 1000;
    }
    if (price === "over-1000") params.minPrice = 1000;

    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, category, sort, price, quick]);

  const shown = useMemo(
    () =>
      products.filter((product) => {
        if (quick === "On sale") return Number(product.compare_price) > Number(product.price);
        if (quick === "In stock") return product.stock > 0;
        return true;
      }),
    [products, quick]
  );

  function toggleQuick(label) {
    const next = quick === label ? "" : label;
    setQuick(next);

    if (next === "Best seller") setSort("rating");
    if (next === "New arrival") setSort("newest");
  }

  function updateCategoryFromUrl(selectedCategory) {
    const nextParams = new URLSearchParams(searchParams);

    if (selectedCategory) {
      nextParams.set("category", selectedCategory);
    } else {
      nextParams.delete("category");
    }

    setSearchParams(nextParams);
  }

  function handleCategoryInput(event) {
    const selected = event.target.value;
    setCategory(selected);
    updateCategoryFromUrl(selected);
  }

  function clearFilters() {
    setQuery("");
    setSort("newest");
    setPrice("");
    setQuick("");
    setCategory("");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    nextParams.delete("search");
    nextParams.delete("q");
    setSearchParams(nextParams);
  }

  function clearSearch() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("q");
    setSearchParams(nextParams);
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div data-aos="fade-up">
        <p className="uppercase tracking-[0.2em] text-xs text-clay font-medium">The pantry edit</p>
        <h1 className="font-display text-5xl mt-3">Premium Dry Fruits</h1>
        <p className="text-sm text-ink/55 mt-4">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : category
            ? `Category: ${categories.find((item) => item.slug === category)?.name || category}`
            : "All products"}
        </p>
        <p className="text-sm text-ink/55 mt-1">
          Showing {shown.length} product{shown.length !== 1 ? "s" : ""}
          {category ? (
            <button
              type="button"
              onClick={() => updateCategoryFromUrl("")}
              className="ml-4 text-sm text-clay underline"
            >
              All Products
            </button>
          ) : null}
          {searchQuery ? (
            <button type="button" onClick={clearSearch} className="ml-4 text-sm text-clay underline">
              View all products
            </button>
          ) : null}
        </p>
      </div>

      <section className="mt-7 rounded-xl2 border border-line bg-white/70 p-3 shadow-sm" data-aos="fade-up">
        <div className="grid lg:grid-cols-[1.7fr_.7fr_.7fr_.7fr_auto] gap-3">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              className="input pl-10 h-full"
            />
          </label>

          <select value={category} onChange={handleCategoryInput} className="input">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option value={item.slug} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(event) => setSort(event.target.value)} className="input">
            <option value="newest">Latest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>

          <select value={price} onChange={(event) => setPrice(event.target.value)} className="input">
            <option value="">All prices</option>
            <option value="under-500">Under 500</option>
            <option value="500-1000">500 – 1,000</option>
            <option value="over-1000">Over 1,000</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-5 py-3 rounded-full bg-ink text-cream text-sm font-medium hover:bg-clayDark"
          >
            Reset
          </button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mt-5">
        {quickFilters.map((label) => (
          <button
            key={label}
            onClick={() => toggleQuick(label)}
            className={`px-4 py-2 border rounded-full text-sm transition-colors ${
              quick === label ? "bg-ink text-cream border-ink" : "border-line bg-white/50 hover:border-clay"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-10 mb-5 text-sm text-ink/50">
        <SlidersHorizontal className="w-4 h-4" /> Curated for your pantry
      </div>

      {loading ? (
        <p className="text-ink/45 py-16">Loading the harvest…</p>
      ) : shown.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {shown.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl2 border border-line text-center py-16">
          <p className="font-display text-2xl">
            {searchQuery ? `No products found for "${searchQuery}"` : "Nothing matched that search."}
          </p>
          <button onClick={clearFilters} className="text-clay underline mt-3">
            Clear filters
          </button>
        </div>
      )}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
  <div className="max-w-7xl mx-auto bg-ink border border-black/10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

      {/* Premium Quality */}
      <div className="flex items-center gap-5 px-6 py-6 lg:py-7 border-b sm:border-r lg:border-b-0 border-black/10">
        <div className="shrink-0 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 3l8 4v5c0 4.8-3.4 7.9-8 9-4.6-1.1-8-4.2-8-9V7l8-4z" />
            <path d="m8.5 12 2.2 2.2 4.8-5" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
            Premium Quality
          </h3>
          <p className="text-sm text-white mt-1">
            100% Quality Guarantee
          </p>
        </div>
      </div>

      {/* Swift Shipping */}
      <div className="flex items-center gap-5 px-6 py-6 lg:py-7 border-b lg:border-b-0 lg:border-r border-black/10">
        <div className="shrink-0 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 7h11v10H3z" />
            <path d="M14 10h4l3 3v4h-7z" />
            <circle cx="7" cy="19" r="2" />
            <circle cx="18" cy="19" r="2" />
            <path d="M5 5v-2M9 5v-2M13 5v-2" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
            Swift Shipping
          </h3>
          <p className="text-sm text-white mt-1">
            Delivering across India
          </p>
        </div>
      </div>

      {/* Easy Return */}
      <div className="flex items-center gap-5 px-6 py-6 lg:py-7 border-b sm:border-r lg:border-b-0 border-black/10">
        <div className="shrink-0 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 7h13a3 3 0 0 1 3 3v7H7a3 3 0 0 1-3-3V7z" />
            <path d="M7 7V5a2 2 0 0 1 2-2h8v4" />
            <circle cx="8" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            <path d="M13 10h4" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
            Easy Return
          </h3>
          <p className="text-sm text-white mt-1">
            Refer return policy
          </p>
        </div>
      </div>

      {/* 24/7 Support */}
      <div className="flex items-center gap-5 px-6 py-6 lg:py-7">
        <div className="shrink-0 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 13a8 8 0 0 1 16 0" />
            <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4z" />
            <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3z" />
            <path d="M9 19h4" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
            24/7 Support
          </h3>
          <p className="text-sm text-white mt-1">
            Support every time
          </p>
        </div>
      </div>

    </div>
  </div>
</section>
    </main>
  );
}
