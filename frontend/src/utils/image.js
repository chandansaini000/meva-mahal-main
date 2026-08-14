import api from "../api/client.js";

export const DEFAULT_IMAGE_FALLBACK = "/assets/mevamahal-logo.jpeg";

const CLOUDINARY_URL = /^https?:\/\/res\.cloudinary\.com\//i;
const DIRECT_IMAGE_URL = /^(https?:|data:|blob:)/i;
const LEGACY_FILENAME = /^[^/?#]+\.(?:jpe?g|png|webp|gif|avif|svg)$/i;

export function resolveImageSrc(value, fallback = DEFAULT_IMAGE_FALLBACK) {
  if (!value || typeof value !== "string") return fallback;
  // Cloudinary secure_url values are already complete URLs.
  if (CLOUDINARY_URL.test(value)) return value;

  // Keep external URLs and temporary browser previews unchanged.
  if (DIRECT_IMAGE_URL.test(value)) return value;
  if (value.startsWith("/assets/")) return value;
  if (/^\/?uploads\//i.test(value)) {
    const filename = value.replace(/^\/?uploads\//i, "");
    return new URL(`/uploads/${filename}`, api.defaults.baseURL).toString();
  }
  // Plain filenames are legacy database values only. Newly uploaded files
  // arrive from the backend as Cloudinary URLs, never as filenames.
  if (LEGACY_FILENAME.test(value)) {
    return new URL(`/uploads/${value}`, api.defaults.baseURL).toString();
  }
  return value;
}
