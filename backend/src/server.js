import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import couponRoutes from "./routes/coupons.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import siteRoutes from "./routes/site.js";
import reviewRoutes from "./routes/reviews.js";
import contactRoutes from "./routes/contact.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ------------------------------------
// Basic configuration
// ------------------------------------

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.disable("x-powered-by");

// ------------------------------------
// CORS
// ------------------------------------

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ------------------------------------
// Body parsers
// ------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------
// Static uploads
// ------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../uploads"))
);

// ------------------------------------
// Cookies & Session
// ------------------------------------

app.use(cookieParser());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      process.env.JWT_SECRET ||
      "development-session-secret",

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", couponRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use("/api", reviewRoutes);
app.use("/api", contactRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Mevamahal API is running",
  });
});

// ------------------------------------
// 404 API handler
// ------------------------------------

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌰 Mevamahal API running on port ${PORT}`);
  console.log(`Frontend: ${clientUrl}`);
});