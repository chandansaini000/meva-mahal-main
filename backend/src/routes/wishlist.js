import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT w.id AS wishlist_id, p.* FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json({ items: rows });
});

router.post("/", async (req, res) => {
  const { product_id } = req.body;
  await pool.query(
    `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [req.user.id, product_id]
  );
  res.status(201).json({ ok: true });
});

router.delete("/:productId", async (req, res) => {
  await pool.query("DELETE FROM wishlist_items WHERE user_id=$1 AND product_id=$2", [req.user.id, req.params.productId]);
  res.json({ ok: true });
});

export default router;
