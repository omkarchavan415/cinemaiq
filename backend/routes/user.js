/**
 * User Routes
 * POST /api/user/watchlist/toggle  - Add/remove from watchlist
 * GET  /api/user/watchlist         - Get user's watchlist
 * POST /api/user/viewed            - Add to recently viewed
 * GET  /api/user/viewed            - Get recently viewed
 * PUT  /api/user/preferences       - Update preferences
 * POST /api/user/search-history    - Save search query
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// All user routes require authentication
router.use(protect);

// Toggle watchlist item
router.post("/watchlist/toggle", async (req, res, next) => {
  try {
    const { movieId, title, poster, mediaType } = req.body;
    if (!movieId) return res.status(400).json({ error: "movieId is required" });

    const result = await req.user.toggleWatchlist({
      movieId: Number(movieId),
      title,
      poster,
      mediaType: mediaType || "movie",
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get watchlist
router.get("/watchlist", async (req, res) => {
  res.json({
    watchlist: req.user.watchlist,
    total: req.user.watchlist.length,
  });
});

// Add to recently viewed
router.post("/viewed", async (req, res, next) => {
  try {
    const { movieId, title, poster, mediaType } = req.body;
    if (!movieId) return res.status(400).json({ error: "movieId is required" });

    await req.user.addToRecentlyViewed({
      movieId: Number(movieId),
      title,
      poster,
      mediaType: mediaType || "movie",
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get recently viewed
router.get("/viewed", async (req, res) => {
  res.json({
    recentlyViewed: req.user.recentlyViewed,
    total: req.user.recentlyViewed.length,
  });
});

// Update preferences
router.put("/preferences", async (req, res, next) => {
  try {
    const { favoriteGenres, theme } = req.body;
    if (favoriteGenres !== undefined) {
      req.user.preferences.favoriteGenres = favoriteGenres;
    }
    if (theme !== undefined) {
      req.user.preferences.theme = theme;
    }
    await req.user.save();
    res.json({ preferences: req.user.preferences });
  } catch (err) {
    next(err);
  }
});

// Save search history
router.post("/search-history", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.json({ success: true });

    // Keep last 20 unique searches
    req.user.searchHistory = req.user.searchHistory.filter(
      (s) => s.query !== query
    );
    req.user.searchHistory.unshift({ query, searchedAt: new Date() });
    if (req.user.searchHistory.length > 20) {
      req.user.searchHistory = req.user.searchHistory.slice(0, 20);
    }
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get search history
router.get("/search-history", async (req, res) => {
  res.json({ searchHistory: req.user.searchHistory.slice(0, 10) });
});

module.exports = router;
