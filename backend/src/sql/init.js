import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(sql);
  console.log("✅ Database schema created / verified.");
  process.exit(0);
}

init().catch((err) => {
  console.error("❌ Failed to init database:", err);
  process.exit(1);
});
