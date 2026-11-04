
/* =========================================================
   AEGON — HTML Escaping Utility
   File: js/utils/escape-html.js

   Purpose:
   Convert HTML-sensitive characters into safe text.
   ========================================================= */

export function escapeHTML(value) {
  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => htmlEntities[character]
  );
}
