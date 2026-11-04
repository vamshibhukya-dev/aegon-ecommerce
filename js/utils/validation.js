
/* =========================================================
   AEGON — Form Validation Utilities
   File: js/utils/validation.js

   Responsibilities:
   1. Validate required fields
   2. Validate email addresses
   3. Validate passwords
   4. Validate phone numbers
   5. Check password confirmation
   ========================================================= */

// 1. Check whether a value is empty.
export function isRequired(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim().length > 0
  );
}

// 2. Validate email format.
export function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
}

// 3. Validate password length.
// Minimum 8 characters; maximum 128 characters.
export function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128
  );
}

// 4. Validate a phone number.
// Accepts 10-digit Indian mobile numbers, optionally prefixed by +91.
export function isValidPhone(phone) {
  if (typeof phone !== "string") {
    return false;
  }

  const normalizedPhone = phone.trim();

  return /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(normalizedPhone);
}

// 5. Check whether two passwords match.
export function doPasswordsMatch(password, confirmPassword) {
  return (
    typeof password === "string" &&
    typeof confirmPassword === "string" &&
    password === confirmPassword
  );
}