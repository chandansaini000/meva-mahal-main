export function sanitizeDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidPincode(value) {
  return /^\d{6}$/.test(String(value ?? ""));
}

export function isValidMobile(value) {
  return /^\d{10}$/.test(String(value ?? ""));
}
