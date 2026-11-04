import { getProducts } from "../services/products.js";
import { formatPrice } from "../utils/format.js";

const HOME_SECTIONS = [
  { id: "offers", type: "offers" },
  { id: "popular", type: "popular" },
  { id: "flash-sale", type: "flash" },
];

function getProductName(product) {
  return String(product.name ?? product.title ?? "Product");
}

function getProductImage(product) {
  return (
    product.image ??
    product.thumbnail ??
    product.imageUrl ??
    product.frontImage ??
    ""
  );
}

function getProductId(product) {
  return String(product.id);
}

function getDiscount(product) {
  return Number(
    product.discountPct ??
    product.discountPercentage ??
    product.discount ??
    0
  );
}

function getOriginalPrice(product) {
  return Number(
    product.oldPrice ??
    product.originalPrice ??
    product.original_price ??
    product.price
  );
}

function updateText(card, selectors, value) {
  const element = card.querySelector(selectors);

  if (element && value !== undefined && value !== null) {
    element.textContent = String(value);
  }
}

function updateExistingCard(card, product) {
  const name = getProductName(product);
  const price = Number(product.price);
  const originalPrice = getOriginalPrice(product);
  const discount = getDiscount(product);
  const rating = product.rating;
  const reviewCount =
    product.reviewCount ??
    product.reviewsCount ??
    product.reviews_count;

  // Keep the card connected to its actual product.
  card.dataset.productId = getProductId(product);

  // Product name.
  updateText(
    card,
    ".product-card__title, .product-card__name, [data-product-name]",
    name
  );

  // Current price.
  if (Number.isFinite(price)) {
    updateText(
      card,
      ".product-card__price, [data-product-price]",
      formatPrice(price)
    );
  }

  // Original price.
  const oldPriceElement = card.querySelector(
    ".product-card__price-old"
  );

  if (oldPriceElement) {
    if (
      Number.isFinite(originalPrice) &&
      Number.isFinite(price) &&
      originalPrice > price
    ) {
      oldPriceElement.textContent = formatPrice(originalPrice);
      oldPriceElement.hidden = false;
    } else {
      oldPriceElement.hidden = true;
    }
  }

  // Discount percentage.
  const discountElement = card.querySelector(
    ".product-card__discount"
  );

  if (discountElement) {
    if (
      Number.isFinite(originalPrice) &&
      Number.isFinite(price) &&
      originalPrice > price
    ) {
      const calculatedDiscount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );

      discountElement.textContent = `Save ${calculatedDiscount}%`;
      discountElement.hidden = false;
    } else if (discountElement.classList.contains("product-card__discount")) {
      discountElement.hidden = true;
    }
  }

  // Rating.
  const ratingElement = card.querySelector(
    ".product-card__rating"
  );

  if (ratingElement && rating !== undefined && rating !== null) {
    const ratingNumber = Number(rating);

    if (Number.isFinite(ratingNumber)) {
      const ratingText = [...ratingElement.childNodes].find(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim() !== ""
      );

      if (ratingText) {
        ratingText.textContent = ` ${ratingNumber.toFixed(1)} `;
      }
    }
  }

  // Review count.
  const reviewsElement = card.querySelector(
    ".product-card__rating span"
  );

  if (
    reviewsElement &&
    reviewCount !== undefined &&
    reviewCount !== null
  ) {
    reviewsElement.textContent = `(${reviewCount})`;
  }

  // Product image.
  const imageElement = card.querySelector(
    ".product-card__image, .product-card__media img, img[data-product-image]"
  );

  if (imageElement && getProductImage(product)) {
    const imagePath = getProductImage(product);
    const fileName = String(imagePath).split("/").pop();

    // The existing homepage images are stored in assets/images/.
    const localImage = new URL(
      `./assets/images/${fileName}`,
      window.location.origin + window.location.pathname.replace(/[^/]*$/, "")
    ).href;

    imageElement.onerror = () => {
      imageElement.onerror = null;
      console.warn(`Product image not found: ${localImage}`);
    };

    imageElement.src = localImage;
    imageElement.alt = name;
  }

  // Update product detail links.
  const detailLink = card.querySelector(
    ".product-card__quickview, .product-card__quickview-btn"
  );

  if (detailLink) {
    detailLink.href =
      `./pages/product-details.html?id=${encodeURIComponent(product.id)}`;

    detailLink.setAttribute("aria-label", `View ${name}`);
  }

  // Keep Add to Cart and wishlist controls intact.
}

function getSectionProducts(products, type) {
  const discountedProducts = products.filter((product) => {
    const price = Number(product.price);
    const oldPrice = getOriginalPrice(product);

    return (
      Number.isFinite(price) &&
      Number.isFinite(oldPrice) &&
      oldPrice > price
    );
  });

  if (type === "offers" || type === "flash") {
    return discountedProducts.slice(0, 4);
  }

  return [...products]
    .sort(
      (a, b) =>
        Number(b.popularity ?? b.rating ?? 0) -
        Number(a.popularity ?? a.rating ?? 0)
    )
    .slice(0, 4);
}

function renderSection(section, products) {
  const root = document.getElementById(section.id);
  if (!root) return;

  const grid = root.querySelector(".product-grid");
  if (!grid) return;

  // Create a lookup using every API product's ID.
  const productsById = new Map(
    products.map((product) => [
      String(product.id),
      product,
    ])
  );

  // Update only the existing HTML cards with matching IDs.
  const existingCards = grid.querySelectorAll(
    "[data-product-id]"
  );

  existingCards.forEach((card) => {
    const product = productsById.get(
      card.dataset.productId
    );

    if (!product) return;

    updateExistingCard(card, product);
  });
}

export async function initHomePage() {
  console.log("HOME.JS FILE LOADED");
  const isHomePage = HOME_SECTIONS.some(({ id }) =>
    document.getElementById(id)
  );


  if (!isHomePage) return;

  try {
    const products = await getProducts();
    console.log("PRODUCTS CHECK");
console.log("Products loaded:", products.length);

console.log(
  "Brown Buns product:",
  products.find((product) => String(product.id) === "31")
);

    if (!Array.isArray(products) || products.length === 0) {
      return;
    }

    HOME_SECTIONS.forEach((section) => {
      renderSection(section, products);
    });
  } catch (error) {
    console.error(
      "Homepage products could not be loaded:",
      error
    );
  }
}
