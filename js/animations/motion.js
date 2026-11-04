
/* ************************************************************************************************
                                          AEGON — PAGE MOTION
********************************************************************************************* */
export function initMotion() {
  const main = document.querySelector("main");

  if (
    !main ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) return;

  const HERO = [
    ".hero",
    ".about-hero",
    ".products-hero",
    ".offers",
    ".wishlist-hero",
    ".cart-header",
    ".product-details-hero",
    ".login-hero",
    ".signup-hero"
  ].join(",");

  const CARDS = [
    ".product-card",
    ".category-card",
    ".wishlist-card",
    ".mission-vision__card",
    ".difference-card",
    ".trusted-scale__card",
    ".order-summary",
    ".cart-summary",
    ".summary-card",
    ".login-card",
    ".signup-card",
    ".product-overview__card"
  ].join(",");

  const GRIDS = [
    ".product-grid",
    ".category-grid",
    ".wishlist-grid",
    ".mission-vision__grid",
    ".aegon-difference__grid",
    ".trusted-scale__grid"
  ].join(",");

  const isInsideCard = (element) => element.closest(CARDS);

  /* 1. PAGE ENTRANCE */
  const hero = main.querySelector(HERO);
  const entrance = [];

  if (hero) {
    entrance.push(
      hero.querySelector(".eyebrow, [class*='__eyebrow'], [class*='-eyebrow']"),
      hero.querySelector("h1"),
      hero.querySelector("p")
    );
  }

  main.querySelectorAll("a.button, a.btn, .btn")
    .forEach((element) => {
      const { top, bottom } = element.getBoundingClientRect();

      if (
        !isInsideCard(element) &&
        top < window.innerHeight &&
        bottom > 0
      ) entrance.push(element);
    });

  [...new Set(entrance.filter(Boolean))]
    .sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    })
    .forEach((element, index) => {
      element.classList.add("hero-entrance");
      element.style.animationDelay = `${100 + index * 120}ms`;
    });

  /* 2. CARD-ONLY SCROLL REVEAL */
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;

      target.classList.add("is-visible");
      observer.unobserve(target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px"
  });

  // Individual cards outside grids.
  main.querySelectorAll(CARDS).forEach((card) => {
    if (card.closest(GRIDS) || card.dataset.motionReady) return;

    card.dataset.motionReady = "true";
    card.classList.add("motion-card");
    observer.observe(card);
  });

  // Complete card grids.
  main.querySelectorAll(GRIDS).forEach((grid) => {
    if (grid.dataset.motionReady) return;

    grid.dataset.motionReady = "true";
    grid.classList.add("motion-grid");
    observer.observe(grid);
  });
}
