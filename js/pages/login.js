/* *********************************************************
   AEGON — Login Page
   File: js/pages/login.js

   Responsibilities:
   * Handle login form submission
   * Validate user credentials
   * Create login session
   * Display login errors
   * Redirect after successful login
  ********************************************************** */

import { AegonStorage } from "../storage/storage.js";

// 1. LOGIN PAGE ELEMENTS
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#login-email");
const passwordInput = document.querySelector("#login-password");
const errorMessage = document.querySelector("#login-error");

// 2. DISPLAY LOGIN ERROR
function showLoginError(message) {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// 3. CLEAR LOGIN ERROR
function clearLoginError() {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// 4. HANDLE LOGIN SUBMISSION
function handleLogin(event) {
  event.preventDefault();

  clearLoginError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Check whether the required elements exist.
  if (!emailInput || !passwordInput || !errorMessage) {
    console.error("AEGON: Login form elements are missing.");
    return;
  }

  // Check empty values.
  if (!email || !password) {
    showLoginError("Please enter your email address and password.");
    return;
  }

  try {
    // Find the registered user and validate credentials.
    const user = AegonStorage.validateLogin(email, password);

    // Stop if the credentials are incorrect.
    if (!user) {
      showLoginError("Invalid email address or password.");
      return;
    }

    // Create the login session.
    AegonStorage.setCurrentUser(user.email);

    // Notify other application components.
    document.dispatchEvent(
      new CustomEvent("aegon:auth-updated", {
        detail: { user },
      }),
    );

    // Redirect to the home page.
    window.location.href = "../index.html";
  } catch (error) {
    console.error("AEGON: Login failed.", error);

    showLoginError("Something went wrong. Please try again.");
  }
}

// 5. INITIALIZE LOGIN PAGE
export function initLoginPage() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", handleLogin);

  // Clear the error when the user starts correcting inputs.
  emailInput?.addEventListener("input", clearLoginError);
  passwordInput?.addEventListener("input", clearLoginError);
}
