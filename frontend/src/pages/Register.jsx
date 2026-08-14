import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/account");
    } catch (err) {
      setError(err.response?.data?.error || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24" data-aos="fade-up">
      <h1 className="font-display text-3xl mb-2">Create account</h1>
      <p className="text-ink/50 mb-8">Join Mevamahal for faster checkout and order tracking.</p>

      <button
        onClick={loginWithGoogle}
        className="w-full py-3 rounded-full border border-line font-medium mb-4 hover:border-clay transition-colors"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-line flex-1" /> <span className="text-xs text-ink/40">OR</span> <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <button disabled={loading} className="w-full py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink/50 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-clay font-medium">Log in</Link>
      </p>
    </div>
  );
}
