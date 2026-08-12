import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// --------------------------------------------------
// TEST
// --------------------------------------------------
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Orders route is working",
  });
});

// --------------------------------------------------
// DEBUG SINGLE ORDER ROUTE
// --------------------------------------------------
router.get("/debug/:id", (req, res) => {
  res.json({
    ok: true,
    message: "Dynamic order route is working",
    id: req.params.id,
  });
});

// --------------------------------------------------
// PLACE ORDER - CUSTOMER
// POST /api/orders
// --------------------------------------------------
router.post("/", requireAuth, async (req, res) => {
  const {
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_pincode,
    payment_method,
    gift_service,
    gift_message,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get customer's cart
    const cartRes = await client.query(
      `
      SELECT
        ci.quantity,
        p.id,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      `,
      [req.user.id]
    );

    if (!cartRes.rows.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    // Check stock
    for (const item of cartRes.rows) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          error: `${item.name} has only ${item.stock} left in stock`,
        });
      }
    }

    // Calculate total
    const total = cartRes.rows.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Create order
    const orderRes = await client.query(
      `
      INSERT INTO orders (
        user_id,
        total_amount,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        payment_method,
        gift_service,
        gift_message,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending'
      )
      RETURNING *
      `,
      [
        req.user.id,
        total,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        payment_method || "cod",
        gift_service?.slice(0, 120) || null,
        gift_message?.slice(0, 500) || null,
      ]
    );

    const order = orderRes.rows[0];

    // Create order items + reduce stock
    for (const item of cartRes.rows) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          order.id,
          item.id,
          item.name,
          item.price,
          item.quantity,
        ]
      );

      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.id]
      );
    }

    // Clear cart
    await client.query(
      "DELETE FROM cart_items WHERE user_id = $1",
      [req.user.id]
    );

    await client.query("COMMIT");

    // Get order items
    const items = await client.query(
      `
      SELECT
        oi.*,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [order.id]
    );

    order.items = items.rows;

    return res.status(201).json({
      order,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Place order error:", err);

    return res.status(500).json({
      error: "Could not place order",
    });
  } finally {
    client.release();
  }
});

// --------------------------------------------------
// CUSTOMER - MY ORDERS
// GET /api/orders/my
// --------------------------------------------------
router.get("/my", requireAuth, async (req, res) => {
  try {
    console.log("GET MY ORDERS:", {
      userId: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    });

    const { rows } = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    // Add items to every order
    for (const order of rows) {
      const items = await pool.query(
        `
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.price,
          oi.quantity,
          p.image_url
        FROM order_items oi
        LEFT JOIN products p
          ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id
        `,
        [order.id]
      );

      order.items = items.rows;
    }

    return res.json({
      orders: rows,
    });
  } catch (err) {
    console.error("My orders error:", err);

    return res.status(500).json({
      error: "Could not fetch orders",
    });
  }
});

// --------------------------------------------------
// CUSTOMER - SINGLE ORDER
// GET /api/orders/:id
// --------------------------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    console.log("GET SINGLE ORDER:", {
      orderId,
      userId: req.user?.id,
      params: req.params,
    });

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        error: "Invalid order id",
      });
    }

    const { rows } = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
        AND user_id = $2
      `,
      [orderId, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Order not found",
        orderId,
        userId: req.user.id,
      });
    }

    const order = rows[0];

    const items = await pool.query(
      `
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.product_name,
        oi.price,
        oi.quantity,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [order.id]
    );

    order.items = items.rows;

    return res.json({
      order,
    });
  } catch (err) {
    console.error("Single order error:", err);

    return res.status(500).json({
      error: "Could not fetch order",
    });
  }
});

// --------------------------------------------------
// ADMIN - ALL ORDERS
// GET /api/orders
// --------------------------------------------------
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const values = [];
    let where = "";

    if (status) {
      values.push(status);
      where = "WHERE o.status = $1";
    }

    const { rows } = await pool.query(
      `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      JOIN users u
        ON u.id = o.user_id
      ${where}
      ORDER BY o.created_at DESC
      `,
      values
    );

    return res.json({
      orders: rows,
    });
  } catch (err) {
    console.error("Admin orders error:", err);

    return res.status(500).json({
      error: "Could not fetch admin orders",
    });
  }
});

// --------------------------------------------------
// ADMIN - UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// --------------------------------------------------
router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      order: rows[0],
    });
  } catch (err) {
    console.error("Update order status error:", err);

    return res.status(500).json({
      error: "Could not update order status",
    });
  }
});

export default router;