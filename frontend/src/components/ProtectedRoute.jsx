import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "admin") return <div className="min-h-screen grid place-items-center bg-cream p-6 text-center"><div><p className="text-clay font-medium">Admin access required</p><h1 className="font-display text-4xl mt-3">This account is not an administrator.</h1><p className="text-ink/60 mt-3">Please use an administrator account to manage the store.</p><Link to="/account" className="inline-block mt-6 text-clay underline">Go to my account</Link></div></div>;
  return children;
}
