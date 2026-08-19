import express from "express";
import {pool} from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/coupons/test", (req, res) => {
  res.json({
    ok: true,
    message: "Coupon route is working",
  });
});

// ------------------------------------
// Validate coupon
// ------------------------------------
router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: "Coupon code is required",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (!Number.isFinite(orderSubtotal) || orderSubtotal < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid subtotal",
      });
    }

    const { rows } = await pool.query(
      `
      SELECT
        id,
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        used_count,
        expires_at,
        is_active
      FROM coupons
      WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))
        AND is_active = TRUE
        AND (
          expires_at IS NULL
          OR expires_at >= NOW()
        )
      LIMIT 1
      `,
      [code]
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired coupon",
      });
    }
    const coupon = rows[0];
    // Minimum order amount
    if (
      coupon.min_order_amount !== null &&
      orderSubtotal < Number(coupon.min_order_amount)
    ) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount is ₹${Number(
          coupon.min_order_amount
        ).toFixed(2)}`,
      });
    }

    // Usage limit
    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count || 0) >= Number(coupon.usage_limit)
    ) {
      return res.status(400).json({
        success: false,
        error: "This coupon usage limit has been reached",
      });
    }

    let discount = 0;

    // Percentage discount
    if (coupon.discount_type === "percentage") {
      discount =
        (orderSubtotal * Number(coupon.discount_value)) / 100;
    }

    // Fixed discount
    else if (coupon.discount_type === "fixed" || coupon.discount_type === "flat") {
      discount = Number(coupon.discount_value);
    }

    else {
      return res.status(400).json({
        success: false,
        error: "Invalid coupon discount type",
      });
    }

    // Maximum discount
    if (
      coupon.max_discount_amount !== null &&
      discount > Number(coupon.max_discount_amount)
    ) {
      discount = Number(coupon.max_discount_amount);
    }
    // Discount cannot exceed subtotal
    discount = Math.min(discount, orderSubtotal);

    // Round values
    discount = Math.round(discount * 100) / 100;

    const total =
      Math.round((orderSubtotal - discount) * 100) / 100;

    return res.json({
      success: true,

      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount:
          coupon.min_order_amount !== null
            ? Number(coupon.min_order_amount)
            : null,
        max_discount_amount:
          coupon.max_discount_amount !== null
            ? Number(coupon.max_discount_amount)
            : null,
      },

      subtotal: orderSubtotal,
      discount,
      total,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not validate coupon",
    });
  }
});

// Public checkout list. Only active, currently valid, and usable coupons are exposed.
router.get("/coupons/available", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, code, description, discount_type, discount_value,
              min_order_amount, max_discount_amount, usage_limit, used_count, expires_at
       FROM coupons
       WHERE is_active = TRUE
         AND (expires_at IS NULL OR expires_at >= NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)
       ORDER BY created_at DESC`
    );
    res.json({ coupons: rows });
  } catch (error) {
    console.error("Available coupon list error:", error);
    res.status(500).json({ error: "Could not fetch available coupons" });
  }
});

router.get("/coupons", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json({ coupons: rows });
  } catch (error) {
    console.error("Coupon list error:", error);
    res.status(500).json({ error: "Could not fetch coupons" });
  }
});

router.post("/coupons", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active = true } = req.body;
    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode || !["percentage", "fixed"].includes(discount_type) || Number(discount_value) <= 0) {
      return res.status(400).json({ error: "Code, discount type, and a positive discount value are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [normalizedCode, description || null, discount_type, Number(discount_value), min_order_amount || null, max_discount_amount || null, usage_limit || null, expires_at || null, Boolean(is_active)]
    );
    res.status(201).json({ coupon: rows[0] });
  } catch (error) {
    console.error("Coupon create error:", error);
    res.status(error.code === "23505" ? 409 : 500).json({ error: error.code === "23505" ? "Coupon code already exists" : "Could not create coupon" });
  }
});

router.delete("/coupons/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM coupons WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Coupon not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Coupon delete error:", error);
    res.status(500).json({ error: "Could not delete coupon" });
  }
});

// ------------------------------------
// Default export
// ------------------------------------
export default router;
