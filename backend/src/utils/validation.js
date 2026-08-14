export const PINCODE_PATTERN = /^\d{6}$/;
export const MOBILE_PATTERN = /^\d{10}$/;

export function validatePincode(value) {
  return PINCODE_PATTERN.test(String(value ?? ""));
}

export function validateMobile(value) {
  return MOBILE_PATTERN.test(String(value ?? ""));
}
