import { useEffect, useState } from "react";
import { IndianRupee, ShoppingCart, Users, Package, AlertTriangle, Save } from "lucide-react";
import api from "../../api/client.js";
import AdminLayout from "../../components/AdminLayout.jsx";

const DEFAULT_SETTINGS = {
  hero_eyebrow: "Small-batch since 1998",
  hero_title: "The finer half of nature's harvest.",
  hero_subtitle: "Hand-picked almonds, pistachios, walnuts, and dates from single-origin orchards, delivered in beautiful, resealable packaging.",
  hero_primary_cta: "Shop the harvest",
  hero_secondary_cta: "Our story",
  hero_primary_link: "/shop",
  hero_secondary_link: "/about",
  hero_image: "https://res.cloudinary.com/zrhelpub/image/upload/v1786691364/mevamahal/products/mrjsub7agb45i3op7d1q.jpg",
  hero_badge: "Loved by 12,000+ households",
  slider_images: ["https://res.cloudinary.com/zrhelpub/image/upload/v1786691364/mevamahal/products/mrjsub7agb45i3op7d1q.jpg"],
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/site/settings").then(({ data }) => setSettings({ ...DEFAULT_SETTINGS, ...data.settings })).catch(() => setSettings(DEFAULT_SETTINGS));
  }, []);

  async function uploadSliderImages(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const body = new FormData(); body.append("image", file);
        const { data } = await api.post("/products/upload", body);
        return data.url;
      }));
      setSettings((current) => ({
        ...current,
        slider_images: [...(current.slider_images || []), ...urls],
        hero_image: current.hero_image || urls[0],
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Could not upload images");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/site/settings", { settings });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not save site settings");
    } finally {
      setSaving(false);
    }
  }

  if (!stats) return <AdminLayout><p className="text-ink/40">Loading…</p></AdminLayout>;

  const cards = [
    { label: "Revenue", value: `₹${stats.revenue.toFixed(0)}`, icon: IndianRupee },
    { label: "Orders", value: stats.orderCount, icon: ShoppingCart },
    { label: "Customers", value: stats.customerCount, icon: Users },
    { label: "Products", value: stats.productCount, icon: Package },
  ];

  const maxSale = Math.max(...stats.salesByDay.map((d) => Number(d.total)), 1);

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-line rounded-xl2 p-5 bg-white/60">
            <Icon className="w-5 h-5 text-clay mb-3" />
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-ink/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-line rounded-xl2 p-6 bg-white/60">
          <h2 className="font-medium mb-4">Sales — last 14 days</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.salesByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-clay rounded-t-md"
                  style={{ height: `${(Number(d.total) / maxSale) * 100}%`, minHeight: 4 }}
                  title={`₹${d.total}`}
                />
                <span className="text-[9px] text-ink/40">{new Date(d.day).getDate()}</span>
              </div>
            ))}
            {stats.salesByDay.length === 0 && <p className="text-sm text-ink/40">No sales data yet.</p>}
          </div>
        </div>

        <div className="border border-line rounded-xl2 p-6 bg-white/60">
          <h2 className="font-medium mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-clay" /> Low stock</h2>
          {stats.lowStock.length === 0 && <p className="text-sm text-ink/40">All good — no low stock items.</p>}
          <div className="space-y-3">
            {stats.lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-clay font-medium">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={saveSettings} className="border border-line rounded-xl2 p-6 bg-white/60 mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Homepage content</h2>
            <p className="text-sm text-ink/50">Edit the hero copy and manage the showcase image slider.</p>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-cream text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save homepage"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input value={settings.hero_eyebrow} onChange={(e) => setSettings({ ...settings, hero_eyebrow: e.target.value })} className="input" placeholder="Eyebrow text" />
          <input value={settings.hero_primary_cta} onChange={(e) => setSettings({ ...settings, hero_primary_cta: e.target.value })} className="input" placeholder="Primary CTA text" />
          <input value={settings.hero_secondary_cta} onChange={(e) => setSettings({ ...settings, hero_secondary_cta: e.target.value })} className="input" placeholder="Secondary CTA text" />
          <input value={settings.hero_badge} onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })} className="input" placeholder="Badge text" />
          <input value={settings.hero_primary_link} onChange={(e) => setSettings({ ...settings, hero_primary_link: e.target.value })} className="input" placeholder="Primary CTA link" />
          <input value={settings.hero_secondary_link} onChange={(e) => setSettings({ ...settings, hero_secondary_link: e.target.value })} className="input" placeholder="Secondary CTA link" />
        </div>

        <textarea value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="input" rows={3} placeholder="Hero heading" />
        <textarea value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="input" rows={3} placeholder="Hero subtitle" />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-dashed border-line p-3">
            <label className="block text-sm font-medium mb-2">Hero image URL</label>
            <input value={settings.hero_image} onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })} className="input" placeholder="https://..." />
          </div>
          <div className="rounded-lg border border-dashed border-line p-3">
            <label className="block text-sm font-medium mb-2">Upload multiple slider images</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadSliderImages} className="block w-full text-sm" />
            {uploading && <p className="text-xs text-clay mt-2">Uploading images…</p>}
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-line p-3">
          <label className="block text-sm font-medium mb-2">Slider image URLs</label>
          <div className="space-y-2">
            {(settings.slider_images || []).map((url, index) => (
              <div key={`${url}-${index}`} className="flex gap-2 items-center">
                <input value={url} onChange={(e) => {
                  const nextUrls = [...(settings.slider_images || [])];
                  nextUrls[index] = e.target.value;
                  setSettings({ ...settings, slider_images: nextUrls });
                }} className="input" placeholder="https://..." />
                <button type="button" onClick={() => {
                  const nextUrls = (settings.slider_images || []).filter((_, itemIndex) => itemIndex !== index);
                  setSettings({ ...settings, slider_images: nextUrls, hero_image: settings.hero_image === url ? nextUrls[0] || "" : settings.hero_image });
                }} className="px-3 py-2 rounded-full border border-line text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <div className="border border-line rounded-xl2 p-6 bg-white/60 mt-6">
        <h2 className="font-medium mb-4">Recent orders</h2>
        <table className="w-full text-sm">
          <thead className="text-ink/40 text-left">
            <tr><th className="pb-2">Order</th><th>Customer</th><th>Status</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="py-2">#{o.id}</td>
                <td>{o.customer_name}</td>
                <td className="capitalize">{o.status}</td>
                <td className="text-right">₹{o.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
