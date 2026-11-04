
/* *************************************************************
   AEGON — API Service
   File: js/services/api.js

   Responsibilities:
    * Send HTTP requests to the AEGON API
    * Handle successful and failed responses
    * Parse JSON responses safely
    * Provide reusable GET, POST, PUT, PATCH and DELETE methods
 *************************************************************** */

import { AEGON_API_BASE } from "../config.js";

// 1. COMMON API REQUEST FUNCTION
export async function apiRequest(endpoint, options = {}) {
  const url = `${AEGON_API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});

  // Tell the server that we prefer JSON responses.
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const requestOptions = {
    ...options,
    headers,
  };

  // Convert ordinary JavaScript objects into JSON.
  // FormData and other body types are left unchanged.
  if (
    options.body !== undefined &&
    options.body !== null &&
    typeof options.body !== "string" &&
    !(options.body instanceof FormData)
  ) {
    requestOptions.body = JSON.stringify(options.body);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  let response;

  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    // Network errors, connection failures, or blocked requests.
    throw new Error(
      `Unable to connect to the AEGON API. Please check your connection. (${error.message})`
    );
  }

  // A successful DELETE or other request may return no content.
  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}.`);
    }

    return null;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The AEGON API returned an invalid or non-JSON response (HTTP ${response.status}).`
    );
  }

  // HTTP errors include statuses such as 400, 404 and 500.
  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `API request failed with status ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// 2. REUSABLE HTTP METHODS
export function get(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "GET",
  });
}

export function post(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body,
  });
}

export function put(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body,
  });
}

export function patch(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "PATCH",
    body,
  });
}

export function del(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "DELETE",
  });
}
