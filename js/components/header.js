/* **********************************************************
   AEGON — Header Component
   File: js/components/header.js

   Responsibilities:
   * Update and hide cart badges
   * Display signed-in user information
   * Handle logout
   * Handle Add to Cart clicks
   * Handle wishlist changes
   * Restore saved wishlist selections

   Account dropdown open/close handling is intentionally excluded, as requested.
   ******************************************************** */

import { AegonStorage } from "../storage/storage.js";
import { escapeHTML } from "../utils/escape-html.js";
import { showNotification } from "./notification.js";

// Prevent duplicate event listeners if initialization is
// accidentally called more than once on the same page.
let isInitialized = false;

// 1. PAGE-AWARE LINKS
function getPageLink(fileName) {
  const isInsidePagesFolder = window.location.pathname
    .split("/")
    .includes("pages");

  return isInsidePagesFolder ? `../${fileName}` : `./${fileName}`;
}

// 2. UPDATE CART BADGES
export function updateCartBadges() {
  const count = AegonStorage.getCartCount();

  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
  });
}
// UPDATE WISHLIST BADGES
export function updateWishlistBadges() {
  const count = AegonStorage.getWishlist().length;

  document.querySelectorAll("[data-wishlist-count]").forEach((badge) => {
    badge.textContent = String(count);
  });
}

// 3. UPDATE ACCOUNT MENU FOR SIGNED-IN USERS
export function updateAccountMenu() {
  const user = AegonStorage.getCurrentUser();
  const panel = document.querySelector("[data-account-panel]");

  if (!panel || !user) return;

  // Logged-in user
  const name = escapeHTML(user.name || "Customer");
  const email = escapeHTML(user.email || "Email unavailable");
  const phone = escapeHTML(user.phone || "Not provided");

  const initial = escapeHTML(
    (user.name || user.email || "C").trim().charAt(0).toUpperCase(),
  );

  panel.innerHTML = `
    <div class="account-menu__profile">

      <div class="account-menu__header">
        <span class="account-menu__eyebrow">AEGON ACCOUNT</span>

        <span class="account-menu__status">
          <span class="account-menu__status-dot"></span>
          ACTIVE
        </span>
      </div>

      <div class="account-menu__identity">
        <div class="account-menu__avatar" aria-hidden="true">
          ${initial}
        </div>

        <div class="account-menu__identity-details">
          <h3>${name}</h3>
          <p>${email}</p>
        </div>
      </div>

      <div class="account-menu__details">
        <span class="account-menu__section-label">
          PERSONAL INFORMATION
        </span>

        <div class="account-menu__detail-row">
          <span>Name</span>
          <strong>${name}</strong>
        </div>

        <div class="account-menu__detail-row">
          <span>Email</span>
          <strong>${email}</strong>
        </div>

        <div class="account-menu__detail-row">
          <span>Phone</span>
          <strong>${phone}</strong>
        </div>
      </div>

      <nav class="account-menu__navigation" aria-label="Account navigation">
        <a href="${getPageLink("../pages/cart.html")}"
           class="account-menu__nav-link">
          <span class="account-menu__nav-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <g fill="none" stroke="currentColor">
                  <circle cx="10" cy="19" r="1.5" />
                  <circle cx="17" cy="19" r="1.5" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.5 4h2l3.504 11H17"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.224 12.5L6.3 6.5h12.507a.5.5 0 0 1 .475.658l-1.667 5a.5.5 0 0 1-.474.342z"
                  />
                </g>
              </svg>
          </span>
          <span>My Cart</span>
          <span class="account-menu__arrow">›</span>
        </a>

        <a href="${getPageLink("../pages/wishlist.html")}"
           class="account-menu__nav-link">
          <span class="account-menu__nav-icon">
              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M3.25 10.03c0-2.7 2.37-4.78 5.15-4.78c1.433 0 2.695.672 3.6 1.542c.905-.87 2.166-1.542 3.6-1.542c2.78 0 5.15 2.08 5.15 4.78c0 1.85-.789 3.476-1.882 4.852c-1.09 1.372-2.518 2.537-3.884 3.484c-.523.362-1.05.695-1.534.941c-.453.231-.975.443-1.45.443s-.996-.212-1.45-.443a14 14 0 0 1-1.533-.941c-1.367-.947-2.794-2.112-3.885-3.484C4.039 13.506 3.25 11.88 3.25 10.03M8.4 6.75c-2.08 0-3.65 1.53-3.65 3.28c0 1.403.596 2.71 1.556 3.918c.962 1.21 2.257 2.279 3.565 3.185c.495.343.96.634 1.36.838c.428.218.676.279.769.279s.341-.061.77-.28a12 12 0 0 0 1.36-.837c1.307-.906 2.602-1.974 3.564-3.185c.96-1.208 1.556-2.515 1.556-3.918c0-1.75-1.57-3.28-3.65-3.28c-1.194 0-2.31.713-3.005 1.619a.75.75 0 0 1-1.19 0C10.71 7.463 9.595 6.75 8.4 6.75"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span>My Wishlist</span>
          <span class="account-menu__arrow">›</span>
        </a>
      </nav>

      <button type="button"
              class="account-menu__logout"
              data-logout-btn>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg"
             width="1em"
             height="1em"
             viewBox="0 0 24 24">
         <path d="M0 0h24v24H0z" fill="none" />

           <g fill="currentColor"
           stroke="currentColor"
           stroke-width="0.6"
           stroke-linecap="round"
           stroke-linejoin="round">

           <path d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4C12.75 4.41421 12.4142 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25C12.4142 19.25 12.75 19.5858 12.75 20C12.75 20.4142 12.4142 20.75 12 20.75C7.16751 20.75 3.25 16.8325 3.25 12C3.25 7.16751 7.16751 3.25 12 3.25Z" />

           <path d="M16.4697 9.53033C16.1768 9.23744 16.1768 8.76256 16.4697 8.46967C16.7626 8.17678 17.2374 8.17678 17.5303 8.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L17.5303 15.5303C17.2374 15.8232 16.7626 15.8232 16.4697 15.5303C16.1768 15.2374 16.1768 14.7626 16.4697 14.4697L18.1893 12.75H10C9.58579 12.75 9.25 12.4142 9.25 12C9.25 11.5858 9.58579 11.25 10 11.25H18.1893L16.4697 9.53033Z" />

            </g>
        </svg>
      </span>
        Logout
      </button>

      <p class="account-menu__footer">
        Your account, your shopping experience.
      </p>

    </div>
  `;
}

