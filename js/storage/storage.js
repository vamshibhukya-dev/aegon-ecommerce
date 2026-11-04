
/* ***************************************************************
   AEGON — Storage Layer
   File: js/storage/storage.js

   Responsibilities:
    * Store and retrieve registered users
    * Manage the current login session
    * Manage cart items and quantities
    * Calculate cart count and total
    * Manage wishlist items
    * Notify the application when cart/wishlist changes

   Note: This is frontend-demo storage, not production security.
 **************************************************************** */

export const AegonStorage = (() => {
  // 1. Central place for all localStorage keys
  const KEYS = {
    users: "aegon_users",
    currentUser: "aegon_current_user",
    cart: "aegon_cart",
    wishlist: "aegon_wishlist",
  };

  // 2. Read saved data safely
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);

      if (raw === null) {
        return fallback;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.warn(`AEGON Storage: Could not read "${key}".`, error);
      return fallback;
    }
  }

  // 3. Save data as JSON
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`AEGON Storage: Could not save "${key}".`, error);
      throw error;
    }
  }

  // 4. Notify other parts of the application
  function emit(eventName, detail) {
    document.dispatchEvent(
      new CustomEvent(eventName, { detail })
    );
  }

  // USERS & LOGIN SESSION
  function getUsers() {
    const users = read(KEYS.users, []);
    return Array.isArray(users) ? users : [];
  }

  function findUserByEmail(email) {
    if (typeof email !== "string") {
      return undefined;
    }

    const normalizedEmail = email.trim().toLowerCase();

    return getUsers().find(
      (user) =>
        typeof user.email === "string" &&
        user.email.trim().toLowerCase() === normalizedEmail
    );
  }

  function saveUser(user) {
    if (!user || typeof user.email !== "string") {
      throw new Error("A valid user email is required.");
    }

    if (findUserByEmail(user.email)) {
      throw new Error("An account with this email already exists.");
    }

    const users = getUsers();
    write(KEYS.users, [...users, user]);

    return user;
  }

  function validateLogin(email, password) {
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return null;
    }

    return user;
  }

  function getCurrentUser() {
    const email = read(KEYS.currentUser, null);

    if (typeof email !== "string" || !email) {
      return null;
    }

    return findUserByEmail(email) ?? null;
  }

  function setCurrentUser(email) {
    if (!findUserByEmail(email)) {
      throw new Error("Cannot start a session: user not found.");
    }

    write(KEYS.currentUser, email.trim());
  }

  function logout() {
    localStorage.removeItem(KEYS.currentUser);
  }

  /* SHOPPING CART
     Cart format: [{ id: productId, qty: quantity }] */
  function getCart() {
    const cart = read(KEYS.cart, []);
    return Array.isArray(cart) ? cart : [];
  }

  function saveCart(cart) {
    if (!Array.isArray(cart)) {
      throw new TypeError("Cart must be an array.");
    }

    write(KEYS.cart, cart);

    emit("aegon:cart-updated", { cart });

    return cart;
  }

  function addToCart(id, qty = 1) {
    if (qty <= 0) {
      throw new RangeError("Quantity must be greater than zero.");
    }

    const cart = getCart();
    const existingItem = cart.find((item) => item.id === id);

    const nextCart = existingItem
      ? cart.map((item) =>
          item.id === id
            ? { ...item, qty: item.qty + qty }
            : item
        )
      : [...cart, { id, qty }];

    return saveCart(nextCart);
  }

  function setQty(id, qty) {
    if (!Number.isFinite(qty)) {
      throw new TypeError("Quantity must be a valid number.");
    }

    const cart = getCart();

    const nextCart =
      qty < 1
        ? cart.filter((item) => item.id !== id)
        : cart.map((item) =>
            item.id === id ? { ...item, qty } : item
          );

    return saveCart(nextCart);
  }

  function incrementCartItem(id) {
    const item = getCart().find((item) => item.id === id);
    return setQty(id, (item?.qty ?? 0) + 1);
  }

  function decrementCartItem(id) {
    const item = getCart().find((item) => item.id === id);

    if (!item) {
      return getCart();
    }

    return setQty(id, item.qty - 1);
  }

  function removeFromCart(id) {
    return saveCart(
      getCart().filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    return saveCart([]);
  }

  function getCartCount() {
    return getCart().reduce(
      (total, item) => total + item.qty,
      0
    );
  }

  function getCartTotal(products) {
    if (!Array.isArray(products)) {
      return 0;
    }

    const cart = getCart();

    return cart.reduce((total, item) => {
      const product = products.find(
        (product) => product.id === item.id
      );

      return product
        ? total + product.price * item.qty
        : total;
    }, 0);
  }

  /* WISHLIST
     Format: [productId, productId, ...] */
  function getWishlist() {
    const wishlist = read(KEYS.wishlist, []);
    return Array.isArray(wishlist) ? wishlist : [];
  }

  function isWishlisted(id) {
    return getWishlist().includes(id);
  }

  function toggleWishlist(id) {
    const wishlist = getWishlist();

    const nextWishlist = wishlist.includes(id)
      ? wishlist.filter((itemId) => itemId !== id)
      : [...wishlist, id];

    write(KEYS.wishlist, nextWishlist);

    emit("aegon:wishlist-updated", {
      wishlist: nextWishlist,
    });

    return nextWishlist;
  }

  // 5. Public API: only these methods are available to imports
  return {
    // Users & session
    getUsers,
    findUserByEmail,
    saveUser,
    validateLogin,
    getCurrentUser,
    setCurrentUser,
    logout,

    // Cart
    getCart,
    saveCart,
    addToCart,
    setQty,
    incrementCartItem,
    decrementCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,

    // Wishlist
    getWishlist,
    isWishlisted,
    toggleWishlist,
  };
})();
