import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = Router();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SITE_SETTINGS = {
  hero_eyebrow: "Small-batch since 1998",
  hero_title: "The finer half of nature's harvest.",
  hero_subtitle: "Hand-picked almonds, pistachios, walnuts, and dates from single-origin orchards, delivered in beautiful, resealable packaging.",
  hero_primary_cta: "Shop the harvest",
  hero_secondary_cta: "Our story",
  hero_primary_link: "/shop",
  hero_secondary_link: "/about",
  hero_image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=900&q=80",
  hero_badge: "Loved by 12,000+ households",
  slider_images: [
    "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=900&q=80"
  ],
};

router.post("/newsletter", async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!emailPattern.test(email)) return res.status(400).json({ error: "Enter a valid email address" });
  try {
    await pool.query("INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [email]);
    res.status(201).json({ ok: true });
  } catch (error) { next(error); }
});

router.post("/contact", async (req, res, next) => {
  const fields = ["name", "email", "subject", "message"];

  const data = Object.fromEntries(
    fields.map((field) => [
      field,
      String(req.body[field] || "").trim(),
    ])
  );

  if (
    fields.some((field) => !data[field]) ||
    !emailPattern.test(data.email)
  ) {
    return res.status(400).json({
      error: "Please complete every field with a valid email address",
    });
  }

  try {
    // ------------------------------------
    // Save message to database
    // ------------------------------------
    await pool.query(
      `INSERT INTO contact_messages
       (name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [
        data.name.slice(0, 120),
        data.email.slice(0, 180),
        data.subject.slice(0, 180),
        data.message.slice(0, 5000),
      ]
    );

    // ------------------------------------
    // Send email to admin
    // ------------------------------------
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      replyTo: data.email,
      subject: `Contact Message: ${data.subject}`,

      text: `
New Contact Message from MevaMahal

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
      `,
    });

    res.status(201).json({
      ok: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact message error:", error);
    next(error);
  }
});

router.get("/settings", async (req, res) => {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL)");
    const { rows } = await pool.query("SELECT key, value FROM site_settings");
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    res.json({ settings: { ...DEFAULT_SITE_SETTINGS, ...stored } });
  } catch (error) {
    console.error(error);
    res.json({ settings: DEFAULT_SITE_SETTINGS });
  }
});

router.put("/settings", requireAuth, requireAdmin, async (req, res) => {
  const incoming = req.body?.settings || {};
  const allowedKeys = Object.keys(DEFAULT_SITE_SETTINGS);
  const updates = allowedKeys.filter((key) => key in incoming);

  if (!updates.length) return res.status(400).json({ error: "No site settings provided" });

  try {
    await pool.query("CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL)");
    await Promise.all(updates.map((key) => {
      return pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, JSON.stringify(incoming[key])]
      );
    }));

    const { rows } = await pool.query("SELECT key, value FROM site_settings");
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    res.json({ settings: { ...DEFAULT_SITE_SETTINGS, ...stored } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save site settings" });
  }
});

export default router;
