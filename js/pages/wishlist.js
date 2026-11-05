import { AegonStorage } from "../storage/storage.js";
import { showNotification } from "../components/notification.js";

// 1. API CONFIGURATION
const AEGON_API_BASE = "https://ageon-api.vercel.app";

// 2. PAGE INITIALIZATION
export async function initWishlistPage() {
  "use strict";

  const wishlistGrid = document.querySelector("#wishlist-grid");
  const emptyState = document.querySelector("#wishlist-empty");
  const wishlistCount = document.querySelector("#wishlist-count");
  const wishlistCountLabel = document.querySelector("#wishlist-count-label");
  const resultCount = document.querySelector("#wishlist-result-count");
  const clearButton = document.querySelector("#wishlist-clear");

  if (!wishlistGrid) return;

  let products = [];
  let isClearing = false;

  // 3. FETCH PRODUCT CATALOGUE
  async function getProducts() {
    try {
      const response = await fetch(`${AEGON_API_BASE}/products?limit=100`);

      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = await response.json();

      return Array.isArray(data.products) ? data.products : [];
    } catch (error) {
      console.error("AEGON: Product loading failed.", error);

      showNotification("Could not load wishlist products.", "error");

      return [];
    }
  }

  // 4. GET WISHLIST PRODUCTS
  function getWishlistProducts() {
    const wishlistIds = AegonStorage.getWishlist();

    return wishlistIds
      .map((id) =>
        products.find((product) => Number(product.id) === Number(id)),
      )
      .filter(Boolean);
  }

  // 5. FORMAT PRICE
  function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price) || 0);
  }

  // 6. CREATE WISHLIST PRODUCT CARD
  function createWishlistCard(product) {
    const article = document.createElement("article");

    article.className = "product-card";
    article.dataset.cat = product.category || "";
    article.dataset.productId = product.id;

    const name = product.name || "Unnamed Product";
    const category = product.categoryLabel || "Fresh Products";

    const currentPrice = Number(product.price) || 0;
    const originalPrice = Number(product.oldPrice) || currentPrice;

    const hasDiscount = originalPrice > currentPrice;

    const discountPercentage = hasDiscount
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    const imageURL = product.frontImage || "";

    const rating = Number(product.rating) || 0;
    const reviewCount = Number(product.reviewCount) || 0;

    const safeName = name.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );

    const safeCategory = category.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );

    const imageFileName = imageURL.split("/").pop();

    const localImageURL = imageFileName
      ? `../assets/images/${encodeURIComponent(imageFileName)}`
      : "";

    article.innerHTML = `
      <div class="product-card__media product-card__media--flip">

        ${
          product.badge
            ? `
              <span class="badge badge--accent product-card__badge">
                ${product.badge}
              </span>
            `
            : ""
        }

        <!-- Remove from Wishlist -->

        <button
          type="button"
          class="wishlist-remove-btn"
          data-wishlist-remove="${product.id}"
          aria-label="Remove ${safeName} from wishlist"
          title="Remove from wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        </button>

        <div class="product-card__media-inner">

          <div class="product-card__media-face product-card__media-face--front">

            ${
              localImageURL
                ? `
                  <img
                    src="${localImageURL}"
                    alt="${safeName}"
                    width="400"
                    height="400"
                    loading="lazy"
                  />
                `
                : ""
            }

          </div>

          <div class="product-card__media-face product-card__media-face--back">
            ${
              product.backImage
                ? `
                  <img
                    src="../assets/images/${encodeURIComponent(
                      String(product.backImage).split("/").pop(),
                    )}"
                    alt="${safeName} - Alternate View"
                    width="400"
                    height="400"
                    loading="lazy"
                  />
                `
                : ""
            }
          </div>

        </div>
      </div>

      <div class="product-card__body">

        <span class="product-card__category">
          ${safeCategory}
        </span>

        <h3 class="product-card__title">
          ${safeName}
        </h3>

        <p class="product-card__desc">
          ${safeCategory}
        </p>

        <div class="product-card__rating">
          <svg
            class="icon--filled"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/>
          </svg>

          ${rating.toFixed(1)}
          <span>(${reviewCount})</span>
        </div>

        <div class="product-card__price-row">

          <span class="product-card__price">
            ${formatPrice(currentPrice)}
          </span>

          ${
            hasDiscount
              ? `
                <span class="product-card__price-old">
                  ${formatPrice(originalPrice)}
                </span>

                <span class="product-card__discount">
                  Save ${discountPercentage}%
                </span>
              `
              : ""
          }

        </div>

        <div class="product-card__delivery">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="8.5"
              stroke="currentColor"
              stroke-width="1.8"
            />

            <path
              d="M12 7.5V12L15 14"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span>Delivery in 10 minutes</span>
        </div>

      </div>

      <div class="product-card__footer">

        <button
          type="button"
          class="product-card__add-btn"
          data-add-to-cart="${product.id}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="19" r="1.5" />
            <circle cx="17" cy="19" r="1.5" />
            <path d="M3.5 4h2l3.5 11H17" />
            <path d="M8.2 12.5 6.3 6.5h12.5l-1.7 6z" />
          </svg>

          Add to Cart
        </button>

      </div>
    `;

    // Handle missing product images.

    article.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        image.remove();
      });
    });

    // remove
    const removeButton = article.querySelector(".wishlist-remove-btn");

    Object.assign(removeButton.style, {
      position: "absolute",
      top: "8px",
      right: "8px",
      zIndex: "1",
      width: "34px",
      height: "34px",
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-full)",
      background: "hsla(0, 0%, 100%, 0.85)",
      backdropFilter: "blur(4px)",
      color: "var(--color-gray-600)",
    });

    removeButton.addEventListener("mouseenter", () => {
      removeButton.style.background = "#fee2e2";
      removeButton.style.color = "#dc2626";
    });

    removeButton.addEventListener("mouseleave", () => {
      removeButton.style.background = "hsla(0, 0%, 100%, 0.85)";
      removeButton.style.color = "var(--color-gray-600)";
    });

    return article;
  }

  // =======================================================
  // 7. UPDATE WISHLIST COUNTS
  // =======================================================

  function updateWishlistCount(count) {
    if (wishlistCount) {
      wishlistCount.textContent = String(count);
    }

    if (wishlistCountLabel) {
      wishlistCountLabel.textContent =
        count === 1 ? "saved item" : "saved items";
    }

    if (resultCount) {
      resultCount.textContent = `${count} ${count === 1 ? "product" : "products"}`;
    }

    if (clearButton) {
      clearButton.hidden = count === 0;
    }
  }

  // =======================================================
  // 8. RENDER WISHLIST
  // =======================================================

  function renderWishlist() {
    if (isClearing) return;

    const wishlistProducts = getWishlistProducts();

    wishlistGrid.replaceChildren();

    updateWishlistCount(wishlistProducts.length);

    const isEmpty = wishlistProducts.length === 0;

    if (emptyState) {
      emptyState.hidden = !isEmpty;
    }

    wishlistGrid.hidden = isEmpty;

    if (isEmpty) return;

    wishlistProducts.forEach((product) => {
      wishlistGrid.appendChild(createWishlistCard(product));
    });
  }

  // =======================================================
  // 9. REMOVE PRODUCT FROM WISHLIST
  // =======================================================

  function handleWishlistRemove(event) {
    const button = event.target.closest("[data-wishlist-remove]");

    if (!button || !wishlistGrid.contains(button)) {
      return;
    }

    const productId = Number(button.dataset.wishlistRemove);

    if (!Number.isSafeInteger(productId) || productId < 1) {
      return;
    }

    try {
      AegonStorage.toggleWishlist(productId);

      renderWishlist();

      showNotification("Removed from wishlist.", "success");
    } catch (error) {
      console.error("AEGON: Could not remove wishlist product.", error);

      showNotification("Could not update wishlist.", "error");
    }
  }

  // =======================================================
  // 10. ADD PRODUCT TO CART
  // =======================================================

  function handleAddToCart(event) {
    const button = event.target.closest("[data-add-to-cart]");

    if (!button || !wishlistGrid.contains(button)) {
      return;
    }

    const productId = Number(button.dataset.addToCart);

    if (!Number.isSafeInteger(productId) || productId < 1) {
      return;
    }

    try {
      AegonStorage.addToCart(productId, 1);

      showNotification("Product added to cart!", "success");
    } catch (error) {
      console.error("AEGON: Could not add wishlist product to cart.", error);

      showNotification("Could not add product to cart.", "error");
    }
  }

  // =======================================================
  // 11. CLEAR ENTIRE WISHLIST
  // =======================================================

  function handleClearWishlist() {
    const wishlistIds = [...AegonStorage.getWishlist()];

    try {
      isClearing = true;

      wishlistIds.forEach((id) => {
        AegonStorage.toggleWishlist(id);
      });

      isClearing = false;

      renderWishlist();

      showNotification("Wishlist cleared.", "success");
    } catch (error) {
      isClearing = false;

      console.error("AEGON: Could not clear wishlist.", error);

      renderWishlist();

      showNotification("Could not clear wishlist.", "error");
    }
  }

  // =======================================================
  // 12. LISTEN FOR WISHLIST CHANGES
  // =======================================================

  document.addEventListener("aegon:wishlist-updated", renderWishlist);

  // =======================================================
  // 13. EVENT LISTENERS
  // =======================================================

  wishlistGrid.addEventListener("click", handleWishlistRemove);

  wishlistGrid.addEventListener("click", handleAddToCart);

  clearButton?.addEventListener("click", handleClearWishlist);

  // =======================================================
  // 14. INITIAL LOAD
  // =======================================================

  wishlistGrid.setAttribute("aria-busy", "true");

  products = await getProducts();

  renderWishlist();

  wishlistGrid.setAttribute("aria-busy", "false");
}
