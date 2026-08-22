import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { isValidEmail, isValidName, sanitizeName, VALIDATION_MESSAGES } from "../utils/validation.js";

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
  const [errors, setErrors] = useState({});

  async function submit(event) {
    event.preventDefault();

    const next = {};
    if (!isValidName(form.name)) next.name = VALIDATION_MESSAGES.name;
    if (!isValidEmail(form.email)) next.email = VALIDATION_MESSAGES.email;
    setErrors(next);
    if (Object.keys(next).length) return;

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
    const nextValue = name === "name" ? sanitizeName(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    if (name === "name") setErrors((prev) => ({ ...prev, name: value !== nextValue || (nextValue && !isValidName(nextValue)) ? VALIDATION_MESSAGES.name : "" }));
    if (name === "email") setErrors((prev) => ({ ...prev, email: value && isValidEmail(value) ? "" : VALIDATION_MESSAGES.email }));
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden text-ink"
      style={{
        background:
          "linear-gradient(110deg, #f7ecdc 0%, #f5f0e6 55%, #e8f0e2 100%)",
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#eadbc4]/35 blur-3xl" />

      <div className="pointer-events-none absolute top-[42%] -left-40 h-96 w-96 rounded-full bg-[#dfe7d8]/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-180px] right-[15%] h-96 w-96 rounded-full bg-[#eadbc4]/20 blur-3xl" />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20 lg:pt-16">
        <div className="max-w-3xl">
          {/* Eyebrow */}

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#b65d32]" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b65d32]">
              Contact MevaMahal
            </p>
          </div>

          {/* Heading */}

          <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl">
            How can
            <span className="block text-[#b65d32]">we help?</span>
          </h1>

          {/* Description */}

          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-ink/60 sm:text-lg">
            Have a question about an order, a product, or a partnership?
            Send us a note and our team will get back to you shortly.
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTACT SECTION
      ====================================================== */}

      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.4fr] lg:gap-9">
          {/* =================================================
              LEFT INFORMATION CARD
          ================================================== */}

          <aside className="relative min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#292721] p-7 text-[#f8f4eb] shadow-[0_25px_70px_rgba(40,30,20,0.18)] sm:p-9 lg:p-10">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/5" />

            <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-white/5" />

            <div className="relative z-10 flex h-full flex-col">
              {/* Small heading */}

              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d9b98c]">
                We'd love to hear from you
              </p>

              {/* Main heading */}

              <h2 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight sm:text-4xl">
                Let’s start a
                <span className="block text-[#d9b98c]">
                  conversation.
                </span>
              </h2>

              {/* Description */}

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                Whether you need help choosing the right product or want to
                explore a partnership, we're here to help.
              </p>

              {/* =================================================
                  CONTACT DETAILS
              ================================================== */}

              <div className="mt-10 space-y-7">
                {/* EMAIL */}

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-[#d9b98c]">
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Email
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/85">
                      We’ll reply as soon as possible.
                    </p>
                  </div>
                </div>

                {/* SUPPORT */}

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-[#d9b98c]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />

                      <path
                        d="M12 8v4l2.5 2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Support
                    </p>

                    <p className="mt-1 text-sm text-white/85">
                      Monday — Saturday
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                      10:00 AM — 6:00 PM
                    </p>
                  </div>
                </div>

                {/* PARTNERSHIPS */}

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-[#d9b98c]">
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Partnerships
                    </p>

                    <p className="mt-1 text-sm text-white/85">
                      Tell us about your idea.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  BOTTOM QUOTE
              ================================================== */}

              <div className="mt-auto hidden pt-12 sm:block">
                <div className="border-t border-white/10 pt-6">
                  <p className="font-display text-xl italic leading-relaxed text-white/70">
                    “Good things are worth talking about.”
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              FORM CARD
          ================================================== */}

          <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(50,40,25,0.10)] backdrop-blur-xl sm:p-9 lg:p-11">
            {/* Form Header */}

            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b65d32]">
                Send us a message
              </p>

              <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                We’re listening.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-ink/50">
                Share your question or message below and our team will get
                back to you.
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form onSubmit={submit} className="space-y-5">
              {/* NAME + EMAIL */}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55"
                  >
                    Your name
                  </label>

                  <input
                    id="contact-name"
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`w-full rounded-xl border border-black/[0.08] bg-[#faf9f6]/80 px-4 py-3.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink/30 hover:border-black/15 focus:border-[#b65d32] focus:bg-white focus:ring-4 focus:ring-[#b65d32]/10 ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55"
                  >
                    Email address
                  </label>

                  <input
                    id="contact-email"
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full rounded-xl border border-black/[0.08] bg-[#faf9f6]/80 px-4 py-3.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink/30 hover:border-black/15 focus:border-[#b65d32] focus:bg-white focus:ring-4 focus:ring-[#b65d32]/10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* SUBJECT */}

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  required
                  name="subject"
                  type="text"
                  className="w-full rounded-xl border border-black/[0.08] bg-[#faf9f6]/80 px-4 py-3.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink/30 hover:border-black/15 focus:border-[#b65d32] focus:bg-white focus:ring-4 focus:ring-[#b65d32]/10"
                  placeholder="What can we help you with?"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              {/* MESSAGE */}

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55"
                >
                  Your message
                </label>

                <textarea
                  id="contact-message"
                  required
                  name="message"
                  rows={7}
                  className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#faf9f6]/80 px-4 py-3.5 text-sm leading-6 text-ink outline-none transition-all duration-200 placeholder:text-ink/30 hover:border-black/15 focus:border-[#b65d32] focus:bg-white focus:ring-4 focus:ring-[#b65d32]/10"
                  placeholder="Tell us a little more..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              {/* =================================================
                  STATUS
              ================================================== */}

              {status && (
                <div
                  className={`rounded-xl border px-4 py-3.5 text-sm ${
                    status.startsWith("Thanks")
                      ? "border-[#cbdcc5] bg-[#e8f0e3] text-[#456044]"
                      : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {status}
                </div>
              )}

              {/* =================================================
                  SUBMIT BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={sending}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#292721] px-6 py-4 text-sm font-semibold text-[#f8f4eb] shadow-[0_10px_30px_rgba(40,35,25,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3a362e] hover:shadow-[0_15px_35px_rgba(40,35,25,0.20)] disabled:cursor-not-allowed disabled:opacity-60"
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

              {/* Privacy */}

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
