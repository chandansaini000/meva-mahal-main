import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-6">Log in to view your cart.</p>
        <Link to="/login" className="px-6 py-3 rounded-full bg-ink text-cream font-medium">Log in</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-3">Your cart is empty</p>
        <p className="text-ink/50 mb-6">Add some almonds, pistachios or dates to get started.</p>
        <Link to="/shop" className="px-6 py-3 rounded-full bg-ink text-cream font-medium">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="font-display text-3xl mb-6">Your cart</h1>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-line rounded-xl2 p-4 bg-white/50">
            <img src={item.image_url || "https://placehold.co/100/F7F3EA/2B241C"} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-ink/50">₹{item.price} / {item.unit}</p>
            </div>
            <div className="flex items-center border border-line rounded-full">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 focus-ring"><Minus className="w-3 h-3" /></button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 focus-ring"><Plus className="w-3 h-3" /></button>
            </div>
            <p className="font-medium w-16 text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
            <button onClick={() => removeItem(item.id)} className="text-ink/30 hover:text-red-500 focus-ring" aria-label="Remove">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="border border-line rounded-xl2 p-6 bg-white/50 h-fit">
        <h2 className="font-display text-xl mb-4">Order summary</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink/60">Subtotal</span>
          <span>₹{total.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-ink/60">Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t border-line pt-4 mb-6">
          <span>Total</span>
          <span>₹{total.toFixed(0)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="w-full py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors focus-ring"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
