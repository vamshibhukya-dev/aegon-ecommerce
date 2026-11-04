import { AegonStorage } from "../storage/storage.js";

// 1. Select signup form elements
const signupForm = document.querySelector("#signup-form");

const nameInput = document.querySelector("#signup-name");
const emailInput = document.querySelector("#signup-email");
const phoneInput = document.querySelector("#signup-phone");
const passwordInput = document.querySelector("#signup-password");
const confirmPasswordInput = document.querySelector("#signup-confirm-password");

const termsCheckbox = document.querySelector('input[name="terms"]');

const errorMessage = document.querySelector("#signup-error");

// 2. Display error message
function showSignupError(message) {
  if (!errorMessage) return;

  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// 3. Clear error message
function clearSignupError() {
  if (!errorMessage) return;

  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// 4. Validate password
function isStrongPassword(password) {
  const hasMinimumLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  return hasMinimumLength && hasLetter && hasNumber && hasSymbol;
}

// 5. Handle signup form submission
function handleSignup(event) {
  event.preventDefault();

  clearSignupError();

  // Check whether all required elements exist
  if (
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !termsCheckbox ||
    !errorMessage
  ) {
    console.error("AEGON: Signup form elements are missing.");
    return;
  }

  // Collect user input
  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate empty fields
  if (!name || !email || !phone || !password || !confirmPassword) {
    showSignupError("Please fill in all the fields.");
    return;
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    showSignupError(
      "Password must contain at least 8 characters, letters, numbers, and symbols.",
    );
    return;
  }

  // Confirm password
  if (password !== confirmPassword) {
    showSignupError("Passwords do not match.");
    return;
  }

  // Validate terms and conditions
  if (!termsCheckbox.checked) {
    showSignupError("Please accept the Terms of Service and Privacy Policy.");
    return;
  }

  try {
    // Check whether the email is already registered
    const existingUser = AegonStorage.findUserByEmail(email);

    if (existingUser) {
      showSignupError("An account with this email already exists.");
      return;
    }

    // Create user object
    const newUser = {
      name,
      email,
      phone,
      password,
    };

    // Save user in localStorage
    AegonStorage.saveUser(newUser);

    // Ensure the newly registered user is not logged in
    AegonStorage.logout();

    // Redirect to login page
    window.location.href = "../pages/login.html";
  } catch (error) {
    console.error("AEGON: Signup failed.", error);

    showSignupError("Something went wrong. Please try again.");
  }
}

// 6. Initialize signup page
export function initSignupPage() {
  if (!signupForm) return;

  signupForm.addEventListener("submit", handleSignup);

  [
    nameInput,
    emailInput,
    phoneInput,
    passwordInput,
    confirmPasswordInput,
  ].forEach((input) => {
    input?.addEventListener("input", clearSignupError);
  });
}
