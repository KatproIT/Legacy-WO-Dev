// src/utils/authFetch.ts

/**
 * A wrapper around fetch() that:
 *  - Automatically attaches JWT Authorization header
 *  - Automatically redirects to /login on 401 (invalid token)
 *  - Preserves all other options
 */

export async function authFetch(url: string, options: any = {}) {
  const token = localStorage.getItem("token");

  // Merge headers
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired or invalid → redirect to login
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  }

  return response;
}
