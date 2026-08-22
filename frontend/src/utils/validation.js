export function sanitizeDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function sanitizeName(value) {
  return String(value ?? "").replace(/[^A-Za-z ]/g, "");
}

export const NAME_PATTERN = /^[A-Za-z ]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const PINCODE_PATTERN = /^\d{6}$/;

export function isValidName(value) {
  return NAME_PATTERN.test(String(value ?? "").trim());
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? "").trim());
}

export function isValidPincode(value) {
  return PINCODE_PATTERN.test(String(value ?? ""));
}

export function isValidMobile(value) {
  return MOBILE_PATTERN.test(String(value ?? ""));
}

export const VALIDATION_MESSAGES = {
  name: "Name can only contain letters.",
  phone: "Phone number must start with 6, 7, 8, or 9.",
  email: "Please enter a valid email address.",
  pincode: "PIN code must contain only 6 digits.",
};

export function validateField(type, value, required = true) {
  const text = String(value ?? "").trim();
  if (!text) return required ? (type === "name" ? VALIDATION_MESSAGES.name : type === "email" ? VALIDATION_MESSAGES.email : type === "phone" ? VALIDATION_MESSAGES.phone : VALIDATION_MESSAGES.pincode) : "";
  const valid = type === "name" ? isValidName(value) : type === "email" ? isValidEmail(value) : type === "phone" ? isValidMobile(value) : isValidPincode(value);
  return valid ? "" : VALIDATION_MESSAGES[type];
}

export function fieldClass(base, error) {
  return `${base}${error ? " border-red-500 focus:border-red-500" : ""}`;
}
