import { pool } from "../db.js";

const products = [
  ["Royal California Almonds", "royal-california-almonds", "Crunchy whole almonds, selected for their naturally sweet finish.", "almonds", 399, 449, 72, "250g", true, ["/uploads/almond1.jpg", "/uploads/almond2.jpg", "/uploads/almond3.jpg"]],
  ["Kashmiri Mamra Almonds", "kashmiri-mamra-almonds", "A small-batch premium almond with rich flavour and a delicate bite.", "almonds", 649, 699, 34, "250g", true, ["/uploads/almond4.jpg"]],
  ["Roasted & Salted Pistachios", "roasted-salted-pistachios", "Bright green pistachios, gently roasted and lightly salted.", "pistachios", 549, 599, 48, "250g", true, ["/uploads/pistachio1.jpg", "/uploads/pistachio2.jpg"]],
  ["Irani Pistachio Kernels", "irani-pistachio-kernels", "Shelled pistachio kernels for baking, desserts and snacking.", "pistachios", 799, null, 25, "200g", false, ["/uploads/pistachio3.jpg"]],
  ["Premium Walnut Halves", "premium-walnut-halves", "Fresh, buttery walnut halves for breakfast bowls and baking.", "walnuts", 469, 525, 40, "250g", true, ["/uploads/walnut1.jpg", "/uploads/walnut2.jpg"]],
  ["Medjool Dates", "medjool-dates", "Large, soft Medjool dates with a caramel-like sweetness.", "dates", 429, null, 56, "400g", true, ["/uploads/dates1.jpg"]],
  ["Ajwa Dates", "ajwa-dates", "Naturally soft, richly flavoured Ajwa dates from Saudi Arabia.", "dates", 699, 749, 31, "400g", false, ["/uploads/dates2.jpg", "/uploads/dates3.jpg"]],
  ["Jumbo Cashews", "jumbo-cashews", "Whole, creamy cashews with an indulgent crunch.", "cashews", 449, 499, 62, "250g", true, ["/uploads/cashew1.jpg", "/uploads/cashew2.jpg"]],
  ["Pepper Cashews", "pepper-cashews", "Roasted cashews with a warm black-pepper finish.", "cashews", 479, null, 38, "250g", false, ["/uploads/cashew3.jpg"]],
  ["The Celebration Box", "the-celebration-box", "A gift-ready selection of almonds, cashews, pistachios and dates.", "gift-boxes", 1199, 1399, 18, "800g", true, ["/uploads/box1.jpg", "/uploads/box2.jpg", "/uploads/box3.jpg"]],
  ["Everyday Essentials Box", "everyday-essentials-box", "Four pantry favourites packed for everyday nourishment.", "gift-boxes", 899, null, 22, "600g", false, ["/uploads/box4.jpg"]],
  ["Trail Mix", "trail-mix", "Almonds, cashews, raisins and cranberries in a balanced snack mix.", "gift-boxes", 359, null, 65, "250g", false, ["/uploads/box5.jpg", "/uploads/box6.jpg"]],
];

async function seed() {
  for (const [name, slug, description, categorySlug, price, comparePrice, stock, unit, featured, images] of products) {
    await pool.query(
      `INSERT INTO products (name, slug, description, category_id, price, compare_price, stock, unit, is_featured, is_active, image_url, images)
       VALUES ($1, $2, $3, (SELECT id FROM categories WHERE slug = $4), $5, $6, $7, $8, $9, true,
               $10, $11)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, category_id = EXCLUDED.category_id,
         price = EXCLUDED.price, compare_price = EXCLUDED.compare_price, stock = EXCLUDED.stock,
         unit = EXCLUDED.unit, image_url = EXCLUDED.image_url, images = EXCLUDED.images, is_featured = EXCLUDED.is_featured, is_active = true`,
      [name, slug, description, categorySlug, price, comparePrice, stock, unit, featured, images[0] || null, JSON.stringify(images)]
    );
  }
  console.log(`Seeded ${products.length} editable products.`);
  await pool.end();
}

seed().catch((error) => { console.error("Could not seed products:", error); process.exitCode = 1; });
