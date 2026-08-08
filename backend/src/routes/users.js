import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.put("/me", async (req, res) => {
  const fields = ["name", "phone", "address_line", "city", "state", "pincode", "avatar_url"];
  const updates = [];
  const values = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      values.push(req.body[f]);
      updates.push(`${f} = $${values.length}`);
    }
  });
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  values.push(req.user.id);

  const { rows } = await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, name, email, phone, address_line, city, state, pincode, avatar_url, role`,
    values
  );
  res.json({ user: rows[0] });
});

export default router;
