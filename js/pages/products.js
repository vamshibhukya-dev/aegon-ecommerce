export function initProductsPage() {
  "use strict";

  // 1. SELECT EXISTING HTML ELEMENTS
  const productsShowcase = document.querySelector(".products-showcase");

  if (!productsShowcase) return;

  const productGrid = productsShowcase.querySelector(".product-grid");

  if (!productGrid) return;

  const categoryButtons = document.querySelectorAll(".category-filter");
  const searchInput = document.querySelector("#site-search");
  const searchForm = searchInput?.closest("form");
  const sortSelect = document.querySelector(".sort-select select");
  const showcaseContent = productsShowcase.querySelector(
    ".products-showcase__content",
  );

  const heading = showcaseContent?.querySelector("h2");
  const resultsText = showcaseContent?.querySelector("p");

  // 2. CATEGORY LABELS
  const categories = {
    all: "All Products",
    vegetables: "Vegetables",
    fruits: "Fruits",
    groceries: "Groceries",
    dairy: "Dairy",
    bakery: "Bakery",
    snacks: "Snacks",
    beverages: "Beverages",
    "frozen-foods": "Frozen Foods",
    "personal-care": "Personal Care",
    household: "Household",
  };

  // READ CATEGORY FROM URL
  function getCategoryFromURL() {
    const category = window.location.hash.slice(1).toLowerCase();

    return Object.hasOwn(categories, category) ? category : "all";
  }

  // 3. KEEP REFERENCES TO ORIGINAL HTML CARDS
  const productCards = Array.from(
    productGrid.querySelectorAll(".product-card"),
  );

  const originalOrder = new Map(
    productCards.map((card, index) => [card, index]),
  );

  const sectionHeadings = Array.from(
    productGrid.querySelectorAll(".products-grid__header, h3[data-section]"),
  );

  const PRODUCTS_PER_PAGE = 12;

  // 4. APPLICATION STATE
  const state = {
    category: getCategoryFromURL(),
    search: "",
    sort: "default",
    page: 1,
  };

  // 5. CREATE PAGINATION UI
  const pagination = document.createElement("nav");
  pagination.className = "aegon-pagination";
  pagination.setAttribute("aria-label", "Product pagination");

  pagination.innerHTML = `
    <p class="aegon-pagination__summary" aria-live="polite"></p>

    <div class="aegon-pagination__controls">
      <button
        class="aegon-pagination__arrow aegon-pagination__previous"
        type="button"
        aria-label="Previous page"
      >
        <span aria-hidden="true">‹</span>
        <span>Previous</span>
      </button>

      <div class="aegon-pagination__pages" aria-label="Page numbers"></div>

      <button
        class="aegon-pagination__arrow aegon-pagination__next"
        type="button"
        aria-label="Next page"
      >
        <span>Next</span>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  `;

  productGrid.insertAdjacentElement("afterend", pagination);

  const pageSummary = pagination.querySelector(".aegon-pagination__summary");

  const pageNumbers = pagination.querySelector(".aegon-pagination__pages");

  const previousButton = pagination.querySelector(
    ".aegon-pagination__previous",
  );

  const nextButton = pagination.querySelector(".aegon-pagination__next");

  // 6. PREMIUM PAGINATION STYLES
  const paginationStyles = document.createElement("style");

  paginationStyles.textContent = `
    
.aegon-pagination {
  box-sizing: border-box;
  width: min(900px, calc(100% - 32px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin: var(--space-2xl) auto 12px;
  padding: 22px 26px;
  border: 1px solid var(--color-border-default);
  border-radius: 18px;
  background: var(--color-surface-card);
  box-shadow: var(--shadow-lg);
}

.aegon-pagination__summary {
  margin: 0;
  color: #a1b0a8;
  font-size: 14px;
  font-weight: 500;
}

.aegon-pagination__controls,
.aegon-pagination__pages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.aegon-pagination button {
  font: inherit;
  cursor: pointer;
  transition: all .22s ease;
}

.aegon-pagination__arrow,
.aegon-pagination__page {
  height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid #344b40;
  border-radius: 11px;
  background: #20352c;
  color: #d5e1d9;
  font-size: 14px;
  font-weight: 600;
}

.aegon-pagination__page {
  width: 44px;
  padding: 0;
}

.aegon-pagination__arrow:hover:not(:disabled),
.aegon-pagination__page:hover:not(.is-active) {
  background: #294638;
  border-color: #438263;
  color: #ffffff;
  transform: translateY(-2px);
}

.aegon-pagination__page.is-active {
  background: #168653;
  border-color: #168653;
  color: #ffffff;
  box-shadow: 0 5px 16px rgba(22, 134, 83, .25);
}

.aegon-pagination button:focus-visible {
  outline: 3px solid rgba(76, 190, 133, .35);
  outline-offset: 3px;
}

.aegon-pagination button:disabled {
  cursor: not-allowed;
  opacity: .35;
}

.aegon-pagination__ellipsis {
  padding: 0 4px;
  color: #91a49a;
  font-size: 14px;
}

.aegon-pagination[hidden] {
  display: none;
}

@media (max-width: 640px) {
  .aegon-pagination {
    justify-content: center;
    padding: 18px 12px;
  }

  .aegon-pagination__summary {
    width: 100%;
    text-align: center;
  }

  .aegon-pagination__controls {
    width: 100%;
    gap: 6px;
  }

  .aegon-pagination__arrow {
    padding: 0 9px;
  }

  .aegon-pagination__pages {
    gap: 6px;
  }

  .aegon-pagination__page {
    width: 40px;
    min-width: 40px;
    height: 38px;
  }

  .aegon-pagination__arrow {
    height: 38px;
    font-size: 12px;
  }
}


@media (max-width: 480px) {
  .aegon-pagination {
    box-sizing: border-box;
    width: calc(100% - 32px);
    margin: 28px auto 12px;
    padding: 16px 8px;
    justify-content: center;
    gap: 14px;
    overflow: hidden;
  }

  .aegon-pagination__summary {
    width: 100%;
    text-align: center;
    font-size: 13px;
  }

  .aegon-pagination__controls {
    width: 100%;
    justify-content: center;
    gap: 5px;
  }

  .aegon-pagination__pages {
    gap: 3px;
  }

  .aegon-pagination__arrow {
    width: 34px;
    min-width: 34px;
    height: 36px;
    padding: 0;
    gap: 0;
    font-size: 17px;
  }

  .aegon-pagination__previous span:last-child,
  .aegon-pagination__next span:first-child {
    display: none;
  }

  .aegon-pagination__page {
    width: 30px;
    min-width: 30px;
    height: 36px;
    padding: 0;
    font-size: 13px;
  }

  .aegon-pagination__ellipsis {
    padding: 0 2px;
  }
}


  `;

  document.head.appendChild(paginationStyles);

  // 7. HELPER FUNCTIONS
  function getProductName(card) {
    return card.querySelector(".product-card__title")?.textContent.trim() || "";
  }

  function getProductPrice(card) {
    const text = card.querySelector(".product-card__price")?.textContent || "";

    const price = Number(text.replace(/[^\d.]/g, ""));

    return Number.isFinite(price) ? price : 0;
  }

  function getCategoryFromButton(button) {
    const label = button.textContent.trim().toLowerCase();

    if (label === "all") return "all";

    return Object.keys(categories).find(
      (category) => categories[category].toLowerCase() === label,
    );
  }

  // 8. FILTERING + SEARCH
  function getFilteredProducts() {
    return productCards.filter((card) => {
      const productCategory = (card.dataset.cat || "").toLowerCase();

      const productName = getProductName(card).toLowerCase();

      const productDescription = (
        card.querySelector(".product-card__desc")?.textContent || ""
      ).toLowerCase();

      const productCategoryText = (
        card.querySelector(".product-card__category")?.textContent || ""
      ).toLowerCase();

      const matchesCategory =
        state.category === "all" || productCategory === state.category;

      const matchesSearch =
        !state.search ||
        productName.includes(state.search) ||
        productDescription.includes(state.search) ||
        productCategoryText.includes(state.search);

      return matchesCategory && matchesSearch;
    });
  }

  // 9. SORTING
  function sortProducts(products) {
    const sorted = [...products];

    switch (state.sort) {
      case "price-asc":
        sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;

      case "price-desc":
        sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;

      case "name-asc":
        sorted.sort((a, b) =>
          getProductName(a).localeCompare(getProductName(b)),
        );
        break;

      case "name-desc":
      case "namee-desc":
        sorted.sort((a, b) =>
          getProductName(b).localeCompare(getProductName(a)),
        );
        break;

      default:
        sorted.sort((a, b) => originalOrder.get(a) - originalOrder.get(b));
    }

    return sorted;
  }

  // 10. UPDATE CATEGORY BUTTONS
  function updateCategoryButtons() {
    categoryButtons.forEach((button) => {
      const active = getCategoryFromButton(button) === state.category;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  // 11. UPDATE HEADING AND PRODUCT COUNT
  function updateResults(products) {
    const categoryName = categories[state.category] || "All Products";

    if (heading) {
      heading.textContent = categoryName;
      heading.style.marginBottom = "16px";
    }

    if (resultsText) {
      const count = products.length;

      let message = `Showing ${count} ${count === 1 ? "product" : "products"}`;

      if (state.category !== "all") {
        message += ` in ${categoryName}`;
      }

      if (state.search) {
        message += ` for "${state.search}"`;
      }

      resultsText.textContent = `${message}.`;
      resultsText.style.marginBottom = "32px";
    }
  }

  // 12. RENDER PAGE NUMBERS
  function renderPagination(totalProducts, totalPages, startIndex, endIndex) {
    pageSummary.textContent = totalProducts
      ? `Showing ${startIndex + 1}–${endIndex} of ${totalProducts} products`
      : "No products to display";

    pagination.hidden = totalPages <= 1;

    pageNumbers.replaceChildren();

    previousButton.disabled = state.page === 1;
    nextButton.disabled = state.page === totalPages;

    if (totalPages <= 1) return;

    let pages = [];

    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else if (state.page <= 4) {
      pages = [1, 2, 3, 4, 5, "…", totalPages];
    } else if (state.page >= totalPages - 3) {
      pages = [
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "…",
        state.page - 1,
        state.page,
        state.page + 1,
        "…",
        totalPages,
      ];
    }

    pages.forEach((page) => {
      if (page === "…") {
        const ellipsis = document.createElement("span");

        ellipsis.className = "aegon-pagination__ellipsis";
        ellipsis.textContent = "…";

        pageNumbers.appendChild(ellipsis);
        return;
      }

      const button = document.createElement("button");

      button.type = "button";
      button.className = "aegon-pagination__page";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Go to page ${page}`);

      if (page === state.page) {
        button.classList.add("is-active");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        if (state.page === page) return;

        state.page = page;
        renderProducts();

        productGrid.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      pageNumbers.appendChild(button);
    });
  }

  // 13. RENDER ONLY CURRENT PAGE PRODUCTS
  function renderProducts() {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);

    const totalProducts = sortedProducts.length;

    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    if (totalPages === 0) {
      state.page = 1;
    } else {
      state.page = Math.min(Math.max(state.page, 1), totalPages);
    }

    const startIndex = (state.page - 1) * PRODUCTS_PER_PAGE;

    const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

    const visibleProducts = sortedProducts.slice(startIndex, endIndex);

    // Hide all original cards and section headings.
    productCards.forEach((card) => {
      card.style.display = "none";
    });

    sectionHeadings.forEach((section) => {
      section.style.display = "none";
    });

    // Preserve the existing five-column layout.
    productGrid.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(min(100%, 220px), 1fr)";

    // Display only the products belonging to this page.
    visibleProducts.forEach((card) => {
      card.style.display = "";
      card.style.width = "100%";
      card.style.maxWidth = "none";

      productGrid.appendChild(card);
    });

    // Restore category headings in the default catalogue view.
    const showGroupedSections =
      state.category === "all" && !state.search && state.sort === "default";

    if (showGroupedSections) {
      sectionHeadings.forEach((section) => {
        const category = (section.dataset.section || "").toLowerCase();

        const firstCardInPage = visibleProducts.find(
          (card) => (card.dataset.cat || "").toLowerCase() === category,
        );

        if (firstCardInPage) {
          section.style.display = "";

          productGrid.insertBefore(section, firstCardInPage);
        }
      });
    }

    // Empty search/category result.
    let emptyMessage = productGrid.querySelector(".products-empty-message");

    if (totalProducts === 0) {
      if (!emptyMessage) {
        emptyMessage = document.createElement("p");

        emptyMessage.className = "products-empty-message";

        emptyMessage.textContent =
          "No products found. Try another search or category.";

        emptyMessage.style.gridColumn = "1 / -1";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.padding = "40px 16px";

        productGrid.appendChild(emptyMessage);
      }

      emptyMessage.style.display = "";
    } else if (emptyMessage) {
      emptyMessage.style.display = "none";
    }

    updateCategoryButtons();
    updateResults(sortedProducts);

    renderPagination(totalProducts, totalPages, startIndex, endIndex);
  }

  // 14. PREVIOUS BUTTON
  previousButton.addEventListener("click", () => {
    if (state.page > 1) {
      state.page--;
      renderProducts();

      productGrid.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  // 15. NEXT BUTTON
  nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(
      sortProducts(getFilteredProducts()).length / PRODUCTS_PER_PAGE,
    );

    if (state.page < totalPages) {
      state.page++;
      renderProducts();

      productGrid.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  // 16. CATEGORY FILTER EVENTS
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = getCategoryFromButton(button);

      if (!selectedCategory) return;

      state.category = selectedCategory;
      state.page = 1;

      renderProducts();
    });
  });

  // 17. HEADER SEARCH EVENTS
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      state.search = searchInput.value.trim().toLowerCase();
      state.page = 1;

      renderProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.trim().toLowerCase();
      state.page = 1;

      renderProducts();
    });
  }

  // 18. SORT EVENTS
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.page = 1;

      renderProducts();
    });
  }

  // 19. INITIAL RENDER
  renderProducts();
}
