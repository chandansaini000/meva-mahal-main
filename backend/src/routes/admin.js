import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// Dashboard summary stats
router.get("/stats", async (req, res) => {
  const [revenue, orders, customers, products, lowStock, recentOrders, salesByDay] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status != 'cancelled'`),
    pool.query(`SELECT COUNT(*) FROM orders`),
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
    pool.query(`SELECT COUNT(*) FROM products`),
    pool.query(`SELECT id, name, stock FROM products WHERE stock <= 10 ORDER BY stock ASC LIMIT 5`),
    pool.query(`SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS customer_name
                FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 5`),
    pool.query(`SELECT DATE(created_at) AS day, SUM(total_amount) AS total
                FROM orders WHERE created_at > now() - interval '14 days' AND status != 'cancelled'
                GROUP BY day ORDER BY day`),
  ]);

  res.json({
    revenue: Number(revenue.rows[0].total),
    orderCount: Number(orders.rows[0].count),
    customerCount: Number(customers.rows[0].count),
    productCount: Number(products.rows[0].count),
    lowStock: lowStock.rows,
    recentOrders: recentOrders.rows,
    salesByDay: salesByDay.rows,
  });
});

// List/manage users
router.get("/users", async (req, res) => {
  const { rows } = await pool.query("SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC");
  res.json({ users: rows });
});

router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["customer", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  const { rows } = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role", [role, req.params.id]);
  res.json({ user: rows[0] });
});

export default router;
