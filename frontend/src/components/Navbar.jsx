import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Heart, User, ShoppingBag, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="shrink-0 flex items-center gap-2"
          aria-label="Mevamahal home"
        >
          <img
            src="/assets/mevamahal-logo.jpeg"
            alt="Mevamahal Premium Dry Fruits"
            className="h-10 w-10 shrink-0 object-contain rounded-md"
          />

          <h3 className="whitespace-nowrap text-xl font-serif font-bold tracking-wide text-amber-800">
            MevaMahal
          </h3>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-clay transition-colors focus-ring">
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search almonds, dates..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-line bg-white/60 text-sm focus-ring focus:border-clay"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          {user?.role === "admin" && <Link to="/admin" className="hidden sm:block focus-ring" aria-label="Admin dashboard"><LayoutDashboard className="w-5 h-5" /></Link>}
          <Link to="/wishlist" className="hidden sm:block focus-ring" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
          </Link>
          <Link to={user ? "/account" : "/login"} className="focus-ring" aria-label="Account">
            <User className="w-5 h-5" />
          </Link>
          <Link to="/cart" className="relative focus-ring" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-clay text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="lg:hidden focus-ring" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line px-6 py-4 flex flex-col gap-4 bg-cream">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-medium">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
