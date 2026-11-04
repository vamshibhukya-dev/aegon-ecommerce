import { initHeader } from "./components/header.js";
import { initHomePage } from "./pages/home.js";
import { initProductsPage } from "./pages/products.js";
import { initProductDetails } from "./pages/product-details.js";
import { initCartPage } from "./pages/cart.js";
import { initWishlistPage } from "./pages/wishlist.js";
import { initLoginPage } from "./pages/login.js";
import { initSignupPage } from "./pages/signup.js";

import { initMotion } from "./animations/motion.js";

// Initialize shared header components.
initHeader();

// Initialize homepage product sections.
initHomePage();

// Initialize the products listing page.
initProductsPage();

// Initialize the product details page.
initProductDetails();

// Initialize the shopping cart page.
initCartPage();

// Initialize the wishlist page when its grid is available.
if (document.querySelector("#wishlist-grid")) {
  initWishlistPage();
}

// Initialize the login page.
initLoginPage();

// Initialize the signup page.
initSignupPage();

// Initialize site-wide motion system.
initMotion();


/* **************************************************************************
                                 SCROLL BUTTON
   ************************************************************************** */
const scrollButton = document.querySelector(".back-to-top");
const scrollArrow = scrollButton?.querySelector(".back-to-top__arrow");

const updateScrollButton = () => {
  if (!scrollButton || !scrollArrow) return;

  const isNearTop = window.scrollY <= 100;

  if (isNearTop) {
    scrollButton.setAttribute("aria-label", "Back to bottom");

    scrollArrow.setAttribute(
      "d",
      "M12 4v16m7-7l-7 7l-7-7"
    );
  } else {
    scrollButton.setAttribute("aria-label", "Back to top");

    scrollArrow.setAttribute(
      "d",
      "M12 20V4m-7 7l7-7l7 7"
    );
  }
};

scrollButton?.addEventListener("click", (event) => {
  event.preventDefault();

  const isNearTop = window.scrollY <= 100;

  window.scrollTo({
    top: isNearTop ? document.documentElement.scrollHeight : 0,
    behavior: "smooth"
  });
});

window.addEventListener("scroll", updateScrollButton, {
  passive: true
});

updateScrollButton();