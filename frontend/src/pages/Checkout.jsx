import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isValidMobile, isValidPincode, sanitizeDigits } from "../utils/validation.js";

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

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      shipping_name: current.shipping_name || user.name || "",
      shipping_phone: current.shipping_phone || user.phone || "",
      shipping_address: current.shipping_address || user.address_line || "",
      shipping_city: current.shipping_city || user.city || "",
      shipping_state: current.shipping_state || user.state || "",
      shipping_pincode: current.shipping_pincode || user.pincode || "",
    }));
  }, [user]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleApplyCoupon(e) {
    e.preventDefault();
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
        subtotal: total,
      });
      setAppliedCoupon({
        ...data.coupon,
        discount: data.discount,
        final_total: data.total,
      });
      setCouponCode("");
    } catch (err) {
      setCouponError(err.response?.data?.error || "Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  const finalTotal = appliedCoupon ? appliedCoupon.final_total : total;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (!isValidMobile(form.shipping_phone)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }
    if (!isValidPincode(form.shipping_pincode)) {
      setError("Pincode must contain exactly 6 digits.");
      return;
    }

    setPlacing(true);

    try {
      const { data } = await api.post("/orders", {
        ...form,
        coupon_code: appliedCoupon?.code || null,
      });
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
        <input
          required
          placeholder="Full name"
          value={form.shipping_name}
          onChange={(e) => update("shipping_name", e.target.value)}
          className="input"
        />
        <input
          required
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          placeholder="Phone"
          value={form.shipping_phone}
          onChange={(e) => update("shipping_phone", sanitizeDigits(e.target.value).slice(0, 10))}
          className="input"
        />
        <input
          required
          placeholder="Address"
          value={form.shipping_address}
          onChange={(e) => update("shipping_address", e.target.value)}
          className="input"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="City"
            value={form.shipping_city}
            onChange={(e) => update("shipping_city", e.target.value)}
            className="input"
          />
          <input
            required
            placeholder="State"
            value={form.shipping_state}
            onChange={(e) => update("shipping_state", e.target.value)}
            className="input"
          />
        </div>
        <input
          required
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="Pincode"
          value={form.shipping_pincode}
          onChange={(e) => update("shipping_pincode", sanitizeDigits(e.target.value).slice(0, 6))}
          className="input"
        />

        <div className="border border-line rounded-xl2 p-4">
          <p className="font-medium mb-2 text-sm">Payment method</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={form.payment_method === "cod"}
              onChange={() => update("payment_method", "cod")}
            />
            Cash on delivery
          </label>
        </div>

        <button
          disabled={placing}
          className="w-full py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-50"
        >
          {placing ? "Placing order…" : `Place order — ₹${finalTotal.toFixed(0)}`}
        </button>
      </form>

      <div className="border border-line rounded-xl2 p-6 bg-white/50 h-fit">
        <h2 className="font-display text-xl mb-4">Order items</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-line mt-4 pt-4">
          {!appliedCoupon ? (
            <form onSubmit={handleApplyCoupon} className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-ink mb-1 block">Have a coupon?</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="input flex-1 text-sm"
                    disabled={couponLoading}
                    aria-label="Coupon code"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 bg-ink text-cream text-sm font-medium rounded-full hover:bg-clayDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    aria-label="Apply coupon"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              </label>
              {couponError && <p className="text-red-600 text-xs font-medium">{couponError}</p>}
              <p className="text-xs text-gray-500">Try: WELCOME10</p>
            </form>
          ) : (
            <div className="space-y-3 bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">✓ Coupon Applied</p>
                  <p className="text-sm font-semibold text-ink">{appliedCoupon.code}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  aria-label="Remove coupon"
                >
                  ✕ Remove
                </button>
              </div>
              {appliedCoupon.description && (
                <p className="text-xs text-gray-600">{appliedCoupon.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-line mt-4 pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="text-green-600 font-semibold">
                -₹{appliedCoupon.discount.toFixed(0)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-line">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
