import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";
import api from "../api/client.js";

const groups = [
  { title: "Shop", links: [["All products", "/shop"], ["Gift builder", "/services"], ["Almonds", "/shop?category=almonds"], ["Dates", "/shop?category=dates"]] },
  { title: "Collections", links: [["Pistachios", "/shop?category=pistachios"], ["Cashews", "/shop?category=cashews"], ["Gift boxes", "/shop?category=gift-boxes"], ["Trail mix", "/shop?category=gift-boxes"]] },
  { title: "About us", links: [["Our story", "/about"], ["Services", "/services"], ["Journal", "/journal"], ["Contact", "/contact"]] },
  { title: "Help", links: [["Track order", "/track-order"], ["Returns", "/returns"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
];

export default function Footer() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  async function subscribe(event) { event.preventDefault(); setMessage(""); try { await api.post("/site/newsletter", { email }); setEmail(""); setMessage("You’re on the list."); } catch (error) { setMessage(error.response?.data?.error || "Please try again shortly."); } }
  return <footer className="mt-2 text-cream"><div className="bg-gold/10 border-t border-line"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left"><h2 className="font-display text-3xl text-ink">Kholo, Khao,<br /><span className="text-clay">Mevamahal!</span></h2><div className="w-20 h-20 rounded-full border-8 border-white shadow-lg overflow-hidden">
  <img
    src="/assets/mevamahal-logo.jpeg"
    alt="Meva Mahal"
    className="w-full h-full object-cover"
  />
</div><h2 className="font-display text-3xl text-ink">Made with love,<br /><span className="text-clay">in India.</span></h2></div><div className="h-14 -mb-px overflow-hidden"><svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full"><path d="M0 0 Q50 20 100 0 V20 H0Z" fill="#2B241C" /></svg></div></div><div className="bg-ink"><div className="max-w-7xl mx-auto px-6 pt-10 pb-8"><div className="grid lg:grid-cols-[1.35fr_repeat(4,1fr)] gap-8"><div><div className="flex items-center gap-3"><img
  src="/assets/mevamahal-logo.jpeg"
  alt="Logo"
  className="w-9 h-9 rounded-full border border-gold object-cover"
/><div><p className="font-display text-xl">Mevamahal</p><p className="text-[9px] tracking-[.18em] text-cream/55">PREMIUM DRY FRUITS</p></div></div><p className="text-sm text-cream/60 leading-relaxed mt-5 max-w-56">Small-batch dry fruits for thoughtful gifting and everyday rituals.</p><Link to="/contact" className="inline-flex items-center gap-2 text-sm text-gold mt-4"><Mail className="w-4 h-4" /> Contact our team</Link><form onSubmit={subscribe} className="mt-5 max-w-60"><div className="flex border border-cream/20 rounded-full overflow-hidden"><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email for harvest notes" className="min-w-0 w-full bg-transparent px-3 py-2 text-xs outline-none placeholder:text-cream/40"/><button aria-label="Subscribe" className="px-3 text-gold"><ArrowUpRight className="w-4 h-4" /></button></div>{message && <p className="text-xs text-gold mt-2">{message}</p>}</form></div>{groups.map(group => <div key={group.title}><p className="font-display text-lg mb-4">{group.title}</p><ul className="space-y-2">{group.links.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-cream/60 hover:text-gold transition-colors inline-flex gap-1 items-center">{label}<ArrowUpRight className="w-3 h-3 opacity-50" /></Link></li>)}</ul></div>)}</div><div className="border-t border-cream/15 mt-10 pt-5 flex flex-col sm:flex-row gap-3 justify-between text-xs text-cream/45"><p>© {new Date().getFullYear()} Mevamahal. All rights reserved.</p><p>Premium dry fruits, packed with care.</p></div></div></div></footer>;
}
