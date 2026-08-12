import { useEffect, useState } from "react";
import { X, Star, Check } from "lucide-react";
import api from "../api/client.js";

const fallback = "https://placehold.co/160x160/F7F3EA/2B241C?text=Mevamahal";

export default function ReviewPopup({ items, stage = 1, onDone }) {
  const [remaining, setRemaining] = useState([]);
  const [index, setIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRemaining(items || []);
    setIndex(0);
    setRating(0);
    setComment("");
    setError("");
  }, [items]);

  const current = remaining[index];

  if (!current) return null;

  function advance() {
    if (index >= remaining.length - 1) onDone?.();
    else { setIndex(index + 1); setRating(0); setComment(""); setError(""); }
  }

  function skip() {
    const next = remaining.filter((_, i) => i !== index);
    if (!next.length) return onDone?.();
    setRemaining(next); setIndex(Math.min(index, next.length - 1)); setRating(0); setComment(""); setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (!rating) return setError("Choose a star rating first.");
    if (!comment.trim()) return setError("Please share a short comment.");
    setSaving(true); setError("");
    try {
      await api.post(`/products/${current.product_id}/reviews`, { order_id: current.order_id, rating, comment });
      advance();
    } catch (err) { setError(err.response?.data?.error || "Could not submit your review."); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm p-4 grid place-items-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-cream shadow-2xl overflow-hidden">
        <button onClick={onDone} className="absolute top-4 right-4 p-2 rounded-full hover:bg-line/60" aria-label="Close"><X className="w-5 h-5" /></button>
        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[.2em] text-clay font-medium">{stage === 1 ? "A little aftercare" : "Delivered with love"}</p>
          <h2 className="font-display text-3xl mt-2">{stage === 1 ? "How did we do?" : "How was your product?"}</h2>
          <p className="text-sm text-ink/60 mt-2">{stage === 1 ? "Tell us what you think while it’s fresh in your mind." : "Your thoughts help us make every Mevamahal moment better."}</p>
          <div className="mt-6 flex gap-4 items-center border-y border-line py-4">
            <img src={current.image_url || fallback} alt={current.product_name} className="w-20 h-20 rounded-xl object-cover border border-line" />
            <div><p className="font-medium">{current.product_name}</p><p className="text-xs text-ink/50 mt-1">Product {index + 1} of {remaining.length}</p></div>
          </div>
          <form onSubmit={submit} className="mt-6">
            <p className="text-sm font-medium mb-2">Your rating</p>
            <div className="flex gap-1 text-gold" role="radiogroup" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`} className="p-1"><Star className={`w-7 h-7 ${star <= rating ? "fill-gold" : ""}`} /></button>)}
            </div>
            <textarea required rows="4" maxLength="2000" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience…" className="input resize-none mt-4" />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button disabled={saving} className="flex-1 py-3 rounded-full bg-ink text-cream font-medium disabled:opacity-50">{saving ? "Saving…" : <><Check className="w-4 h-4 inline mr-2" />Submit Review</>}</button>
              {stage === 1 && <button type="button" onClick={skip} className="py-3 px-5 rounded-full border border-line font-medium">Skip for now</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
