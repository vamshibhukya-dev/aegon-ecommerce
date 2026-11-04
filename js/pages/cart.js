import { getProducts } from "../services/products.js";
import { formatPrice } from "../utils/format.js";
import { showNotification } from "../components/notification.js";
import { AegonStorage } from "../storage/storage.js";

/* ************************************************************************
                            AEGON — SHOPPING CART
   ************************************************************************ */
export async function initCartPage() {
  "use strict";

  // 1. SELECT ELEMENTS
  const page = document.querySelector(".cart-page");

  if (!page) return;

  const storage = AegonStorage;

  if (!storage?.getCart || !storage?.setQty || !storage?.removeFromCart) {
    console.error("AEGON: Cart storage is unavailable.");
    showNotification("Cart storage is unavailable.", "error");
    return;
  }

  const emptyCart = page.querySelector(".cart-empty");
  const cartLayout = page.querySelector("#cart-layout");
  const cartItemsList = page.querySelector("#cart-items-list");

  const summaryRows = page.querySelectorAll(".order-summary__row");
  const subtotalLabel = summaryRows[0]?.querySelector(".order-summary__label");
  const subtotalValue = summaryRows[0]?.querySelector(".order-summary__value");
  const discountValue = summaryRows[2]?.querySelector(".order-summary__value");
  const totalValue = page.querySelector(".order-summary__total-value");

  if (!cartItemsList || !cartLayout || !emptyCart) return;

  // 2. LOAD PRODUCT DATA

  let products = [];

  try {
    const result = await getProducts();

    if (!Array.isArray(result)) {
      throw new Error("Products API did not return an array.");
    }

    products = result;
  } catch (error) {
    console.error("AEGON: Could not load products.", error);
    showNotification("Could not load cart products.", "error");
    return;
  }

  // 3. HELPER FUNCTIONS
  function getProductName(product) {
    return String(product.name ?? product.title ?? "Product").replace(
      /(\d+)\s*-?\s*(kg|pk)\b/gi,
      "$1-$2",
    );
  }

  function getProductPrice(product) {
    const price = Number(product.price);
    return Number.isFinite(price) && price >= 0 ? price : 0;
  }

  function getOriginalPrice(product) {
    const originalPrice = Number(
      product.oldPrice ??
        product.originalPrice ??
        product.original_price ??
        product.price,
    );

    return Number.isFinite(originalPrice)
      ? Math.max(originalPrice, getProductPrice(product))
      : getProductPrice(product);
  }

  function getProductCategory(product) {
    return String(product.categoryLabel ?? product.category ?? "Groceries");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });
  }

  function getImageURL(product) {
    const imagePath = product.frontImage;

    if (!imagePath) return "";

    const fileName = String(imagePath).split("/").pop();

    return new URL(`../assets/images/${fileName}`, window.location.href).href;
  }

  function getCartProducts() {
    const cart = storage.getCart();

    return cart
      .map((item) => {
        const product = products.find(
          (product) => String(product.id) === String(item.id),
        );

        if (!product) return null;

        return {
          ...product,
          quantity: item.qty,
          currentPrice: getProductPrice(product),
          originalPrice: getOriginalPrice(product),
        };
      })
      .filter(Boolean);
  }

  // 4. RENDER A SINGLE CART ITEM
  function createCartItem(product) {
    const article = document.createElement("article");

    article.className = "cart-item";
    article.dataset.productId = product.id;

    const imageURL = getImageURL(product);
    const currentPrice = product.currentPrice;
    const originalPrice = product.originalPrice;
    const hasDiscount = originalPrice > currentPrice;

    article.innerHTML = `
    <div class="cart-item__image">
      ${
        imageURL
          ? `
            <img
              src="${escapeHTML(imageURL)}"
              alt="${escapeHTML(getProductName(product))}"
              loading="lazy"
            />
          `
          : ""
      }
    </div>

    <div class="cart-item__details">

      <p class="cart-item__category">
        ${escapeHTML(getProductCategory(product))}
      </p>

      <h3 class="cart-item__title">
        ${escapeHTML(getProductName(product))}
      </h3>

      <div
  class="quantity-stepper"
  role="group"
  aria-label="Quantity for ${escapeHTML(getProductName(product))}"
>
  <button
    class="quantity-stepper__button"
    type="button"
    aria-label="Decrease quantity"
    data-cart-action="decrease"
  >
    –
  </button>

  <span class="quantity-stepper__value" aria-live="polite">
    ${product.quantity}
  </span>

  <button
    class="quantity-stepper__button"
    type="button"
    aria-label="Increase quantity"
    data-cart-action="increase"
  >
    +
  </button>
</div>

    </div>

    <div class="cart-item__price">
      <strong>
        ${escapeHTML(formatPrice(currentPrice * product.quantity))}
      </strong>

      ${
        hasDiscount
          ? `<del>${escapeHTML(formatPrice(originalPrice * product.quantity))}</del>`
          : ""
      }
    </div>

    <button
      type="button"
      class="cart-item__remove"
      data-cart-action="remove"
      aria-label="Remove ${escapeHTML(getProductName(product))}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </svg>
    </button>
  `;

    return article;
  }

  // 5. UPDATE ORDER SUMMARY
  function updateSummary(cartProducts) {
    const itemCount = cartProducts.reduce(
      (total, product) => total + product.quantity,
      0,
    );

    const subtotal = cartProducts.reduce(
      (total, product) => total + product.currentPrice * product.quantity,
      0,
    );

    const discount = cartProducts.reduce(
      (total, product) =>
        total +
        (product.originalPrice - product.currentPrice) * product.quantity,
      0,
    );

    // Delivery is FREE in the existing HTML.
    // Current prices already include product discounts.
    if (subtotalLabel) {
      subtotalLabel.textContent = `Subtotal (${itemCount} ${
        itemCount === 1 ? "item" : "items"
      })`;
    }

    if (subtotalValue) {
      subtotalValue.textContent = formatPrice(subtotal);
    }

    if (discountValue) {
      discountValue.textContent = `-${formatPrice(discount)}`;
    }

    if (totalValue) {
      totalValue.textContent = formatPrice(subtotal);
    }
  }

  // 6. RENDER CART
  function renderCart() {
    const cartProducts = getCartProducts();

    const hasItems = cartProducts.length > 0;

    // Empty cart and cart layout visibility
    emptyCart.style.display = hasItems ? "none" : "flex";
    cartLayout.style.display = hasItems ? "grid" : "none";

    cartItemsList.replaceChildren();

    if (!hasItems) {
      updateSummary([]);
      return;
    }

    const fragment = document.createDocumentFragment();

    cartProducts.forEach((product) => {
      fragment.appendChild(createCartItem(product));
    });

    cartItemsList.appendChild(fragment);

    updateSummary(cartProducts);
  }

  // 7. HANDLE CART ITEM ACTIONS
  cartItemsList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-cart-action]");

    if (!actionButton) return;

    const cartItem = actionButton.closest(".cart-item");

    if (!cartItem) return;

    const productId = Number(cartItem.dataset.productId);

    if (!Number.isSafeInteger(productId)) return;

    const action = actionButton.dataset.cartAction;

    try {
      if (action === "increase") {
        const item = storage.getCart().find((item) => item.id === productId);

        if (item) {
          storage.setQty(productId, item.qty + 1);
        }
      }

      if (action === "decrease") {
        const item = storage.getCart().find((item) => item.id === productId);

        if (item && item.qty > 1) {
          storage.setQty(productId, item.qty - 1);
        }
      }

      if (action === "remove") {
        storage.removeFromCart(productId);

        showNotification("Product removed from cart.", "success");
      }

      renderCart();
    } catch (error) {
      console.error("AEGON: Cart update failed.", error);

      showNotification("Could not update your cart.", "error");
    }
  });

  // 8. LISTEN FOR CART UPDATES
  document.addEventListener("aegon:cart-updated", renderCart);
  document.addEventListener("cart:updated", renderCart);

  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === "cart") {
      renderCart();
    }
  });

  // 9. INITIAL RENDER
  renderCart();
}
