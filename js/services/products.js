
/* ***********************************************************
   AEGON — Product Service
   File: js/services/products.js

   Responsibilities:
    * Fetch products from the AEGON API
    * Find a product by ID
    * Filter products by category

   HTTP requests are handled by services/api.js.
 ************************************************************ */

import { get } from "./api.js";

// 1. GET ALL PRODUCTS
export async function getProducts() {
  const data = await get("/products?limit=100");

  // The reference API returns products inside data.products.
  if (!data || !Array.isArray(data.products)) {
    throw new Error("Invalid products response from the AEGON API.");
  }

  return data.products;
}

// 2. GET ONE PRODUCT BY ID
export async function getProductById(id) {
  if (id === undefined || id === null || id === "") {
    throw new Error("A product ID is required.");
  }

  const products = await getProducts();

  return (
    products.find((product) => String(product.id) === String(id)) ??
    null
  );
}

// 3. GET PRODUCTS BY CATEGORY
export async function getProductsByCategory(category) {
  if (typeof category !== "string" || !category.trim()) {
    throw new Error("A valid product category is required.");
  }

  const products = await getProducts();
  const selectedCategory = category.trim().toLowerCase();

  return products.filter(
    (product) =>
      typeof product.category === "string" &&
      product.category.toLowerCase() === selectedCategory
  );
}
