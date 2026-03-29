/**
 * Global State Store using Zustand
 * Manages: auth, theme, watchlist, recently viewed, UI state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI, userAPI } from "../utils/api";

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Auth State ────────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await authAPI.login({ email, password });
        localStorage.setItem("cinemaiq_token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (name, email, password) => {
        const data = await authAPI.register({ name, email, password });
        localStorage.setItem("cinemaiq_token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        localStorage.removeItem("cinemaiq_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const data = await authAPI.me();
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },

      // ─── Theme ────────────────────────────────────────────────────────────
      theme: "dark",
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });
        document.documentElement.classList.toggle("light", newTheme === "light");
      },

      // ─── Watchlist (local + synced) ────────────────────────────────────────
      watchlist: [],
      isInWatchlist: (movieId) =>
        get().watchlist.some((m) => m.movieId === movieId),

      toggleWatchlist: async (movie) => {
        const { isAuthenticated, watchlist } = get();
        const movieData = {
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster_path,
          mediaType: movie.media_type || "movie",
        };

        if (isAuthenticated) {
          try {
            const result = await userAPI.toggleWatchlist(movieData);
            set({ watchlist: result.watchlist || [] });
            return result.action;
          } catch (err) {
            console.error("Failed to sync watchlist:", err);
          }
        }

        // Optimistic local update
        const exists = watchlist.some((m) => m.movieId === movieData.movieId);
        if (exists) {
          set({ watchlist: watchlist.filter((m) => m.movieId !== movieData.movieId) });
          return "removed";
        } else {
          set({ watchlist: [{ ...movieData, addedAt: new Date() }, ...watchlist] });
          return "added";
        }
      },

      // ─── Recently Viewed ───────────────────────────────────────────────────
      recentlyViewed: [],
      addToViewed: async (movie) => {
        const movieData = {
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster_path,
          mediaType: movie.media_type || "movie",
        };

        // Update local state
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (m) => m.movieId !== movieData.movieId
          );
          return {
            recentlyViewed: [
              { ...movieData, viewedAt: new Date() },
              ...filtered,
            ].slice(0, 20),
          };
        });

        // Sync to backend if logged in
        if (get().isAuthenticated) {
          userAPI.addViewed(movieData).catch(console.error);
        }
      },

      // ─── UI State ─────────────────────────────────────────────────────────
      selectedMovie: null,
      isModalOpen: false,
      openModal: (movie) => set({ selectedMovie: movie, isModalOpen: true }),
      closeModal: () => set({ selectedMovie: null, isModalOpen: false }),

      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: "cinemaiq-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        watchlist: state.watchlist,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

export default useStore;
