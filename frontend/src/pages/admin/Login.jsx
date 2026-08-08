import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setError(""); setLoading(true); try { const user = await login(email, password); if (user.role !== "admin") { await logout(); setError("This is a customer account. Please use the customer login instead."); return; } navigate("/admin/dashboard", { replace: true }); } catch (err) { setError(err.response?.data?.error || "Admin login failed"); } finally { setLoading(false); } }
  return <main className="min-h-screen grid place-items-center bg-ink p-6"><form onSubmit={submit} className="w-full max-w-md rounded-xl2 bg-cream p-8 shadow-xl"><div className="w-12 h-12 rounded-full bg-clay/15 text-clay grid place-items-center mb-6"><ShieldCheck className="w-6 h-6"/></div><p className="text-clay uppercase tracking-[.18em] text-xs font-medium">Restricted access</p><h1 className="font-display text-4xl mt-2">Admin sign in</h1><p className="text-ink/55 mt-3 mb-7">Manage products, categories, orders and customers.</p>{error && <p className="text-red-600 text-sm mb-4">{error}</p>}<div className="space-y-4"><input required type="email" className="input" placeholder="Admin email" value={email} onChange={event => setEmail(event.target.value)}/><input required type="password" className="input" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)}/><button disabled={loading} className="w-full py-3 rounded-full bg-ink text-cream font-medium disabled:opacity-50">{loading ? "Signing in…" : "Enter dashboard"}</button></div><Link to="/login" className="block text-center text-sm text-clay underline mt-6">Customer login</Link></form></main>;
}
