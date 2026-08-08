import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

function asImageArray(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const fallback = product?.image_url ? [product.image_url] : [];
  return [...new Set([...images, ...fallback])].filter(Boolean);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${slug}`).then(({ data }) => {
      setData(data);
      if (data.product.category_slug) {
        api
          .get("/products", { params: { category: data.product.category_slug, limit: 5 } })
          .then(({ data: products }) => setRelated(products.products.filter((item) => item.id !== data.product.id).slice(0, 4)))
          .catch(() => setRelated([]));
      } else {
        setRelated([]);
      }
    });
  }, [slug]);

  const gallery = useMemo(() => asImageArray(data?.product), [data]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQty(1);
  }, [slug]);

  useEffect(() => {
    if (selectedImageIndex >= gallery.length) {
      setSelectedImageIndex(0);
    }
  }, [gallery.length, selectedImageIndex]);

  if (!data) return <div className="py-24 text-center text-ink/40">Loading…</div>;
  const { product, reviews } = data;
  const activeImage = gallery[selectedImageIndex] || gallery[0] || product.image_url || "https://placehold.co/600x600/F7F3EA/2B241C?text=Mevamahal";

  async function handleAdd() {
    if (!user) return navigate("/login");
    await addItem(product.id, qty);
  }

  async function handleWishlist() {
    if (!user) return navigate("/login");
    await api.post("/wishlist", { product_id: product.id });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-14">
        <div className="space-y-4">
          <div className="w-[300px] h-[300px] mx-auto flex items-center justify-center rounded-xl bg-white border">
  <img
    src={activeImage}
    alt={product.name}
    className="w-full h-full object-contain"
  />
            {gallery.length > 1 && (
              <div className="absolute inset-x-4 top-4 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((current) => (current - 1 + gallery.length) % gallery.length)}
                  className="pointer-events-auto rounded-full bg-white/90 p-2 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((current) => (current + 1) % gallery.length)}
                  className="pointer-events-auto rounded-full bg-white/90 p-2 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-[450px] mx-auto">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index ? "border-clay" : "border-line hover:border-clay/50"
                  }`}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-16 sm:h-20 object-contain bg-white/70" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-clay font-medium mb-3">{product.category_name}</p>
          <h1 className="font-display text-4xl mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm text-ink/60 mb-6">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-gold" : ""}`} />
              ))}
            </div>
            {product.rating || "New"} ({product.rating_count} reviews)
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl">₹{product.price}</span>
            {product.compare_price > product.price && <span className="text-ink/40 line-through">₹{product.compare_price}</span>}
            <span className="text-sm text-ink/50">/ {product.unit}</span>
          </div>

          <p className="text-ink/70 leading-relaxed mb-8">{product.description}</p>

          <p className={`text-sm mb-6 ${product.stock > 0 ? "text-moss" : "text-red-600"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-line rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 focus-ring">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 focus-ring">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex-1 px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-40 focus-ring"
            >
              Add to cart
            </button>
            <button onClick={handleWishlist} className="p-3 rounded-full border border-line hover:border-clay focus-ring" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-14">
            <h3 className="font-display text-xl mb-4">Reviews</h3>
            {reviews.length === 0 && <p className="text-ink/40 text-sm">No reviews yet.</p>}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.user_name}</span>
                    <div className="flex text-gold">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-gold" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-ink/60">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-2">You may also like</p>
          <h2 className="font-display text-3xl mb-7">Related products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
