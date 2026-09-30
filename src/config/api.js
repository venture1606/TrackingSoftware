// Backend origin, e.g. https://192.168.1.50:5443 (no trailing slash).
// Leave empty when the frontend is served from the same origin as the API.
export const API_BASE = (process.env.REACT_APP_API_URL || "").trim().replace(/\/+$/, "");

// The per-service REACT_APP_*_URL variables still override API_BASE when set.
export const PROCESS_URL = process.env.REACT_APP_PROCESS_URL || `${API_BASE}/api/v1/process`;
export const AUTH_URL = process.env.REACT_APP_AUTH_URL || `${API_BASE}/api/v1/user`;
export const DEPARTMENT_URL = process.env.REACT_APP_DEPARTMENT_URL || `${API_BASE}/api/v1/department`;
export const PRODUCT_URL = process.env.REACT_APP_PRODUCT_URL || `${API_BASE}/api/v1/product`;

// Locally stored uploads are saved as server-relative paths ("/uploads/...").
// Cloudinary URLs, blob URLs and File objects pass through unchanged.
export const resolveFileUrl = (value) => {
  if (typeof value === "string" && value.startsWith("/uploads/")) {
    return `${API_BASE}${value}`;
  }
  return value;
};
