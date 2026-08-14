import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mevamahal/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const upload = multer({
  storage: cloudinaryStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Upload a JPG, PNG, or WebP image"));
    }

    callback(null, true);
  },
});

function cloudinaryUpload(fields) {
  const middleware = fields === "images"
    ? upload.array("images", 5)
    : upload.single(fields);

  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (!error) return next();
      return res.status(400).json({
        error: error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller"
          : error.message || "Could not upload image to Cloudinary",
      });
    });
  };
}

// multer-storage-cloudinary exposes the uploaded delivery URL as `path`
// (and the public id as `filename`). Keep the fallbacks for adapters that
// expose Cloudinary's native response keys instead.
function getCloudinaryUrl(file) {
  return file?.secure_url || file?.path || file?.url || null;
}

function getCloudinaryPublicId(file) {
  return file?.public_id || file?.filename || null;
}

function toPublicUploadUrl(req, value) {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value;
  if (/^\/?uploads\//i.test(value)) {
    return `${req.protocol}://${req.get("host")}/uploads/${value.replace(/^\/?uploads\//i, "")}`;
  }
  return value;
}

function normalizeProduct(req, product) {
  if (!product) return product;
  let images = product.images;
  if (typeof images === "string") {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (!Array.isArray(images)) images = [];
  return {
    ...product,
    image_url: toPublicUploadUrl(req, product.image_url),
    images: images.map((image) => toPublicUploadUrl(req, image)),
  };
}

/* =========================================================
   PUBLIC: LIST PRODUCTS
========================================================= */

router.get("/", async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const values = [];
  const where = ["p.is_active = true"];

  if (q) {
    values.push(`%${q}%`);

    where.push(
      `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length} OR c.name ILIKE $${values.length} OR c.slug ILIKE $${values.length})`
    );
  }

  if (category) {
    values.push(category);
    where.push(`c.slug = $${values.length}`);
  }

  if (minPrice) {
    values.push(minPrice);
    where.push(`p.price >= $${values.length}`);
  }

  if (maxPrice) {
    values.push(maxPrice);
    where.push(`p.price <= $${values.length}`);
  }

  if (featured === "true") {
    where.push("p.is_featured = true");
  }

  const sortMap = {
    newest: "p.created_at DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    rating: "p.rating DESC",
  };

  const orderBy = sortMap[sort] || sortMap.newest;

  const safeLimit = Math.max(1, Number(limit) || 12);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  values.push(safeLimit, offset);

  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      c.slug AS category_slug,
      c.image_url AS category_image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${where.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;

  try {
    const { rows } = await pool.query(query, values);

    const countRes = await pool.query(
      `
        SELECT COUNT(*)
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE ${where.join(" AND ")}
      `,
      values.slice(0, values.length - 2)
    );

    res.json({
      products: rows.map((row) => normalizeProduct(req, row)),
      total: Number(countRes.rows[0].count),
    });
  } catch (err) {
    console.error("Product list error:", err);

    res.status(500).json({
      error: "Could not fetch products",
    });
  }
});

/* =========================================================
   PUBLIC: CATEGORIES
========================================================= */

router.get("/categories", async (req, res) => {
  try {
    console.log("GET /products/categories called");

    const { rows } = await pool.query(
      "SELECT id, name, slug, image_url FROM categories ORDER BY name"
    );

    console.log("Categories:", rows);

    res.json({
      categories: rows,
    });
  } catch (err) {
    console.error("CATEGORY ERROR:", err);

    res.status(500).json({
      error: "Could not fetch categories",
    });
  }
});
/* =========================================================
   ADMIN: CREATE CATEGORY WITH IMAGE
========================================================= */

router.post(
  "/categories",
  requireAuth,
  requireAdmin,
  cloudinaryUpload("image"),
  async (req, res) => {
    const name = String(req.body.name || "").trim();
    const slug = String(req.body.slug || "").trim().toLowerCase();

    if (
      !name ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      return res.status(400).json({
        error: "A name and URL-safe slug are required",
      });
    }

    const imageUrl = req.file
      ? getCloudinaryUrl(req.file)
      : null;

    try {
      const { rows } = await pool.query(
        `
          INSERT INTO categories (
            name,
            slug,
            image_url
          )
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [name, slug, imageUrl]
      );

      res.status(201).json({
        category: rows[0],
      });
    } catch (err) {
      console.error("Create category error:", err);

      res.status(err.code === "23505" ? 409 : 500).json({
        error:
          err.code === "23505"
            ? "That category already exists"
            : "Could not create category",
      });
    }
  }
);

/* =========================================================
   ADMIN: UPDATE CATEGORY WITH IMAGE
========================================================= */

router.put(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  cloudinaryUpload("image"),
  async (req, res) => {
    const name = String(req.body.name || "").trim();
    const slug = String(req.body.slug || "").trim().toLowerCase();

    if (
      !name ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      return res.status(400).json({
        error: "A name and URL-safe slug are required",
      });
    }

    try {
      const existing = await pool.query(
        `
          SELECT image_url
          FROM categories
          WHERE id = $1
        `,
        [req.params.id]
      );

      if (!existing.rows[0]) {
        return res.status(404).json({
          error: "Category not found",
        });
      }

      let imageUrl = existing.rows[0].image_url;

      if (req.file) {
        imageUrl = getCloudinaryUrl(req.file);
      } else if (String(req.body.removeImage || "").toLowerCase() === "true") {
        imageUrl = null;
      }

      const { rows } = await pool.query(
        `
          UPDATE categories
          SET
            name = $1,
            slug = $2,
            image_url = $3
          WHERE id = $4
          RETURNING *
        `,
        [name, slug, imageUrl, req.params.id]
      );

      res.json({
        category: rows[0],
      });
    } catch (err) {
      console.error("Update category error:", err);

      res.status(err.code === "23505" ? 409 : 500).json({
        error:
          err.code === "23505"
            ? "That category already exists"
            : "Could not update category",
      });
    }
  }
);

/* =========================================================
   ADMIN: DELETE CATEGORY
========================================================= */

router.delete(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM categories WHERE id = $1",
        [req.params.id]
      );

      if (!rowCount) {
        return res.status(404).json({
          error: "Category not found",
        });
      }

      res.json({
        ok: true,
      });
    } catch (err) {
      console.error("Delete category error:", err);

      res.status(500).json({
        error: "Could not delete category",
      });
    }
  }
);

/* =========================================================
   ADMIN: UPLOAD PRODUCT IMAGE
========================================================= */

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  cloudinaryUpload("image"),
  (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          error: "Choose a JPG, PNG, or WebP image",
        });
      }

      res.status(201).json({
        url: getCloudinaryUrl(req.file),
        public_id: getCloudinaryPublicId(req.file),
      });
  }
);

/* =========================================================
PUBLIC: ALL REVIEWS FOR HOMEPAGE
========================================================= */

router.get("/reviews", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        u.name AS user_name,
        u.avatar_url,
        TRUE AS verified_purchase
      FROM reviews r
      JOIN users u
        ON u.id = r.user_id
      ORDER BY r.created_at DESC
    `);

    res.json({
      reviews: rows,
    });
  } catch (err) {
    console.error("Reviews list error:", err);

    res.status(500).json({
      error: "Could not fetch reviews",
    });
  }
});


/* =========================================================
   PUBLIC: SINGLE PRODUCT BY SLUG
========================================================= */

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          p.*,
          c.name AS category_name,
          c.slug AS category_slug,
          c.image_url AS category_image_url
        FROM products p
        LEFT JOIN categories c
          ON c.id = p.category_id
        WHERE p.slug = $1
      `,
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Product not found",
        requested: req.params.slug,
      });
    }

    const reviews = await pool.query(
      `
        SELECT
          r.*,
          u.name AS user_name,
          u.avatar_url,
          TRUE AS verified_purchase
        FROM reviews r
        JOIN users u
          ON u.id = r.user_id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `,
      [rows[0].id]
    );

    res.json({
      product: normalizeProduct(req, rows[0]),
      reviews: reviews.rows,
    });
  } catch (err) {
    console.error("Single product error:", err);

    res.status(500).json({
      error: "Could not fetch product",
    });
  }
});

/* =========================================================
   ADMIN: CREATE PRODUCT
========================================================= */

router.post(
  "/",
  requireAuth,
  requireAdmin,
  cloudinaryUpload("images"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        category_id,
        price,
        compare_price,
        stock,
        unit,
        image_url,
        is_featured,
        is_active,
      } = req.body;

      let existingImages = [];

      if (req.body.existingImages) {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch {
          existingImages = [];
        }
      }

      const uploadedImages = (req.files || []).map(getCloudinaryUrl).filter(Boolean);

      const images = [
        ...existingImages,
        ...uploadedImages,
      ];

      const primaryImage =
        image_url ||
        images[0] ||
        null;

      const { rows } = await pool.query(
        `
          INSERT INTO products (
            name,
            slug,
            description,
            category_id,
            price,
            compare_price,
            stock,
            unit,
            image_url,
            images,
            is_featured,
            is_active
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
          )
          RETURNING *
        `,
        [
          name,
          slug,
          description,
          category_id || null,
          price,
          compare_price || null,
          stock || 0,
          unit,
          primaryImage,
          JSON.stringify(images),
          is_featured === "true",
          is_active === undefined
            ? true
            : is_active === "true",
        ]
      );

      res.status(201).json({
        product: normalizeProduct(req, rows[0]),
      });
    } catch (err) {
      console.error("Create product error:", err);

      res.status(500).json({
        error: "Could not create product",
      });
    }
  }
);

/* =========================================================
   ADMIN: UPDATE PRODUCT
========================================================= */

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  cloudinaryUpload("images"),
  async (req, res) => {
    try {
      const productId = req.params.id;

      const existingProduct = await pool.query(
        `
          SELECT *
          FROM products
          WHERE id = $1
        `,
        [productId]
      );

      if (!existingProduct.rows[0]) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      const oldProduct = existingProduct.rows[0];

      const updates = [];
      const values = [];

      /* -----------------------------------------
         NORMAL PRODUCT FIELDS
      ----------------------------------------- */

      const fields = [
        "name",
        "slug",
        "description",
        "category_id",
        "price",
        "compare_price",
        "stock",
        "unit",
        "image_url",
        "is_featured",
        "is_active",
      ];

      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          let value = req.body[field];

          if (
            field === "is_featured" ||
            field === "is_active"
          ) {
            value = value === true || value === "true";
          }

          if (field === "category_id" && value === "") {
            value = null;
          }

          if (
            ["price", "compare_price", "stock"].includes(field) &&
            value === ""
          ) {
            value = null;
          }

          values.push(value);

          updates.push(
            `${field} = $${values.length}`
          );
        }
      });

      /* -----------------------------------------
         EXISTING IMAGES
      ----------------------------------------- */

      let existingImages = oldProduct.images || [];

      if (typeof existingImages === "string") {
        try {
          existingImages = JSON.parse(existingImages);
        } catch {
          existingImages = [];
        }
      }

      if (!Array.isArray(existingImages)) {
        existingImages = [];
      }

      if (req.body.existingImages !== undefined) {
        try {
          existingImages = JSON.parse(
            req.body.existingImages
          );

          if (!Array.isArray(existingImages)) {
            existingImages = [];
          }
        } catch {
          existingImages = [];
        }
      }

      /* -----------------------------------------
         REMOVED IMAGES
      ----------------------------------------- */

      let removedImages = [];

      if (req.body.removedImages) {
        try {
          removedImages = JSON.parse(
            req.body.removedImages
          );

          if (!Array.isArray(removedImages)) {
            removedImages = [];
          }
        } catch {
          removedImages = [];
        }
      }

      existingImages = existingImages.filter(
        (image) => !removedImages.includes(image)
      );

      /* -----------------------------------------
         NEW UPLOADED IMAGES
      ----------------------------------------- */

      const newImages = (req.files || []).map(getCloudinaryUrl).filter(Boolean);

      const finalImages = [
        ...existingImages,
        ...newImages,
      ];

      /* -----------------------------------------
         UPDATE IMAGES ONLY WHEN IMAGE DATA
         WAS SENT
      ----------------------------------------- */

      const imageDataWasSent =
        req.body.existingImages !== undefined ||
        req.body.removedImages !== undefined ||
        newImages.length > 0;

      if (imageDataWasSent) {
        values.push(JSON.stringify(finalImages));

        updates.push(
          `images = $${values.length}`
        );

        /*
         * If image_url was not explicitly changed,
         * automatically keep first image as primary.
         */
        if (req.body.image_url === undefined) {
          values.push(finalImages[0] || null);

          updates.push(
            `image_url = $${values.length}`
          );
        }
      }

      /* -----------------------------------------
         NO FIELDS CHECK
      ----------------------------------------- */

      if (!updates.length) {
        return res.status(400).json({
          error: "No fields to update",
        });
      }

      /* -----------------------------------------
         EXECUTE UPDATE
      ----------------------------------------- */

      values.push(productId);

      const { rows } = await pool.query(
        `
          UPDATE products
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING *
        `,
        values
      );

      res.json({
        product: normalizeProduct(req, rows[0]),
      });
    } catch (err) {
      console.error("Update product error:", err);

      res.status(500).json({
        error: "Could not update product",
      });
    }
  }
);

/* =========================================================
   ADMIN: DELETE PRODUCT
========================================================= */

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM products WHERE id = $1",
        [req.params.id]
      );

      if (!rowCount) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      res.json({
        ok: true,
      });
    } catch (err) {
      console.error("Delete product error:", err);

      res.status(500).json({
        error: "Could not delete product",
      });
    }
  }
);

export default router;
