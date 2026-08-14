import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// This module is imported before server.js calls dotenv.config() in ESM.
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
