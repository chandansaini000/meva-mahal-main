import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const { items, total, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: user?.address_line || "",
    shipping_city: user?.city || "",
    shipping_state: user?.state || "",
    shipping_pincode: user?.pincode || "",
    payment_method: "cod",
    gift_service: location.state?.giftService || "",
    gift_message: location.state?.giftMessage || "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const { data } = await api.post("/orders", form);
      await refresh();
      navigate(`/order-success/${data.order.id}`, {
        state: { orderReviewItems: data.order.items },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <h1 className="font-display text-3xl mb-4">Shipping details</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input required placeholder="Full name" value={form.shipping_name} onChange={(e) => update("shipping_name", e.target.value)} className="input" />
        <input required placeholder="Phone" value={form.shipping_phone} onChange={(e) => update("shipping_phone", e.target.value)} className="input" />
        <input required placeholder="Address" value={form.shipping_address} onChange={(e) => update("shipping_address", e.target.value)} className="input" />
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="City" value={form.shipping_city} onChange={(e) => update("shipping_city", e.target.value)} className="input" />
          <input required placeholder="State" value={form.shipping_state} onChange={(e) => update("shipping_state", e.target.value)} className="input" />
        </div>
        <input required placeholder="Pincode" value={form.shipping_pincode} onChange={(e) => update("shipping_pincode", e.target.value)} className="input" />

        <div className="border border-line rounded-xl2 p-4">
          <p className="font-medium mb-2 text-sm">Payment method</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={form.payment_method === "cod"} onChange={() => update("payment_method", "cod")} />
            Cash on delivery
          </label>
        </div>

        <button disabled={placing} className="w-full py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-50">
          {placing ? "Placing order…" : `Place order — ₹${total.toFixed(0)}`}
        </button>
      </form>

      <div className="border border-line rounded-xl2 p-6 bg-white/50 h-fit">
        <h2 className="font-display text-xl mb-4">Order items</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold text-lg border-t border-line mt-4 pt-4">
          <span>Total</span>
          <span>₹{total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
