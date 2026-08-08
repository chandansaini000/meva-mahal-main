import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

// ---- Public: list products with search / filter / sort / pagination ----
router.get("/", async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = "newest", page = 1, limit = 12, featured } = req.query;
  const values = [];
  const where = ["p.is_active = true"];

  if (q) {
    values.push(`%${q}%`);
    where.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
  }
  if (category) {
    values.push(category);
    where.push(`c.slug = $${values.length}`);
  }
  if (minPrice) {
    values.push(minPrice);
    where.push(`p.price >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(maxPrice);
    where.push(`p.price <= $${values.length}`);
  }
  if (featured === "true") {
    where.push(`p.is_featured = true`);
  }

  const sortMap = {
    newest: "p.created_at DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    rating: "p.rating DESC",
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  const offset = (Number(page) - 1) * Number(limit);
  values.push(limit, offset);

  const query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${where.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  try {
    const { rows } = await pool.query(query, values);
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ${where.join(" AND ")}`,
      values.slice(0, values.length - 2)
    );
    res.json({ products: rows, total: Number(countRes.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch products" });
  }
});

// ---- Public: categories ----
router.get("/categories", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch categories" });
  }
});

// ---- Admin: category management ----
router.post("/categories", requireAuth, requireAdmin, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const slug = String(req.body.slug || "").trim().toLowerCase();
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(400).json({ error: "A name and URL-safe slug are required" });
  try {
    const { rows } = await pool.query("INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *", [name, slug]);
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    res.status(err.code === "23505" ? 409 : 500).json({ error: err.code === "23505" ? "That category already exists" : "Could not create category" });
  }
});

router.put("/categories/:id", requireAuth, requireAdmin, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const slug = String(req.body.slug || "").trim().toLowerCase();
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(400).json({ error: "A name and URL-safe slug are required" });
  try {
    const { rows } = await pool.query("UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *", [name, slug, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Category not found" });
    res.json({ category: rows[0] });
  } catch (err) {
    res.status(err.code === "23505" ? 409 : 500).json({ error: err.code === "23505" ? "That category already exists" : "Could not update category" });
  }
});

router.delete("/categories/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Category not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete category" });
  }
});

// ---- Admin: upload a local product image ----
router.post("/upload", requireAuth, requireAdmin, (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : "Upload a JPG, PNG, or WebP image" });
    if (!req.file) return res.status(400).json({ error: "Choose a JPG, PNG, or WebP image" });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// ---- Public: single product by slug ----
router.get("/:slug", async (req, res) => {
  try {
    console.log("Requested slug:", req.params.slug);

    const allProducts = await pool.query(
      "SELECT id, name, slug FROM products ORDER BY id DESC"
    );

    console.table(allProducts.rows);

    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1`,
      [req.params.slug]
    );

    console.log("Matched:", rows);

    if (!rows.length) {
      return res.status(404).json({
        error: "Product not found",
        requested: req.params.slug,
      });
    }

    res.json({
      product: rows[0],
      reviews: [],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

// ---- Admin: create product ----
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, slug, description, category_id, price, compare_price, stock, unit, image_url, images, is_featured } = req.body;
  const normalizedImages = Array.isArray(images) ? images : [];

  try {
    console.log("Requested slug:", req.params.slug);

const test = await pool.query(`
  SELECT id, name, slug
  FROM products
  ORDER BY id DESC
`);

console.table(test.rows);
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, description, category_id, price, compare_price, stock, unit, image_url, images, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, slug, description, category_id, price, compare_price, stock, unit, image_url || normalizedImages[0] || null, JSON.stringify(normalizedImages), !!is_featured]
    );
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create product" });
  }
});

// ---- Admin: update product ----
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  
  const fields = ["name", "slug", "description", "category_id", "price", "compare_price", "stock", "unit", "image_url", "images", "is_featured", "is_active"];
  const updates = [];
  const values = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      values.push(f === "images" ? JSON.stringify(Array.isArray(req.body[f]) ? req.body[f] : []) : req.body[f]);
      updates.push(`${f} = $${values.length}`);
    }
  });
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update product" });
  }
});

// ---- Admin: delete product ----
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
