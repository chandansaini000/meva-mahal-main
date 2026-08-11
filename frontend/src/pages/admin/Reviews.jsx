import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../api/client.js";
import AdminLayout from "../../components/AdminLayout.jsx";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const load = () => api.get("/admin/reviews").then(({ data }) => setReviews(data.reviews));
  useEffect(() => { load(); }, []);
  async function remove(id) { if (!window.confirm("Delete this review?")) return; await api.delete(`/admin/reviews/${id}`); load(); }
  return <AdminLayout><h1 className="font-display text-3xl mb-8">Reviews</h1><div className="border border-line rounded-xl2 bg-white/60 overflow-hidden"><table className="w-full text-sm"><thead className="bg-line/40 text-left text-ink/50"><tr><th className="p-3">Product</th><th>Customer</th><th>Rating</th><th>Review</th><th /></tr></thead><tbody>{reviews.map((r) => <tr key={r.id} className="border-t border-line align-top"><td className="p-3">{r.product_name}<br /><span className="text-xs text-ink/40">Order #{r.order_id}</span></td><td>{r.user_name}<br /><span className="text-xs text-ink/40">{r.user_email}</span></td><td className="text-gold">{"★".repeat(r.rating)}<span className="text-ink/20">{"★".repeat(5-r.rating)}</span></td><td className="max-w-sm py-3">{r.comment}</td><td className="p-3"><button onClick={() => remove(r.id)} className="text-red-500" aria-label="Delete review"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table>{!reviews.length && <p className="p-6 text-ink/40">No reviews yet.</p>}</div></AdminLayout>;
}
