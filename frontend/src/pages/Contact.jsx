import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";

export default function Contact() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: searchParams.get("subject") || "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setStatus("");
    setSending(true);

    try {
      await api.post("/site/contact", form);

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setStatus("Thanks — we’ll be in touch shortly.");
    } catch (e) {
      setStatus(
        e.response?.data?.error ||
          "We could not send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <main className="relative overflow-hidden bg-[#faf8f3] text-ink">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#eadbc4]/40 blur-3xl" />
      <div className="pointer-events-none absolute top-[45%] -left-40 h-96 w-96 rounded-full bg-[#dfe7d8]/40 blur-3xl" />

      {/* -------------------------------- */}
      {/* Hero */}
      {/* -------------------------------- */}
      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-12">

        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-clay" />

            <p className="text-xs font-medium uppercase tracking-[0.28em] text-clay">
              Contact MevaMahal
            </p>
          </div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            How can
            <span className="block text-clay">we help?</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg">
            Have a question about an order, a product, or a partnership?
            Send us a note and our team will get back to you shortly.
          </p>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* Contact Section */}
      {/* -------------------------------- */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.4fr]">

          {/* -------------------------------- */}
          {/* Left Information Card */}
          {/* -------------------------------- */}
          <aside className="relative overflow-hidden rounded-[2rem] bg-[#24221d] p-8 text-[#f8f4eb] shadow-xl sm:p-10">

            {/* Decorative circle */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-white/5" />

            <div className="relative z-10 flex h-full flex-col">

              <p className="text-xs uppercase tracking-[0.25em] text-[#c9a77a]">
                We'd love to hear from you
              </p>

              <h2 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
                Let’s start a conversation.
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/60">
                Whether you need help choosing the right product or want to
                explore a partnership, we're here to help.
              </p>

              <div className="mt-10 space-y-7">

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M4 6h16v12H4z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m4 7 8 6 8-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-white/85">
                      We’ll reply as soon as possible.
                    </p>
                  </div>
                </div>

                {/* Support */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                      />
                      <path
                        d="M12 8v4l2.5 2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Support
                    </p>

                    <p className="mt-1 text-sm text-white/85">
                      Monday — Saturday
                    </p>

                    <p className="text-sm text-white/50">
                      10:00 AM — 6:00 PM
                    </p>
                  </div>
                </div>

                {/* Partnership */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M7 12h10M12 7v10"
                        strokeLinecap="round"
                      />
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="4"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Partnerships
                    </p>

                    <p className="mt-1 text-sm text-white/85">
                      Tell us about your idea.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom quote */}
              <div className="mt-auto hidden pt-12 sm:block">
                <div className="border-t border-white/10 pt-6">
                  <p className="font-display text-xl italic text-white/70">
                    “Good things are worth talking about.”
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* -------------------------------- */}
          {/* Form */}
          {/* -------------------------------- */}
          <div className="rounded-[2rem] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_70px_rgba(40,30,20,0.08)] backdrop-blur sm:p-9 lg:p-11">

            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-clay">
                Send us a message
              </p>

              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                We’re listening.
              </h2>
            </div>

            <form onSubmit={submit} className="space-y-5">

              {/* Name + Email */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink/60"
                  >
                    Your name
                  </label>

                  <input
                    id="contact-name"
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-ink/30 focus:border-clay focus:bg-white focus:ring-4 focus:ring-clay/10"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink/60"
                  >
                    Email address
                  </label>

                  <input
                    id="contact-email"
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-ink/30 focus:border-clay focus:bg-white focus:ring-4 focus:ring-clay/10"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink/60"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  required
                  name="subject"
                  type="text"
                  className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-ink/30 focus:border-clay focus:bg-white focus:ring-4 focus:ring-clay/10"
                  placeholder="What can we help you with?"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink/60"
                >
                  Your message
                </label>

                <textarea
                  id="contact-message"
                  required
                  name="message"
                  rows={7}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-ink/30 focus:border-clay focus:bg-white focus:ring-4 focus:ring-clay/10"
                  placeholder="Tell us a little more..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              {status && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    status.startsWith("Thanks")
                      ? "bg-[#e8f0e3] text-[#456044]"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {status}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-sm font-medium text-cream shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send message"}

                {!sending && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      d="M5 12h13M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-ink/40">
                We respect your privacy and will only use your information to
                respond to your enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}