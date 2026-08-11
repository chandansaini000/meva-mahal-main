import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

function ReviewStars({ rating, interactive = false, value, onChange }) {
  return (
    <div className="flex gap-0.5 text-[#ffb400]" role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "Choose a rating" : `${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        return interactive ? (
          <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5" aria-label={`${star} star${star > 1 ? "s" : ""}`}>
            <Star className={`w-5 h-5 ${star <= value ? "fill-[#ffb400]" : ""}`} />
          </button>
        ) : <Star key={star} className={`w-4 h-4 ${star <= Number(rating) ? "fill-[#ffb400]" : ""}`} />;
      })}
    </div>
  );
}

function ReviewAvatar({ review }) {
  return (
    <div className="w-14 h-14 bg-[#cfcfcf] flex items-center justify-center overflow-hidden">
      {review.avatar_url ? <img src={review.avatar_url} alt={review.user_name} className="w-full h-full object-cover" /> : (
        <svg viewBox="0 0 64 64" className="w-12 h-12 text-white" fill="currentColor" aria-hidden="true">
          <circle cx="32" cy="21" r="13" /><path d="M8 58c2-13 11-20 24-20s22 7 24 20H8z" />
        </svg>
      )}
    </div>
  );
}

function asImageArray(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const fallback = product?.image_url ? [product.image_url] : [];

  return [...new Set([...images, ...fallback])].filter(Boolean);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [categories, setCategories] = useState([]);

  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addItem } = useCart();
  const { user } = useAuth();

  // --------------------------------------------------
  // Load product + related products
  // --------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        const { data: productData } = await api.get(`/products/${slug}`);

        if (!mounted) return;

        setData(productData);

        const categorySlug = productData?.product?.category_slug;

        if (categorySlug) {
          try {
            const { data: productsData } = await api.get("/products", {
              params: {
                category: categorySlug,
                limit: 5,
              },
            });

            if (!mounted) return;

            setRelated(
              (productsData.products || [])
                .filter((item) => item.id !== productData.product.id)
                .slice(0, 4)
            );
          } catch {
            if (mounted) {
              setRelated([]);
            }
          }
        } else {
          setRelated([]);
        }
      } catch (error) {
        console.error("Could not load product:", error);

        if (mounted) {
          setData(null);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // --------------------------------------------------
  // Load categories
  // --------------------------------------------------
 useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get("/products/categories");
        setCategories(response.data?.categories || []);
      } catch (error) {
        console.error("Could not load categories:", error);
        setCategories([]);
      }
    }

    loadCategories();
  }, []);
  // --------------------------------------------------
  // Product gallery
  // --------------------------------------------------
  const gallery = useMemo(
    () => asImageArray(data?.product),
    [data]
  );

  // Reset quantity/image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setQty(1);
  }, [slug]);

  // Prevent invalid selected image
  useEffect(() => {
    if (
      gallery.length > 0 &&
      selectedImageIndex >= gallery.length
    ) {
      setSelectedImageIndex(0);
    }
  }, [gallery.length, selectedImageIndex]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-ink/60">Loading…</p>
      </div>
    );
  }

  const { product, reviews = [] } = data;

  const activeImage =
    gallery[selectedImageIndex] ||
    gallery[0] ||
    product.image_url ||
    "https://placehold.co/600x600/F7F3EA/2B241C?text=Mevamahal";

  // --------------------------------------------------
  // Cart
  // --------------------------------------------------
  async function handleAdd() {
    if (!user) {
      return navigate("/login");
    }

    try {
      await addItem(product.id, qty);
    } catch (error) {
      console.error("Could not add product to cart:", error);
    }
  }

  // --------------------------------------------------
  // Wishlist
  // --------------------------------------------------
  async function handleWishlist() {
    if (!user) {
      return navigate("/login");
    }

    try {
      await api.post("/wishlist", {
        product_id: product.id,
      });
    } catch (error) {
      console.error("Could not add product to wishlist:", error);
    }
  }

  // --------------------------------------------------
  // Category navigation
  // --------------------------------------------------
  function handleCategoryChange(categorySlug) {
    if (!categorySlug) {
      navigate("/shop");
      return;
    }

    navigate(`/shop?category=${categorySlug}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ==================================================
          MOBILE CATEGORY SELECTOR
      ================================================== */}
      <div className="lg:hidden mb-8">
        <label
          htmlFor="product-category"
          className="block text-sm font-medium mb-2"
        >
          Categories
        </label>

        <select
          id="product-category"
          value={product.category_slug || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-clay"
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* ==================================================
          SIDEBAR + PRODUCT
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8">

        {/* ==================================================
            CATEGORY SIDEBAR
        ================================================== */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">

            <h2 className="font-display text-2xl mb-5">
              Categories
            </h2>

            <div className="space-y-1">

              {/* All Products */}
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="w-full text-left px-4 py-3 rounded-lg text-sm text-ink/70 hover:bg-clay/10 hover:text-ink transition-colors"
              >
                All Products
              </button>

              {/* Categories */}
              {categories.map((category) => {
                const isActive =
                  category.slug === product.category_slug;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(category.slug)
                    }
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-ink text-cream font-medium"
                        : "text-ink/70 hover:bg-clay/10 hover:text-ink"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ==================================================
            PRODUCT CONTENT
        ================================================== */}
        <main>

          {/* Product image + information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* ==================================================
                IMAGE GALLERY
            ================================================== */}
            <div>
              <div className="w-[350px] max-w-full">
                {/* Main image */}
                <div className="relative aspect-square w-full rounded-2xl bg-white overflow-hidden border border-line">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />

                  {/* Previous / Next buttons */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex(
                            (current) =>
                              (current - 1 + gallery.length) % gallery.length
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white transition-colors"
                        aria-label="Previous product image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex(
                            (current) => (current + 1) % gallery.length
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white transition-colors"
                        aria-label="Next product image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-3 w-full">
                    {gallery.slice(0, 4).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                          selectedImageIndex === index
                            ? "border-clay"
                            : "border-line hover:border-clay/50"
                        }`}
                        aria-label={`View product image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="h-full w-full object-contain bg-white/70"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* More images indicator */}
                {gallery.length > 4 && (
                  <div className="flex items-center justify-between mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          (current) =>
                            (current - 1 + gallery.length) % gallery.length
                        )
                      }
                      className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center hover:border-clay transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs text-ink/50">
                      {selectedImageIndex + 1} / {gallery.length}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          (current) => (current + 1) % gallery.length
                        )
                      }
                      className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center hover:border-clay transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}
            <div>

              {/* Category */}
              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(product.category_slug)
                }
                className="uppercase tracking-[0.2em] text-xs text-clay font-medium mb-3 hover:underline"
              >
                {product.category_name}
              </button>

              {/* Product name */}
              <h1 className="font-display text-4xl mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-sm text-ink/60 mb-6">
                <div className="flex text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(
                          Number(product.rating) || 0
                        )
                          ? "fill-gold"
                          : ""
                      }`}
                    />
                  ))}
                </div>

                <span>
                  {product.rating || "New"} (
                  {product.rating_count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-3xl">
                  ₹{product.price}
                </span>

                {Number(product.compare_price) >
                  Number(product.price) && (
                  <span className="text-ink/40 line-through">
                    ₹{product.compare_price}
                  </span>
                )}

                <span className="text-sm text-ink/50">
                  / {product.unit}
                </span>
              </div>

              {/* Description */}
              <p className="text-ink/70 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Stock */}
              <p
                className={`text-sm mb-6 ${
                  product.stock > 0
                    ? "text-moss"
                    : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </p>

              {/* Quantity + Cart + Wishlist */}
              <div className="flex items-center gap-4">

                {/* Quantity */}
                <div className="flex items-center border border-line rounded-full">

                  <button
                    type="button"
                    onClick={() =>
                      setQty((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="p-3 focus-ring"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-8 text-center">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQty((current) => current + 1)
                    }
                    className="p-3 focus-ring"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="flex-1 px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-40 focus-ring"
                >
                  Add to cart
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  className="p-3 rounded-full border border-line hover:border-red-500 hover:text-red-500 hover:fill-red-500 transition-colors focus-ring"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* Homepage-style product reviews */}
          {reviews.length === 0 ? (
  <p className="text-center text-ink/50">
    No reviews yet. Be the first to share your experience.
  </p>
) : (
  <div className="relative py-4 overflow-hidden">
    <div className="text-center mb-10 sm:mb-12">
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink">
        Words From Our Delighted Customers
      </h2>
    </div>
    <div className="flex w-max gap-6 animate-review-slide">
      {[...reviews, ...reviews].map((review, index) => (
        <article
          key={`${review.id}-${index}`}
          className="relative bg-white rounded-md px-5 sm:px-6 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.08)] min-h-[205px] w-[320px] sm:w-[360px] shrink-0 overflow-hidden"
        >
          <span className="absolute top-1 left-4 text-[58px] leading-none font-serif font-bold text-black/[0.06] pointer-events-none">
            &ldquo;
          </span>

          <div className="relative z-10">
            <h3 className="text-center font-medium text-base sm:text-lg text-ink mb-5">
              {review.user_name || "Customer"}
            </h3>

            <div className="flex gap-5">
              <div className="shrink-0">
                <ReviewAvatar review={review} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-[15px] leading-6 text-ink/60">
                  <span className="font-bold text-ink/60 mr-1">
                    &ldquo;
                  </span>

                  {review.comment}

                  <span className="font-bold text-ink/60 ml-1">
                    &rdquo;
                  </span>
                </p>

                <ReviewStars rating={review.rating} />

                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-xs text-ink/45">
                  {review.verified_purchase && (
                    <span>Verified Purchase</span>
                  )}

                  {review.created_at && (
                    <time dateTime={review.created_at}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </time>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
)}

          {/* ==================================================
              RELATED PRODUCTS
          ================================================== */}
          {related.length > 0 && (
            <section className="mt-20 border-t border-line pt-12">

              <p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-2">
                You may also like
              </p>

              <h2 className="font-display text-3xl mb-7">
                Related products
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {related.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
