import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../../api/client.js";
import AdminLayout from "../../components/AdminLayout.jsx";
import { DEFAULT_IMAGE_FALLBACK, resolveImageSrc } from "../../utils/image.js";

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_price: "",
  stock: "",
  unit: "250g",
  category_id: "",
  is_featured: false,
};

function asImageArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [value];
    }
  }
  return [];
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const existingImages = asImageArray(form.images);

  function load() {
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => setProducts(data.products));
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  function openNew() {
    setForm(EMPTY);
    setNewFiles([]);
    setRemovedImages([]);
    setEditing({});
  }

  function openEdit(p) {
    setForm({ ...EMPTY, ...p, images: asImageArray(p.images) });
    setNewFiles([]);
    setRemovedImages([]);
    setEditing(p);
  }

  function removeExistingImage(url) {
    setRemovedImages((current) => (current.includes(url) ? current : [...current, url]));
  }

  function removeNewFile(index) {
    setNewFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (saving) return;
    setSaving(true);

    try {
      const body = new FormData();
      const imageDataChanged = removedImages.length > 0 || newFiles.length > 0;
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images" || (key === "image_url" && imageDataChanged)) return;
        if (value === "" || value === null || value === undefined) return;
        body.append(key, typeof value === "boolean" ? String(value) : String(value));
      });

      body.append("existingImages", JSON.stringify(existingImages.filter((url) => !removedImages.includes(url))));
      body.append("removedImages", JSON.stringify(removedImages));
      newFiles.forEach((file) => body.append("images", file));

      if (editing.id) await api.put(`/products/${editing.id}`, body);
      else await api.post("/products", body);

      setEditing(null);
      setForm(EMPTY);
      setNewFiles([]);
      setPreviewUrls([]);
      setRemovedImages([]);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 5);
    setNewFiles((current) => [...current, ...files].slice(0, 5));
    event.target.value = "";
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-cream text-sm font-medium">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="border border-line rounded-xl2 bg-white/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-line/40 text-left text-ink/50">
            <tr>
              <th className="p-3">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const productImages = asImageArray(p.images);
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3 flex items-center gap-3">
                    <img src={resolveImageSrc(productImages[0] || p.image_url)} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    {p.name}
                  </td>
                  <td>{p.category_name || "—"}</td>
                  <td>₹{p.price}</td>
                  <td className={p.stock <= 10 ? "text-clay font-medium" : ""}>{p.stock}</td>
                  <td className="p-3 flex gap-3 justify-end">
                    <button onClick={() => openEdit(p)} className="text-ink/50 hover:text-clay">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-ink/50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-ink/40 text-sm">No products yet — add your first one.</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-6">
          <form onSubmit={handleSubmit} className="bg-cream rounded-xl2 p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-display text-xl">{editing.id ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            <input required placeholder="Slug (e.g. premium-almonds)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />

            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              <input type="number" placeholder="Compare price" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
              <input placeholder="Unit (e.g. 250g)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input" />
            </div>

            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input placeholder="Primary image URL" value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" />

            {form.image_url && (
              <img
                src={resolveImageSrc(form.image_url)}
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }}
                alt="Primary product preview"
                className="w-full h-32 object-cover rounded-lg border border-line"
              />
            )}

            <div className="rounded-lg border border-dashed border-line p-3">
              <label className="block text-sm font-medium mb-2">Upload product images</label>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="block w-full text-sm" />
              <p className="text-xs text-ink/45 mt-2">You can add up to 5 images total per upload.</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingImages
                  .filter((url) => !removedImages.includes(url))
                  .map((url) => (
                    <div key={url} className="relative">
                      <img src={resolveImageSrc(url)} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} alt="Existing product preview" className="w-full h-24 object-cover rounded-lg border border-line" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-2 right-2 rounded-full bg-ink text-cream text-[10px] px-1.5 py-0.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                {newFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <img src={previewUrls[index]} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} alt="New product preview" className="w-full h-24 object-cover rounded-lg border border-line" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-2 right-2 rounded-full bg-ink text-cream text-[10px] px-1.5 py-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Feature on homepage
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={saving} className="w-full py-3 rounded-full bg-ink text-cream font-medium disabled:opacity-50">
              {editing.id ? "Save changes" : "Create product"}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
