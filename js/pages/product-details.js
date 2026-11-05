import { getProducts } from "../services/products.js";
import { formatPrice } from "../utils/format.js";
import { showNotification } from "../components/notification.js";

function getProductName(product) {
  const name = String(product.name ?? product.title ?? "Product");

  return name.replace(/(\d+)\s*-?\s*(kg|pk)\b/gi, "$1-$2");
}

function getProductPrice(product) {
  return Number(product.price);
}

function getProductOriginalPrice(product) {
  return Number(
    product.oldPrice ??
      product.originalPrice ??
      product.original_price ??
      product.price,
  );
}

function getProductReviewCount(product) {
  return (
    product.reviewCount ??
    product.reviewsCount ??
    product.reviews_count ??
    product.review_count ??
    0
  );
}

function getProductDiscount(product, price, originalPrice) {
  if (
    Number.isFinite(price) &&
    Number.isFinite(originalPrice) &&
    originalPrice > price &&
    originalPrice > 0
  ) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
}

export async function initProductDetails() {
  const page = document.querySelector(".product-details");

  // Run only on the product details page.
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const titleElement = page.querySelector("[data-product-title]");

  if (!productId || !titleElement) {
    if (titleElement) titleElement.textContent = "Product not found";
    showNotification("Please select a valid product.", "error");
    return;
  }

  let product;

  try {
    const products = await getProducts();

    if (!Array.isArray(products)) {
      throw new Error("Products API did not return an array.");
    }

    product = products.find((item) => String(item.id) === String(productId));
  } catch (error) {
    console.error("Failed to load product:", error);
    titleElement.textContent = "Unable to load product";
    showNotification("Could not load product details.", "error");
    return;
  }

  if (!product) {
    titleElement.textContent = "Product not found";
    showNotification("This product could not be found.", "error");
    return;
  }

  if (!product) {
    titleElement.textContent = "Product not found";
    showNotification("This product could not be found.", "error");
    return;
  }

  // Helper: safely update text.
  const setText = (selector, value) => {
    const element = page.querySelector(selector);

    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  };

  // Helper: resolve API image paths from the project root.

  const setImage = (selector, imagePath, fallbackFileName, altText) => {
    const image = page.querySelector(selector);

    if (!image) return;

    // Use API image path when available.
    // Otherwise, use the specific local fallback filename.
    const fileName = imagePath
      ? String(imagePath).split("/").pop()
      : fallbackFileName;

    if (!fileName) {
      image.hidden = true;
      image.removeAttribute("src");
      return;
    }

    const imageUrl = new URL(
      `../assets/images/${fileName}`,
      window.location.href,
    ).href;

    image.alt = altText || product.name || "Product";
    image.hidden = false;

    image.onerror = () => {
      image.hidden = true;
      image.removeAttribute("src");
      console.error("Image not found:", imageUrl);
    };

    console.log({
      productId: product.id,
      slug: product.slug,
      apiImage: imagePath,
      requestedImage: imageUrl,
    });

    image.src = imageUrl;
  };

  // Product information
  const name = getProductName(product);
  const category = product.categoryLabel ?? product.category ?? "Groceries";

  const description =
    product.description ?? "Quality products selected for your everyday needs.";

  setText("[data-product-title]", name);
  setText("[data-product-category]", category);
  setText("[data-product-description]", description);
  setText(
    "[data-product-long-description]",
    product.longDescription ?? description,
  );

  // Price values from the same API product.
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscount(product, price, originalPrice);

  if (Number.isFinite(price)) {
    setText("[data-product-price]", formatPrice(price));
  }

  const originalPriceElement = page.querySelector(
    "[data-product-original-price]",
  );

  const discountElement = page.querySelector("[data-product-discount]");

  if (
    Number.isFinite(price) &&
    Number.isFinite(originalPrice) &&
    originalPrice > price
  ) {
    setText("[data-product-original-price]", formatPrice(originalPrice));

    if (originalPriceElement) {
      originalPriceElement.hidden = false;
    }

    setText("[data-product-discount]", `Save ${discount}%`);

    if (discountElement) {
      discountElement.hidden = false;
    }
  } else {
    if (originalPriceElement) {
      originalPriceElement.hidden = true;
    }

    if (discountElement) {
      discountElement.hidden = true;
    }
  }

  // Rating and review count.
  const rating = Number(product.rating);
  const reviewCount = getProductReviewCount(product);

  if (Number.isFinite(rating)) {
    setText("[data-product-rating]", rating.toFixed(1));
  }

  setText("[data-product-reviews]", `(${reviewCount} reviews)`);

  // Update stars using the actual rating.
  const starsContainer = page.querySelector(".product-info__rating-stars");

  if (starsContainer && Number.isFinite(rating)) {
    const stars = starsContainer.querySelectorAll("span");
    const safeRating = Math.max(0, Math.min(5, rating));

    stars.forEach((star, index) => {
      const fill = Math.max(0, Math.min(100, (safeRating - index) * 100));

      star.style.backgroundImage = `linear-gradient(to right, #f5b301 ${fill}%, #cbd5e1 ${fill}%)`;
      star.style.backgroundClip = "text";
      star.style.webKitBackgroundClip = "text";
      star.style.color = "transparent";
    });

    starsContainer.setAttribute(
      "aria-label",
      `Rated ${safeRating.toFixed(1)} out of 5 stars`,
    );
  }

  // Images: use the actual API fields.
  // Front image
  // Front image
  setImage(
    "[data-product-image-front]",
    product.frontImage,
    `${product.slug}.jpg`,
    name,
  );

  // Back image
  setImage(
    "[data-product-image-back]",
    product.backImage,
    `${product.slug}-2.jpg`,
    `${name} alternate view`,
  );

  // Product features.
  const featuresList = page.querySelector("[data-product-features]");

  if (featuresList && Array.isArray(product.features)) {
    featuresList.replaceChildren();

    product.features.forEach((feature) => {
      const item = document.createElement("li");
      item.className = "product-info__features-item";

      // Create the same SVG tick icon as the HTML.
      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );

      icon.setAttribute("class", "product-info__features-icon");
      icon.setAttribute("width", "1em");
      icon.setAttribute("height", "1em");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");

      const backgroundPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      backgroundPath.setAttribute("d", "M0 0h24v24H0z");
      backgroundPath.setAttribute("fill", "none");

      const tickPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      tickPath.setAttribute(
        "d",
        "M18.03 7.97a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l3.47 3.47l6.47-6.47a.75.75 0 0 1 1.06 0",
      );
      tickPath.setAttribute("fill", "currentColor");
      tickPath.setAttribute("fill-rule", "evenodd");
      tickPath.setAttribute("clip-rule", "evenodd");

      icon.append(backgroundPath, tickPath);

      // Add the tick and feature text.
      item.append(icon, document.createTextNode(` ${feature}`));
      featuresList.appendChild(item);
    });
  }

  // Delivery information.
  if (product.deliveryMins != null) {
    setText(
      "[data-product-delivery]",
      `${product.deliveryMins}–${product.deliveryMins + 5} mins`,
    );
  }

  // Breadcrumbs.
  const currentBreadcrumb = page.querySelector('[aria-current="page"]');

  if (currentBreadcrumb) {
    currentBreadcrumb.textContent = name;
  }

  const categoryBreadcrumb = page.querySelector(
    ".product-details__breadcrumb-list li:nth-child(3) a",
  );

  if (categoryBreadcrumb) {
    categoryBreadcrumb.textContent = category;
    categoryBreadcrumb.href = `../pages/products.html#${String(
      product.category || category,
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
  }

  // Product quantity.
  let quantity = 1;

  const quantityValue = page.querySelector("[data-quantity-value]");
  const decreaseButton = page.querySelector("[data-quantity-decrease]");
  const increaseButton = page.querySelector("[data-quantity-increase]");

  const updateQuantity = () => {
    if (quantityValue) quantityValue.textContent = String(quantity);
    if (decreaseButton) decreaseButton.disabled = quantity <= 1;
  };

  decreaseButton?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateQuantity();
  });

  increaseButton?.addEventListener("click", () => {
    quantity += 1;
    updateQuantity();
  });

  updateQuantity();

  // Existing cart and wishlist storage.
  const storage = window.AegonStorage;
  const wishlistInput = page.querySelector('[data-action="wishlist"]');

  if (wishlistInput && storage?.isWishlisted) {
    wishlistInput.checked = storage.isWishlisted(product.id);
  }

  wishlistInput?.addEventListener("change", () => {
    if (!storage?.toggleWishlist) {
      showNotification("Wishlist storage is not connected yet.", "error");
      wishlistInput.checked = false;
      return;
    }

    storage.toggleWishlist(product.id);

    showNotification(
      wishlistInput.checked ? "Added to wishlist." : "Removed from wishlist.",
      "success",
    );
  });

  const addToCart = () => {
    if (!storage?.addToCart) {
      showNotification("Cart storage is not connected yet.", "error");
      return false;
    }

    storage.addToCart(product.id, quantity);

    showNotification(`${name} added to cart.`, "success");
    document.dispatchEvent(new CustomEvent("cart:updated"));

    return true;
  };

  page
    .querySelector('[data-action="add-to-cart"]')
    ?.addEventListener("click", addToCart);

  page
    .querySelector('[data-action="buy-now"]')
    ?.addEventListener("click", () => {
      if (addToCart()) {
        window.location.href = "../pages/cart.html";
      }
    });

  // Additional product specifications.
  setText("[data-product-weight]", product.weight);
  setText("[data-product-contents]", product.contents);
  setText("[data-product-shelf-life]", product.shelfLife ?? product.shelf_life);
  setText("[data-product-origin]", product.origin);
  setText("[data-product-packaging]", product.packaging);
  setText(
    "[data-product-storage]",
    product.storageInstructions ?? product.storage,
  );
}
