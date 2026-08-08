import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  async function handleWishlist(e) {
    e.preventDefault();
    if (!user) return (window.location.href = "/login");
    await api.post("/wishlist", { product_id: product.id });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return (window.location.href = "/login");
    await addItem(product.id, 1);
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative rounded-xl2 overflow-hidden bg-white/60 border border-line aspect-square">
        <img
          src={product.image_url || "https://placehold.co/400x400/F7F3EA/2B241C?text=Mevamahal"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center focus-ring"
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
        {product.compare_price > product.price && (
          <span className="absolute top-3 left-3 bg-clay text-white text-[11px] px-2 py-1 rounded-full">Sale</span>
        )}
      </div>
      <div className="mt-3">
        <p className="font-medium">{product.name}</p>
        <div className="flex items-center gap-1 text-xs text-ink/50 mt-0.5">
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
          <button
            onClick={handleAdd}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-ink text-cream hover:bg-clayDark transition-colors focus-ring"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
