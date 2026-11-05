/* =========================================================
   AEGON — Formatting Utilities
   File: js/utils/format.js

   Responsibilities:
   1. Format prices consistently
   2. Format numbers for display
   ========================================================= */

// Format a price using the AEGON website's USD currency.
export function formatPrice(amount) {
  const price = Number(amount);

  if (!Number.isFinite(price)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// Format a number using commas where appropriate.
export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(number);
}
