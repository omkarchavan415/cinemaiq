/**
 * TMDB Service
 * Handles all interactions with The Movie Database API
 * Implements pagination to fetch 1000+ movies and in-memory caching
 */

const axios = require("axios");
const NodeCache = require("node-cache");

// Cache with 10 minute TTL for dynamic data, 1 hour for static
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const longCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const TMDB_BASE = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

// Axios instance with default params
const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: API_KEY, language: "en-US" },
  timeout: 10000,
});

/**
 * Fetch multiple pages in parallel (rate-limit aware)
 */
async function fetchPages(endpoint, pages = 5, extraParams = {}) {
  const requests = Array.from({ length: pages }, (_, i) =>
    tmdb.get(endpoint, { params: { ...extraParams, page: i + 1 } })
  );
  const responses = await Promise.allSettled(requests);
  const results = [];
  for (const res of responses) {
    if (res.status === "fulfilled") {
      results.push(...(res.value.data.results || []));
    }
  }
  return results;
}

/**
 * Normalize image URLs and add full paths
 */
function normalizeMovie(movie) {
  return {
    ...movie,
    poster_path: movie.poster_path
      ? `${IMAGE_BASE}/w500${movie.poster_path}`
      : null,
    backdrop_path: movie.backdrop_path
      ? `${IMAGE_BASE}/original${movie.backdrop_path}`
      : null,
    media_type: movie.media_type || (movie.first_air_date ? "tv" : "movie"),
    title: movie.title || movie.name,
    release_date: movie.release_date || movie.first_air_date,
  };
}

// ─── Public API Methods ───────────────────────────────────────────────────────

/**
 * Get trending movies and TV shows (week)
 */
async function getTrending(mediaType = "all", timeWindow = "week", pages = 3) {
  const cacheKey = `trending_${mediaType}_${timeWindow}_${pages}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const results = await fetchPages(`/trending/${mediaType}/${timeWindow}`, pages);
  const normalized = results.map(normalizeMovie);
  cache.set(cacheKey, normalized);
  return normalized;
}

/**
 * Get popular movies (paginated for large datasets)
 */
async function getPopularMovies(pages = 10) {
  const cacheKey = `popular_movies_${pages}`;
  if (longCache.has(cacheKey)) return longCache.get(cacheKey);

  const results = await fetchPages("/movie/popular", pages);
  const normalized = results.map(normalizeMovie);
  longCache.set(cacheKey, normalized);
  return normalized;
}

/**
 * Get top-rated movies
 */
async function getTopRated(mediaType = "movie", pages = 5) {
  const cacheKey = `top_rated_${mediaType}_${pages}`;
  if (longCache.has(cacheKey)) return longCache.get(cacheKey);

  const results = await fetchPages(`/${mediaType}/top_rated`, pages);
  const normalized = results.map(normalizeMovie);
  longCache.set(cacheKey, normalized);
  return normalized;
}

/**
 * Get movies by genre
 */
async function getByGenre(genreId, mediaType = "movie", pages = 3) {
  const cacheKey = `genre_${genreId}_${mediaType}_${pages}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const results = await fetchPages(`/discover/${mediaType}`, pages, {
    with_genres: genreId,
    sort_by: "popularity.desc",
  });
  const normalized = results.map(normalizeMovie);
  cache.set(cacheKey, normalized);
  return normalized;
}

/**
 * Get movie details with videos and credits
 */
async function getMovieDetails(id, mediaType = "movie") {
  const cacheKey = `details_${mediaType}_${id}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const [detailRes, videosRes, creditsRes, similarRes] = await Promise.allSettled([
    tmdb.get(`/${mediaType}/${id}`),
    tmdb.get(`/${mediaType}/${id}/videos`),
    tmdb.get(`/${mediaType}/${id}/credits`),
    tmdb.get(`/${mediaType}/${id}/similar`),
  ]);

  const detail = detailRes.status === "fulfilled" ? detailRes.value.data : null;
  if (!detail) throw new Error("Movie not found");

  const videos = videosRes.status === "fulfilled"
    ? videosRes.value.data.results || []
    : [];

  const credits = creditsRes.status === "fulfilled"
    ? creditsRes.value.data
    : { cast: [], crew: [] };

  const similar = similarRes.status === "fulfilled"
    ? (similarRes.value.data.results || []).slice(0, 12).map(normalizeMovie)
    : [];

  // Find YouTube trailer
  const trailer = videos.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  const result = {
    ...normalizeMovie(detail),
    trailer_key: trailer?.key || null,
    cast: (credits.cast || []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `${IMAGE_BASE}/w185${c.profile_path}` : null,
    })),
    director: (credits.crew || []).find((c) => c.job === "Director")?.name || null,
    similar,
  };

  cache.set(cacheKey, result);
  return result;
}

/**
 * Search movies and TV shows
 */
async function searchMedia(query, page = 1) {
  if (!query) return [];
  const cacheKey = `search_${query}_${page}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const res = await tmdb.get("/search/multi", {
    params: { query, page, include_adult: false },
  });
  const results = (res.data.results || [])
    .filter((m) => m.media_type !== "person")
    .map(normalizeMovie);

  cache.set(cacheKey, results, 300); // 5-min cache for searches
  return results;
}

/**
 * Get all genre list
 */
async function getGenres(mediaType = "movie") {
  const cacheKey = `genres_${mediaType}`;
  if (longCache.has(cacheKey)) return longCache.get(cacheKey);

  const res = await tmdb.get(`/genre/${mediaType}/list`);
  const genres = res.data.genres || [];
  longCache.set(cacheKey, genres);
  return genres;
}

/**
 * Get a large dataset for ML recommendations (1000+ movies)
 */
async function getLargeDataset() {
  const cacheKey = "large_dataset";
  if (longCache.has(cacheKey)) return longCache.get(cacheKey);

  console.log("📦 Fetching large movie dataset for ML...");
  const [popular, topRated, trending] = await Promise.all([
    fetchPages("/movie/popular", 10),
    fetchPages("/movie/top_rated", 10),
    fetchPages("/trending/movie/week", 5),
  ]);

  const allMovies = [...popular, ...topRated, ...trending];
  // Deduplicate by ID
  const seen = new Set();
  const unique = allMovies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  const normalized = unique.map(normalizeMovie);
  longCache.set(cacheKey, normalized, 7200); // 2-hour cache
  console.log(`✅ Loaded ${normalized.length} unique movies for ML`);
  return normalized;
}

module.exports = {
  getTrending,
  getPopularMovies,
  getTopRated,
  getByGenre,
  getMovieDetails,
  searchMedia,
  getGenres,
  getLargeDataset,
};
