import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Get current user's cart with product details
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ci.id, ci.quantity, p.* FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1 ORDER BY ci.created_at DESC`,
    [req.user.id]
  );
  res.json({ items: rows });
});

// Add / increment item
router.post("/", async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1,$2,$3)
     ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + $3
     RETURNING *`,
    [req.user.id, product_id, quantity]
  );
  res.status(201).json({ item: rows[0] });
});

// Update quantity
router.put("/:productId", async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2", [req.user.id, req.params.productId]);
    return res.json({ ok: true, removed: true });
  }
  const { rows } = await pool.query(
    "UPDATE cart_items SET quantity=$1 WHERE user_id=$2 AND product_id=$3 RETURNING *",
    [quantity, req.user.id, req.params.productId]
  );
  res.json({ item: rows[0] });
});

// Remove item
router.delete("/:productId", async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2", [req.user.id, req.params.productId]);
  res.json({ ok: true });
});

export default router;
