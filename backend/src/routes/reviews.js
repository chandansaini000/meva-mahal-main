import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
const reviewSelect = `
  SELECT r.id, r.product_id, r.user_id, r.order_id, r.rating, r.comment, r.created_at,
         u.name AS user_name, u.avatar_url,
         TRUE AS verified_purchase
  FROM reviews r
  JOIN users u ON u.id = r.user_id
`;

router.get("/admin/reviews", requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`SELECT r.id, r.product_id, r.user_id, r.order_id, r.rating, r.comment, r.created_at,
    u.name AS user_name, u.email AS user_email, p.name AS product_name
    FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC`);
  res.json({ reviews: rows });
});

router.delete("/admin/reviews/:id", requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING product_id", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Review not found" });
  await pool.query(`UPDATE products SET rating = stats.average, rating_count = stats.total
    FROM (SELECT COALESCE(AVG(rating), 0)::numeric(2,1) AS average, COUNT(*)::integer AS total
    FROM reviews WHERE product_id = $1) stats WHERE products.id = $1`, [rows[0].product_id]);
  res.json({ ok: true });
});

async function getProductId(slug) {
  const { rows } = await pool.query("SELECT id FROM products WHERE slug = $1", [slug]);
  return rows[0]?.id;
}
// Public: all customer reviews for the homepage.
router.get("/reviews", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.product_id, r.user_id, r.order_id, r.rating, r.comment,
             r.created_at, u.name AS user_name, u.avatar_url,
             TRUE AS verified_purchase, p.name AS product_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN products p ON p.id = r.product_id
      ORDER BY r.created_at DESC
    `);
    res.json({ reviews: rows });
  } catch (error) {
    console.error("Homepage reviews fetch error:", error);
    res.status(500).json({ error: "Could not fetch reviews" });
  }
});

router.get("/products/:slug/reviews", async (req, res) => {
  try {
    const productId = await getProductId(req.params.slug);
    if (!productId) return res.status(404).json({ error: "Product not found" });
    const { rows } = await pool.query(`${reviewSelect} WHERE r.product_id = $1 ORDER BY r.created_at DESC`, [productId]);
    res.json({ reviews: rows });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    res.status(500).json({ error: "Could not fetch reviews" });
  }
});

router.get("/products/:slug/review-status", requireAuth, async (req, res) => {
  try {
    const productId = await getProductId(req.params.slug);
    if (!productId) return res.status(404).json({ error: "Product not found" });

    const [review, purchase] = await Promise.all([
      pool.query("SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2", [productId, req.user.id]),
      pool.query(
        `SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status IN ('delivered', 'completed') LIMIT 1`,
        [req.user.id, productId]
      ),
    ]);

    res.json({
      alreadyReviewed: Boolean(review.rows.length),
      eligible: Boolean(purchase.rows.length),
      message: review.rows.length ? "You already reviewed this product" : undefined,
    });
  } catch (error) {
    console.error("Review status error:", error);
    res.status(500).json({ error: "Could not check review status" });
  }
});
// Stage 2: only delivered order items without the required unique review.
router.get("/reviews/pending", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.id AS order_id, o.created_at, oi.id AS order_item_id, oi.product_id,
             oi.product_name, p.image_url, p.slug
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN reviews r ON r.user_id = o.user_id AND r.order_id = o.id AND r.product_id = oi.product_id
      WHERE o.user_id = $1 AND o.status = 'delivered' AND oi.product_id IS NOT NULL AND r.id IS NULL
      ORDER BY o.created_at DESC, oi.id`, [req.user.id]);
    res.json({ reviews: rows });
  } catch (error) {
    console.error("Pending reviews error:", error);
    res.status(500).json({ error: "Could not fetch pending reviews" });
  }
});

router.post("/products/:id/reviews", requireAuth, async (req, res) => {
  const productId = Number(req.params.id);
  const orderId = Number(req.body.order_id);
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();
  if (!Number.isInteger(productId) || !Number.isInteger(orderId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  if (!comment) return res.status(400).json({ error: "Please write a review" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const purchase = await client.query(
      `SELECT o.id, o.status FROM orders o JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND o.user_id = $2 AND oi.product_id = $3 LIMIT 1`,
      [orderId, req.user.id, productId]
    );
    if (!purchase.rows.length) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You can review this product after a delivered purchase" });
    }

    const inserted = await client.query(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [productId, req.user.id, orderId, rating, comment.slice(0, 2000)]
    );
    await client.query(
      `UPDATE products SET rating = stats.average, rating_count = stats.total
       FROM (SELECT COALESCE(AVG(rating), 0)::numeric(2,1) AS average, COUNT(*)::integer AS total
             FROM reviews WHERE product_id = $1) stats WHERE products.id = $1`,
      [productId]
    );
    await client.query("COMMIT");

    const { rows } = await pool.query(`${reviewSelect} WHERE r.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ review: rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") return res.status(409).json({ error: "You already reviewed this product" });
    console.error("Review submission error:", error);
    res.status(500).json({ error: "Could not submit review" });
  } finally {
    client.release();
  }
});

router.put("/reviews/:id", requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return res.status(400).json({ error: "Rating and comment are required" });
  const { rows } = await pool.query(
    `UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
    [rating, comment.slice(0, 2000), req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Review not found" });
  await pool.query(`UPDATE products SET rating = stats.average, rating_count = stats.total FROM (SELECT COALESCE(AVG(rating),0)::numeric(2,1) AS average, COUNT(*)::integer AS total FROM reviews WHERE product_id = $1) stats WHERE products.id = $1`, [rows[0].product_id]);
  res.json({ review: rows[0] });
});

router.delete("/reviews/:id", requireAuth, async (req, res) => {
  const { rows } = await pool.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING product_id", [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ error: "Review not found" });
  await pool.query(`UPDATE products SET rating = stats.average, rating_count = stats.total FROM (SELECT COALESCE(AVG(rating),0)::numeric(2,1) AS average, COUNT(*)::integer AS total FROM reviews WHERE product_id = $1) stats WHERE products.id = $1`, [rows[0].product_id]);
  res.json({ ok: true });
});

export default router;
