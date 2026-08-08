import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      const intendedPath = location.state?.from;
      navigate(intendedPath?.startsWith("/admin") && user.role === "admin" ? intendedPath : user.role === "admin" ? "/admin/dashboard" : "/account", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Welcome back</h1>
      <p className="text-ink/50 mb-8">Log in to your Mevamahal account.</p>

      <button
        onClick={loginWithGoogle}
        className="w-full py-3 rounded-full border border-line font-medium mb-4 flex items-center justify-center gap-2 hover:border-clay transition-colors"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-line flex-1" /> <span className="text-xs text-ink/40">OR</span> <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        <button disabled={loading} className="w-full py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark transition-colors disabled:opacity-50">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-ink/50 mt-6 text-center">
        New here? <Link to="/register" className="text-clay font-medium">Create an account</Link>
      </p>
    </div>
  );
}
