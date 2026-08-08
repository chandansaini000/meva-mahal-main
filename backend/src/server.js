import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import siteRoutes from "./routes/site.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.disable("x-powered-by");
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "uploads")));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "development-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌰 Mevamahal API running on port ${PORT}`));
