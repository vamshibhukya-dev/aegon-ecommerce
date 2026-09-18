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