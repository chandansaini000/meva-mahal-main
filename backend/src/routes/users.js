import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validateEmail, validateMobile, validateName, validatePincode } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

router.put("/me", async (req, res) => {
  const fields = ["name", "phone", "address_line", "city", "state", "pincode", "avatar_url"];
  const phone = req.body.phone === undefined ? undefined : String(req.body.phone ?? "").trim();
  const pincode = req.body.pincode === undefined ? undefined : String(req.body.pincode ?? "").trim();
  if (req.body.name !== undefined && !validateName(req.body.name)) {
    return res.status(400).json({ error: "Name can only contain letters." });
  }
  if (req.body.email !== undefined && !validateEmail(req.body.email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (phone && !validateMobile(phone)) {
    return res.status(400).json({ error: "Phone number must start with 6, 7, 8, or 9." });
  }
  if (pincode && !validatePincode(pincode)) {
    return res.status(400).json({ error: "PIN code must contain only 6 digits." });
  }

  const updates = [];
  const values = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      values.push(f === "phone" ? phone : f === "pincode" ? pincode : req.body[f]);
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
