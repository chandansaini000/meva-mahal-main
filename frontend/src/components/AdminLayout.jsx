import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Package, ShoppingCart, Users, ArrowLeft, Tags } from "lucide-react";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/users", label: "Customers", icon: Users },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-60 shrink-0 border-r border-line bg-white/50 flex flex-col p-5">
        <Link to="/" className="flex items-center gap-2 mb-8 text-sm text-ink/60 hover:text-clay">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
        <p className="font-display text-lg mb-6">Mevamahal Admin</p>
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-ink text-cream" : "text-ink/70 hover:bg-line/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
