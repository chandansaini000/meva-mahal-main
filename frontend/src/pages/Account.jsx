import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Package, MapPin, LogOut, LayoutDashboard } from "lucide-react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReviewPopup from "../components/ReviewPopup.jsx";
import { isValidMobile, isValidPincode, sanitizeDigits } from "../utils/validation.js";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "address", label: "Address", icon: MapPin },
];

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.orderPlaced ? "orders" : "profile");
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address_line: user?.address_line || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
  });
  const [saved, setSaved] = useState(false);
  const [reviewItems, setReviewItems] = useState(location.state?.orderReviewItems || null);
  const [reviewStage, setReviewStage] = useState(location.state?.orderReviewItems ? 1 : 2);

  useEffect(() => {
    if (tab === "orders") api.get("/orders/my").then(({ data }) => setOrders(data.orders));
  }, [tab]);

  useEffect(() => {
    if (location.state?.orderReviewItems) return;
    api.get("/reviews/pending").then(({ data }) => {
      if (data.reviews?.length) { setReviewItems(data.reviews); setReviewStage(2); }
    }).catch(() => {});
  }, [location.state]);

  function closeReviews() {
    setReviewItems(null);
    if (location.state?.orderReviewItems) window.history.replaceState({}, "", "/account");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.phone && !isValidMobile(form.phone)) {
      setSaved("Mobile number must contain exactly 10 digits.");
      return;
    }
    if (form.pincode && !isValidPincode(form.pincode)) {
      setSaved("Pincode must contain exactly 6 digits.");
      return;
    }
    try {
      const { data } = await api.put("/users/me", form);
      setUser((u) => ({ ...u, ...data.user }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaved(error.response?.data?.error || "Could not save your details.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-4 gap-10" data-aos="fade-up">
      {reviewItems?.length > 0 && <ReviewPopup items={reviewItems} stage={reviewStage} onDone={closeReviews} />}
      <aside className="lg:col-span-1">
        <div className="flex items-center gap-3 mb-8">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=D9A441&color=fff`}
            className="w-12 h-12 rounded-full"
            alt={user?.name}
          />
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-ink/50">{user?.email}</p>
            <p className="text-[11px] uppercase tracking-wider text-clay mt-1">{user?.role === "admin" ? "Administrator" : "Customer account"}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {user?.role === "admin" && <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left bg-clay text-white hover:bg-clayDark mb-3"><LayoutDashboard className="w-4 h-4" /> Open admin dashboard</Link>}
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                tab === id ? "bg-ink text-cream" : "text-ink/70 hover:bg-line/60"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 mt-4">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </nav>
      </aside>

      <div className="lg:col-span-3">
        {tab === "profile" && (
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <h2 className="font-display text-2xl mb-4">Profile details</h2>
            {saved && <p className={`${saved === true ? "text-moss" : "text-red-600"} text-sm`}>{saved === true ? "Saved!" : saved}</p>}
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            <input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizeDigits(e.target.value).slice(0, 10) })} className="input" />
            <button className="px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors">Save changes</button>
          </form>
        )}

        {tab === "orders" && (
          <div>
            <h2 className="font-display text-2xl mb-6">Your orders</h2>
            {orders.length === 0 && <p className="text-ink/50">No orders yet.</p>}
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-line rounded-xl2 p-4 bg-white/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Order #{o.id}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-line capitalize">{o.status}</span>
                  </div>
                  <p className="text-sm text-ink/50 mb-2">{new Date(o.created_at).toLocaleDateString()}</p>
                  {o.items.map((it) => (
                    <p key={it.id} className="text-sm">{it.product_name} × {it.quantity}</p>
                  ))}
                  <p className="font-semibold mt-2">₹{o.total_amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "address" && (
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <h2 className="font-display text-2xl mb-4">Delivery address</h2>
            <input placeholder="Address" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="input" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
              <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
            </div>
            <input type="tel" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: sanitizeDigits(e.target.value).slice(0, 6) })} className="input" />
            <button className="px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors">Save address</button>
          </form>
        )}
      </div>
    </div>
  );
}
