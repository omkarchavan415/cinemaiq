/**
 * Recommendation Routes
 * GET /api/recommend/movie/:id   - Similar movies (content-based)
 * GET /api/recommend/query       - Recommend by search query
 * GET /api/recommend/personalized - Personalized for logged-in user
 * GET /api/recommend/genres      - Recommend by genre preferences
 */

const express = require("express");
const router = express.Router();
const engine = require("../ml/recommendationEngine");
const tmdb = require("../services/tmdbService");
const { protect, optionalAuth } = require("../middleware/auth");

// Ensure engine is trained before handling requests
let trainingPromise = null;

async function ensureEngineReady() {
  if (engine.isReady) return;
  if (!trainingPromise) {
    trainingPromise = tmdb.getLargeDataset().then((movies) => {
      engine.train(movies);
      trainingPromise = null;
    });
  }
  await trainingPromise;
}

// Middleware to ensure ML engine is ready
router.use(async (req, res, next) => {
  try {
    await ensureEngineReady();
    next();
  } catch (err) {
    next(err);
  }
});

// Similar movies by ID
router.get("/movie/:id", async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.id);
    const topN = Math.min(parseInt(req.query.limit) || 12, 24);

    let recommendations = engine.recommendByMovie(movieId, topN);

    // Fallback: if movie not in ML index, use TMDB similar endpoint
    if (!recommendations.length) {
      const media_type = req.query.media_type || "movie";
      const details = await tmdb.getMovieDetails(movieId, media_type);
      recommendations = details.similar || [];
    }

    res.json({
      movie_id: movieId,
      recommendations,
      source: recommendations.length ? "ml" : "tmdb",
      total: recommendations.length,
    });
  } catch (err) {
    next(err);
  }
});

// Recommend by query
router.get("/query", async (req, res, next) => {
  try {
    const { q, limit = 12 } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const recommendations = engine.recommendByQuery(q.trim(), parseInt(limit));

    // Augment with TMDB search results if ML returns too few
    if (recommendations.length < 4) {
      const searchResults = await tmdb.searchMedia(q.trim());
      return res.json({
        query: q,
        recommendations: searchResults.slice(0, parseInt(limit)),
        source: "search_fallback",
        total: searchResults.length,
      });
    }

    res.json({
      query: q,
      recommendations,
      source: "ml",
      total: recommendations.length,
    });
  } catch (err) {
    next(err);
  }
});

// Personalized recommendations (requires auth)
router.get("/personalized", protect, async (req, res, next) => {
  try {
    const user = req.user;
    const watchedIds = user.recentlyViewed
      .slice(0, 10)
      .map((m) => m.movieId);

    if (!watchedIds.length) {
      // Return trending if no history
      const trending = await tmdb.getTrending("all", "week", 1);
      return res.json({
        recommendations: trending.slice(0, 20),
        source: "trending_fallback",
        message: "Watch some movies to get personalized recommendations!",
      });
    }

    const recommendations = engine.recommendPersonalized(watchedIds, 20);
    const basedOn = user.recentlyViewed[0]?.title || "your watch history";

    res.json({
      recommendations,
      based_on: basedOn,
      source: "personalized_ml",
      total: recommendations.length,
    });
  } catch (err) {
    next(err);
  }
});

// Recommend by genres
router.get("/genres", async (req, res, next) => {
  try {
    const genreIds = (req.query.ids || "")
      .split(",")
      .map((id) => parseInt(id))
      .filter(Boolean);

    if (!genreIds.length) {
      return res.status(400).json({ error: "Genre IDs required (ids=28,35,18)" });
    }

    const recommendations = engine.recommendByGenres(
      genreIds,
      parseInt(req.query.limit) || 15
    );

    res.json({
      genre_ids: genreIds,
      recommendations,
      source: "ml",
      total: recommendations.length,
    });
  } catch (err) {
    next(err);
  }
});

// Engine stats
router.get("/stats", async (req, res) => {
  res.json(engine.getStats());
});

module.exports = router;
