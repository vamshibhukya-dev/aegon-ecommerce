/*

 * AEGON — Application Configuration
 
 * Purpose:
   Centralizes shared configuration values used across the frontend.
 
 * Architecture:
   API endpoints are defined in one place to avoid hardcoding URLs
   throughout individual page modules.
 
 * Important:
   This URL points to the API server, not the AEGON website itself.
   Public configuration values must never contain secret credentials.

 */

// Base URL of the API server that provides product data.
export const AEGON_API_BASE = "https://ageon-api.vercel.app";
