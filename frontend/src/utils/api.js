/**
 * API Client
 * Centralized axios instance for all backend API calls
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "https://cinemaiq.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinemaiq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle Auth Errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "Network Error";
    if (error.response?.status === 401) {
      localStorage.removeItem("cinemaiq_token");
      localStorage.removeItem("cinemaiq_user");
      // Don't redirect here — let the app handle it via auth state
    }
    return Promise.reject(new Error(message));
  }
);

// ─── Movies API ───────────────────────────────────────────────────────────────
export const moviesAPI = {
  getPopular: (pages = 5) => api.get(`/movies?pages=${pages}`),
  getTrending: (mediaType = "all", timeWindow = "week") =>
    api.get(`/movies/trending?media_type=${mediaType}&time_window=${timeWindow}`),
  getTopRated: (mediaType = "movie") => api.get(`/movies/top-rated?media_type=${mediaType}`),
  getDetails: (id, mediaType = "movie") =>
    api.get(`/movies/${id}?media_type=${mediaType}`),
  search: (query, page = 1) =>
    api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
  getGenres: (mediaType = "movie") => api.get(`/movies/genres?media_type=${mediaType}`),
  getByGenre: (genreId, mediaType = "movie") =>
    api.get(`/movies/genre/${genreId}?media_type=${mediaType}`),
};

// ─── Recommendations API ──────────────────────────────────────────────────────
export const recommendAPI = {
  byMovie: (movieId) => api.get(`/recommend/movie/${movieId}`),
  byQuery: (query) => api.get(`/recommend/query?q=${encodeURIComponent(query)}`),
  personalized: () => api.get("/recommend/personalized"),
  byGenres: (genreIds) => api.get(`/recommend/genres?ids=${genreIds.join(",")}`),
  stats: () => api.get("/recommend/stats"),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  toggleWatchlist: (data) => api.post("/user/watchlist/toggle", data),
  getWatchlist: () => api.get("/user/watchlist"),
  addViewed: (data) => api.post("/user/viewed", data),
  getViewed: () => api.get("/user/viewed"),
  saveSearch: (query) => api.post("/user/search-history", { query }),
  updatePreferences: (prefs) => api.put("/user/preferences", prefs),
};

export default api;
