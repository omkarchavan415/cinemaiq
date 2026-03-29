/**
 * Movies Routes
 * GET /api/movies          - Get popular movies (paginated)
 * GET /api/movies/trending - Get trending content
 * GET /api/movies/top-rated - Top rated movies
 * GET /api/movies/search   - Search movies
 * GET /api/movies/genres   - Get genre list
 * GET /api/movies/:id      - Movie details
 */

const express = require("express");
const router = express.Router();
const tmdb = require("../services/tmdbService");

// Popular movies
router.get("/", async (req, res, next) => {
  try {
    const pages = Math.min(parseInt(req.query.pages) || 5, 20);
    const movies = await tmdb.getPopularMovies(pages);
    res.json({ results: movies, total: movies.length });
  } catch (err) {
    next(err);
  }
});

// Trending
router.get("/trending", async (req, res, next) => {
  try {
    const { media_type = "all", time_window = "week", pages = 3 } = req.query;
    const results = await tmdb.getTrending(media_type, time_window, parseInt(pages));
    res.json({ results, total: results.length });
  } catch (err) {
    next(err);
  }
});

// Top Rated
router.get("/top-rated", async (req, res, next) => {
  try {
    const { media_type = "movie", pages = 5 } = req.query;
    const results = await tmdb.getTopRated(media_type, parseInt(pages));
    res.json({ results, total: results.length });
  } catch (err) {
    next(err);
  }
});

// Search
router.get("/search", async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const results = await tmdb.searchMedia(q.trim(), parseInt(page));
    res.json({ results, query: q, total: results.length });
  } catch (err) {
    next(err);
  }
});

// Genre list
router.get("/genres", async (req, res, next) => {
  try {
    const { media_type = "movie" } = req.query;
    const genres = await tmdb.getGenres(media_type);
    res.json({ genres });
  } catch (err) {
    next(err);
  }
});

// By genre
router.get("/genre/:genreId", async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { media_type = "movie", pages = 3 } = req.query;
    const results = await tmdb.getByGenre(genreId, media_type, parseInt(pages));
    res.json({ results, total: results.length });
  } catch (err) {
    next(err);
  }
});

// Movie details (must be last to not conflict with above)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { media_type = "movie" } = req.query;
    const movie = await tmdb.getMovieDetails(parseInt(id), media_type);
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
