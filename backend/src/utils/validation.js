export const NAME_PATTERN = /^[A-Za-z ]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^\d{6}$/;
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function validateName(value) {
  return NAME_PATTERN.test(String(value ?? "").trim());
}

export function validateEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? "").trim());
}

export function validatePincode(value) {
  return PINCODE_PATTERN.test(String(value ?? ""));
}

export function validateMobile(value) {
  return MOBILE_PATTERN.test(String(value ?? ""));
}
