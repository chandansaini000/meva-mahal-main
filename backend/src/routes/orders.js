import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Place order (checkout) — turns cart into an order
router.post("/", requireAuth, async (req, res) => {
  const { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method, gift_service, gift_message } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cartRes = await client.query(
      `SELECT ci.quantity, p.id, p.name, p.price, p.stock FROM cart_items ci
       JOIN products p ON p.id = ci.product_id WHERE ci.user_id = $1`,
      [req.user.id]
    );
    if (!cartRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    for (const item of cartRes.rows) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `${item.name} has only ${item.stock} left in stock` });
      }
    }

    const total = cartRes.rows.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method, gift_service, gift_message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING *`,
      [req.user.id, total, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method || "cod", gift_service?.slice(0, 120) || null, gift_message?.slice(0, 500) || null]
    );
    const order = orderRes.rows[0];

    for (const item of cartRes.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ($1,$2,$3,$4,$5)`,
        [order.id, item.id, item.name, item.price, item.quantity]
      );
      await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.id]);
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
    await client.query("COMMIT");

    res.status(201).json({ order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not place order" });
  } finally {
    client.release();
  }
});

// My orders
router.get("/my", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
  for (const order of rows) {
    const items = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
    order.items = items.rows;
  }
  res.json({ orders: rows });
});

// Admin: all orders
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const values = [];
  let where = "";
  if (status) {
    values.push(status);
    where = "WHERE o.status = $1";
  }
  const { rows } = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id ${where} ORDER BY o.created_at DESC`,
    values
  );
  res.json({ orders: rows });
});

// Admin: update order status
router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const { rows } = await pool.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
  res.json({ order: rows[0] });
});

export default router;
