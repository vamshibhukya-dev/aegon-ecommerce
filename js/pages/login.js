import { AegonStorage } from "../storage/storage.js";
import {
  isRequired,
  isValidEmail,
  isValidPassword,
} from "../utils/validation.js";

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

const passwordToggle = document.querySelector("[data-password-toggle]");

// 4. PRESS AND HOLD TO REVEAL PASSWORD
function showPassword() {
  if (!passwordInput || !passwordToggle) return;

  passwordInput.type = "text";

  passwordToggle.setAttribute("aria-label", "Hide password");
  passwordToggle.setAttribute("aria-pressed", "true");
}

function hidePassword() {
  if (!passwordInput || !passwordToggle) return;

  passwordInput.type = "password";

  passwordToggle.setAttribute("aria-label", "Show password");
  passwordToggle.setAttribute("aria-pressed", "false");
}

// 5. HANDLE LOGIN SUBMISSION
function handleLogin(event) {
  event.preventDefault();

  clearLoginError();

  // Check whether the required elements exist.
  if (!emailInput || !passwordInput || !errorMessage) {
    console.error("AEGON: Login form elements are missing.");
    return;
  }

  // Collect user input.
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // 1. Check required fields.
  if (!isRequired(email) || !isRequired(password)) {
    showLoginError("Please enter your email address and password.");
    return;
  }

  // 2. Validate email format.
  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return;
  }

  // 3. Validate password length.
  if (!isValidPassword(password)) {
    showLoginError("Password must be between 8 and 128 characters.");
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

// 6. INITIALIZE LOGIN PAGE
export function initLoginPage() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", handleLogin);

  // Clear the error when the user starts correcting inputs.
  emailInput?.addEventListener("input", clearLoginError);
  passwordInput?.addEventListener("input", clearLoginError);
}

// Password visibility — Press and Hold
passwordToggle?.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  event.preventDefault();
  showPassword();
});

// Hide when mouse/finger is released anywhere
window.addEventListener("pointerup", hidePassword);
window.addEventListener("pointercancel", hidePassword);

// Prevent right-click context menu on the icon
passwordToggle?.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Keyboard accessibility — Space key
passwordToggle?.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    showPassword();
  }
});

passwordToggle?.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    hidePassword();
  }
});

passwordToggle?.addEventListener("blur", hidePassword);
