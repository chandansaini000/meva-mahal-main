import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { pool } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { googleOAuthEnabled } from "../config/passport.js";
import { validateEmail, validateName } from "../utils/validation.js";

const router = Router();

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ---- Email/password signup ----
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (!validateName(name)) return res.status(400).json({ error: "Name can only contain letters." });
  if (!validateEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'customer') RETURNING *`,
      [name, email, hash]
    );
    const user = rows[0];
    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create account" });
  }
});

// ---- Email/password login ----
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---- Google OAuth (optional; email/password auth works without it) ----
if (googleOAuthEnabled) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
    (req, res) => {
      const token = signToken(req.user);
      res.cookie("token", token, cookieOpts);
      res.redirect(`${process.env.CLIENT_URL}/account`);
    }
  );
} else {
  router.get(["/google", "/google/callback"], (req, res) => {
    res.status(503).json({ error: "Google sign-in is not configured" });
  });
}

// ---- Current user ----
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitize(rows[0]) });
});

// ---- Logout ----
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

export default router;
