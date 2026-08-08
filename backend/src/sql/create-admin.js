import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "Mevamahal Admin").trim();

if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [name.slice(0, 120), email, hash]
  );
  console.log(`Admin account ready for ${email}.`);
} catch (error) {
  console.error("Could not create admin account:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
