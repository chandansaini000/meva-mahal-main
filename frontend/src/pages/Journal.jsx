const posts = [
  ["How to keep dry fruits fresh", "Store nuts in an airtight container away from heat and sunlight. Refrigerate larger packs for a longer shelf life."],
  ["A better everyday handful", "A small mix of almonds, walnuts and pistachios brings texture and natural goodness to breakfast or an afternoon pause."],
  ["Building a thoughtful gift box", "Choose a balance of familiar favourites and one surprising variety, then add a note for a gift that feels personal."],
];
export default function Journal() { return <main className="max-w-5xl mx-auto px-6 py-16"><p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-4">The journal</p><h1 className="font-display text-5xl mb-10">Notes from the harvest.</h1><div className="grid md:grid-cols-3 gap-6">{posts.map(([title, body]) => <article key={title} className="border border-line rounded-xl2 p-6 bg-white/40"><h2 className="font-display text-2xl mb-3">{title}</h2><p className="text-ink/65 leading-relaxed">{body}</p></article>)}</div></main>; }
