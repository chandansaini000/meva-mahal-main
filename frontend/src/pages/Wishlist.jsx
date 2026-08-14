import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { addItem } = useCart();

  function load() {
    api.get("/wishlist").then(({ data }) => setItems(data.items));
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(productId) {
    await api.delete(`/wishlist/${productId}`);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12" data-aos="fade-up">
      <h1 className="font-display text-3xl mb-8">Your wishlist</h1>
      {items.length === 0 ? (
        <p className="text-ink/50">Nothing saved yet. <Link to="/shop" className="text-clay underline">Browse products</Link></p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p, index) => (
            <div key={p.id} data-aos="fade-up" data-aos-delay={(index % 4) * 100} className="border border-line rounded-xl2 p-4 bg-white/50 flex gap-4">
              <img src={p.image_url || "https://placehold.co/100"} className="w-20 h-20 rounded-lg object-cover" alt={p.name} />
              <div className="flex-1">
                <Link to={`/product/${p.slug}`} className="font-medium hover:text-clay">{p.name}</Link>
                <p className="text-sm text-ink/50 mb-2">₹{p.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => addItem(p.id, 1)} className="text-xs px-3 py-1.5 rounded-full bg-ink text-cream">Add to cart</button>
                  <button onClick={() => handleRemove(p.id)} className="text-ink/30 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