// 4. HANDLE LOGOUT
function handleLogout(event) {
  const logoutButton = event.target.closest("[data-logout-btn]");

  if (!logoutButton) {
    return;
  }

  AegonStorage.logout();

  window.location.href = getPageLink("index.html");
}

// 5. HANDLE ADD TO CART
function handleAddToCart(event) {
  const addButton = event.target.closest("[data-add-to-cart]");

  if (!addButton) {
    return;
  }

  const productId = Number(addButton.dataset.addToCart);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    showNotification("Invalid product. Please try again.", "error");
    return;
  }

  try {
    AegonStorage.addToCart(productId, 1);

    showNotification("Product added to cart!", "success");

    // Show a short visual confirmation on the clicked button.
    const originalContent = addButton.innerHTML;
    addButton.textContent = "Added";
    addButton.disabled = true;

    setTimeout(() => {
      if (!addButton.isConnected) {
        return;
      }

      addButton.innerHTML = originalContent;
      addButton.disabled = false;
    }, 1200);
  } catch (error) {
    console.error("AEGON: Could not add product to cart.", error);
    showNotification("Could not add product to cart.", "error");
  }
}

// 6. HANDLE WISHLIST CHANGES
function handleWishlistChange(event) {
  const wishlistToggle = event.target.closest("[data-wishlist-toggle]");

  if (!wishlistToggle) {
    return;
  }

  const productId = Number(wishlistToggle.dataset.wishlistToggle);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    showNotification("Invalid product. Please try again.", "error");
    return;
  }

  try {
    const wishlist = AegonStorage.toggleWishlist(productId);
    const isSaved = wishlist.includes(productId);

    showNotification(
      isSaved ? "Added to wishlist!" : "Removed from wishlist.",
      "success",
    );
  } catch (error) {
    console.error("AEGON: Could not update wishlist.", error);
    showNotification("Could not update wishlist.", "error");
  }
}

// 7. RESTORE SAVED WISHLIST SELECTIONS
export function restoreWishlistSelections() {
  document.querySelectorAll("[data-wishlist-toggle]").forEach((element) => {
    const productId = Number(element.dataset.wishlistToggle);

    if (!Number.isSafeInteger(productId) || productId < 1) {
      return;
    }

    const isSaved = AegonStorage.isWishlisted(productId);

    if (element instanceof HTMLInputElement) {
      element.checked = isSaved;
    }

    element.setAttribute("aria-pressed", String(isSaved));
  });
}

// 8. INITIALIZE HEADER AND SHARED PRODUCT ACTIONS
export function initHeader() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  // Initial state.
  updateCartBadges();
  updateWishlistBadges();
  updateAccountMenu();
  restoreWishlistSelections();

  // Keep the badges updated when storage.js dispatches
  // the aegon:cart-updated event.
  document.addEventListener("aegon:cart-updated", updateCartBadges);

  // the aegon:wishlist-updated event.
  document.addEventListener("aegon:wishlist-updated", updateWishlistBadges);

  // Update account information after login/logout changes.
  document.addEventListener("aegon:auth-updated", updateAccountMenu);

  // Delegated events also work for product cards rendered later.
  document.addEventListener("click", handleAddToCart);
  document.addEventListener("click", handleLogout);
  document.addEventListener("change", handleWishlistChange);
}
