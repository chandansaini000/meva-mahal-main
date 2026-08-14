import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js";
import { resolveImageSrc } from "../utils/image.js";

export default function ProductCard({ product }) {
  const { addItem, updateQuantity, items } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(Boolean(product.is_wishlisted));

  const cartItem = items.find((item) => item.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;
  const productImages = Array.isArray(product.images) ? product.images : [];
  const productImage = productImages.find(Boolean) || product.image_url;

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return (window.location.href = "/login");

    try {
      await api.post("/wishlist", { product_id: product.id });
      setWishlisted((current) => !current);
    } catch {
      // Keep existing wishlist flow quiet here.
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return (window.location.href = "/login");
    await addItem(product.id, 1);
  }

  async function handleDecrease(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return (window.location.href = "/login");
    await updateQuantity(product.id, cartQuantity - 1);
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative rounded-xl2 overflow-hidden bg-white/60 border border-line aspect-square">
        <img
          src={resolveImageSrc(productImage)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center focus-ring transition-colors text-ink"
          aria-label="Add to wishlist"
          type="button"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "text-red-500 fill-red-500" : "text-ink"}`} />
        </button>
        {product.compare_price > product.price && (
          <>
            <span className="absolute top-3 left-3 bg-clay text-white text-[11px] px-2 py-1 rounded-full">Sale</span>
            <span className="absolute bottom-3 left-3 bg-black/75 text-white text-[11px] px-2 py-1 rounded-full">
              {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% off
            </span>
          </>
        )}
      </div>
      <div className="mt-3">
        <p className="font-medium">{product.name}</p>
        {product.description ? (
          <p className="text-sm text-ink/60 mt-1 line-clamp-2">
            {product.description}
          </p>
        ) : null}
        <div className="flex items-center gap-1 text-xs text-ink/50 mt-2">
          <Star className="w-3 h-3 fill-gold text-gold" />
          {product.rating || "New"} · {product.unit}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">₹{product.price}</span>
            {product.compare_price > product.price && (
              <span className="text-xs text-ink/40 line-through">₹{product.compare_price}</span>
            )}
          </div>
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2 border border-line rounded-full px-2 py-1">
              <button
                onClick={handleDecrease}
                type="button"
                className="p-1 rounded-full hover:bg-ink/10 focus-ring"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-medium">{cartQuantity}</span>
              <button
                onClick={handleAdd}
                type="button"
                className="p-1 rounded-full hover:bg-ink/10 focus-ring"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              type="button"
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-ink text-cream hover:bg-clayDark transition-colors focus-ring"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
