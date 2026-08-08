import { Link } from "react-router-dom";
import { Check, Leaf, PackageCheck, Truck } from "lucide-react";

const values = [
  { icon: Truck, title: "Careful delivery", text: "Freshly packed orders, protected for the journey." },
  { icon: PackageCheck, title: "Quality assured", text: "Each batch is selected, checked and packed with care." },
  { icon: Leaf, title: "Naturally thoughtful", text: "Wholesome dry fruits for daily rituals and gifting." },
];
export default function About() {
  return <main>
    <section className="relative min-h-[390px] grid place-items-center overflow-hidden border-b border-line px-6 py-16">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Planters-Trail-Mix.jpg?width=1800" alt="Assorted dry fruits" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-cream/70" />
      <div className="relative max-w-3xl rounded-xl2 border border-white/70 bg-cream/85 p-8 md:p-12 text-center shadow-xl backdrop-blur-sm">
        <p className="uppercase tracking-[.24em] text-xs text-clay font-medium">Our story</p>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.03] mt-4">Three generations.<br />One honest harvest.</h1>
        <p className="text-ink/65 mt-5">A simple belief guides every Mevamahal box: dry fruits should taste fresh, generous and worth sharing.</p>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="rounded-x12 overflow-hidden">
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Planters-Trail-Mix.jpg?width=1100" alt="A selection of dry fruits and nuts" className="w-[350] h-[350] object-cover border border-line rounded-xl2" />
        </div>
        <article><p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-3">From orchard to home</p><h2 className="font-display text-4xl">A family in the orchards.</h2><div className="mt-6 space-y-4 text-ink/70 leading-relaxed"><p>Mevamahal began with a love for good ingredients and the small rituals they create. We choose dry fruits for their flavour, texture and freshness—then pack them in small batches so they arrive at their best.</p><p>From everyday handfuls to thoughtful gifts, every order is prepared with the same care we would bring to our own table.</p></div><Link to="/shop" className="inline-flex items-center gap-2 mt-7 px-5 py-3 rounded-full bg-ink text-cream font-medium hover:bg-clayDark">Shop the harvest <span aria-hidden>→</span></Link></article>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-12">{values.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl2 border border-line bg-white/55 p-5 flex gap-4"><div className="shrink-0 w-10 h-10 rounded-full bg-gold/20 text-clay grid place-items-center"><Icon className="w-4 h-4" /></div><div><h3 className="font-display text-lg">{title}</h3><p className="text-sm text-ink/60 mt-1">{text}</p></div></div>)}</div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4"><section className="rounded-xl2 bg-ink text-cream p-7 md:p-9"><p className="uppercase tracking-[.2em] text-xs text-gold font-medium">Why Mevamahal</p><h2 className="font-display text-3xl mt-3">A better way to share something good.</h2><p className="text-cream/70 leading-relaxed mt-4">We make gifting and everyday nourishment feel simple: considered selection, polished presentation, and no unnecessary fuss.</p></section><section className="rounded-xl2 border border-line bg-white/55 p-7 md:p-9"><h2 className="font-display text-3xl">Packed with purpose.</h2><ul className="space-y-3 mt-5 text-ink/70 text-sm">{["Selected for flavour and freshness", "Resealable packs made for real life", "Beautiful enough to give, easy enough to enjoy"].map(item => <li key={item} className="flex gap-3"><Check className="w-4 h-4 text-clay shrink-0 mt-0.5" />{item}</li>)}</ul></section></div>

      <div className="grid sm:grid-cols-3 gap-4 mt-4 text-center">{[["1998", "Founded", "A love for better dry fruits."], ["24", "Partner orchards", "Chosen with care, season after season."], ["12k+", "Happy households", "Sharing the good stuff every day."]].map(([number, label, text]) => <div key={label} className="rounded-xl2 border border-line bg-white/55 px-5 py-7"><p className="font-display text-4xl text-gold">{number}</p><p className="font-medium mt-2">{label}</p><p className="text-xs text-ink/55 mt-1">{text}</p></div>)}</div>
    </section>

  </main>;
}
