import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
export default function Contact() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", subject: searchParams.get("subject") || "", message: "" }); const [status, setStatus] = useState("");
  async function submit(event) { event.preventDefault(); setStatus(""); try { await api.post("/site/contact", form); setForm({ name: "", email: "", subject: "", message: "" }); setStatus("Thanks — we’ll be in touch shortly."); } catch (e) { setStatus(e.response?.data?.error || "We could not send your message. Please try again."); } }
  return <main className="max-w-3xl mx-auto px-6 py-16"><p className="uppercase tracking-[.2em] text-xs text-clay font-medium mb-4">Contact</p><h1 className="font-display text-5xl mb-3">How can we help?</h1><p className="text-ink/60 mb-8">Send us a note about an order, product or partnership.</p><form onSubmit={submit} className="space-y-4"><input required className="input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><input required type="email" className="input" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/><input required className="input" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}/><textarea required rows="6" className="input" placeholder="Your message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/>{status && <p className="text-sm text-moss">{status}</p>}<button className="px-6 py-3 rounded-full bg-ink text-cream font-medium">Send message</button></form></main>;
}
