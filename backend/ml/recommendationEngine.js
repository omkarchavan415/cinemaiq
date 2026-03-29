/**
 * CinemaIQ ML Recommendation Engine
 * Implements content-based filtering using TF-IDF vectorization
 * and Cosine Similarity for movie recommendations
 */

const natural = require("natural");
const TfIdf = natural.TfIdf;

class RecommendationEngine {
  constructor() {
    this.tfidf = new TfIdf();
    this.movies = [];
    this.movieIndex = new Map(); // movieId -> array index
    this.vectors = []; // TF-IDF document vectors
    this.isReady = false;
  }

  /**
   * Build a rich text document from a movie for TF-IDF
   * Concatenates: title, overview, genres, keywords, cast info
   */
  buildDocument(movie) {
    const parts = [];

    if (movie.title) parts.push(movie.title.repeat(3)); // Boost title weight
    if (movie.overview) parts.push(movie.overview);
    if (movie.genres?.length) {
      const genreNames = movie.genres.map((g) =>
        typeof g === "string" ? g : g.name
      );
      parts.push(genreNames.join(" ").repeat(2)); // Boost genre weight
    }
    if (movie.genre_ids?.length) {
      // Map known TMDB genre IDs to names
      const genreMap = {
        28: "action", 12: "adventure", 16: "animation", 35: "comedy",
        80: "crime", 99: "documentary", 18: "drama", 10751: "family",
        14: "fantasy", 36: "history", 27: "horror", 10402: "music",
        9648: "mystery", 10749: "romance", 878: "sciencefiction",
        10770: "tvmovie", 53: "thriller", 10752: "war", 37: "western",
        10759: "actionadventure", 10762: "kids", 10763: "news",
        10764: "reality", 10765: "scifiandfantasy", 10766: "soap",
        10767: "talk", 10768: "warpolitics",
      };
      const names = movie.genre_ids
        .map((id) => genreMap[id] || "")
        .filter(Boolean);
      parts.push(names.join(" ").repeat(2));
    }
    if (movie.keywords?.length) {
      parts.push(movie.keywords.map((k) => k.name || k).join(" "));
    }
    if (movie.cast?.length) {
      parts.push(movie.cast.map((c) => c.name).join(" "));
    }
    if (movie.director) parts.push(movie.director.repeat(2));

    // Add vote average as text signals
    const rating = parseFloat(movie.vote_average);
    if (rating >= 8.0) parts.push("masterpiece excellent acclaimed");
    else if (rating >= 7.0) parts.push("great recommended quality");
    else if (rating >= 6.0) parts.push("good average watchable");

    return parts.join(" ").toLowerCase();
  }

  /**
   * Train the engine on a dataset of movies
   */
  train(movies) {
    console.log(`🧠 Training recommendation engine on ${movies.length} movies...`);
    this.movies = movies;
    this.tfidf = new TfIdf();
    this.movieIndex.clear();
    this.vectors = [];

    movies.forEach((movie, idx) => {
      const doc = this.buildDocument(movie);
      this.tfidf.addDocument(doc);
      this.movieIndex.set(movie.id, idx);
    });

    // Pre-compute sparse vectors for all documents
    this.movies.forEach((_, idx) => {
      const vec = {};
      this.tfidf.listTerms(idx).forEach(({ term, tfidf }) => {
        vec[term] = tfidf;
      });
      this.vectors.push(vec);
    });

    this.isReady = true;
    console.log(`✅ Recommendation engine ready (${movies.length} movies indexed)`);
  }

  /**
   * Compute cosine similarity between two sparse vectors
   */
  cosineSimilarity(vecA, vecB) {
    const keysA = Object.keys(vecA);
    if (!keysA.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const key of keysA) {
      const a = vecA[key] || 0;
      const b = vecB[key] || 0;
      dotProduct += a * b;
      magnitudeA += a * a;
    }

    for (const val of Object.values(vecB)) {
      magnitudeB += val * val;
    }

    const denom = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  /**
   * Get recommendations for a specific movie by ID
   * Returns top N most similar movies
   */
  recommendByMovie(movieId, topN = 12) {
    if (!this.isReady) return [];

    const idx = this.movieIndex.get(movieId);
    if (idx === undefined) return [];

    const targetVec = this.vectors[idx];
    const scores = [];

    this.movies.forEach((movie, i) => {
      if (i === idx) return; // Skip self
      const similarity = this.cosineSimilarity(targetVec, this.vectors[i]);
      scores.push({ movie, similarity });
    });

    return scores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(({ movie, similarity }) => ({ ...movie, similarity_score: similarity }));
  }

  /**
   * Get recommendations based on a text query
   * Creates a virtual document and finds most similar movies
   */
  recommendByQuery(query, topN = 12) {
    if (!this.isReady || !query) return [];

    const queryVec = {};
    const tempTfidf = new TfIdf();

    // Add all existing docs + the query as the last one
    this.movies.forEach((_, idx) => {
      tempTfidf.addDocument(
        this.tfidf.listTerms(idx).map((t) => t.term).join(" ")
      );
    });
    tempTfidf.addDocument(query.toLowerCase());

    const queryIdx = this.movies.length;
    tempTfidf.listTerms(queryIdx).forEach(({ term, tfidf }) => {
      queryVec[term] = tfidf;
    });

    const scores = this.movies.map((movie, i) => ({
      movie,
      similarity: this.cosineSimilarity(queryVec, this.vectors[i]),
    }));

    return scores
      .filter((s) => s.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(({ movie, similarity }) => ({ ...movie, similarity_score: similarity }));
  }

  /**
   * Personalized recommendations based on user's watch history
   * Averages vectors of watched movies to build a taste profile
   */
  recommendPersonalized(watchedMovieIds, topN = 20) {
    if (!this.isReady || !watchedMovieIds.length) return [];

    // Build a "taste vector" by averaging watched movie vectors
    const tasteVec = {};
    let validCount = 0;

    for (const movieId of watchedMovieIds) {
      const idx = this.movieIndex.get(movieId);
      if (idx === undefined) continue;
      const vec = this.vectors[idx];
      for (const [term, val] of Object.entries(vec)) {
        tasteVec[term] = (tasteVec[term] || 0) + val;
      }
      validCount++;
    }

    if (validCount === 0) return [];

    // Normalize by count
    for (const term in tasteVec) {
      tasteVec[term] /= validCount;
    }

    const watchedSet = new Set(watchedMovieIds);

    return this.movies
      .filter((m) => !watchedSet.has(m.id))
      .map((movie, i) => ({
        movie,
        similarity: this.cosineSimilarity(tasteVec, this.vectors[i]),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(({ movie, similarity }) => ({ ...movie, similarity_score: similarity }));
  }

  /**
   * Recommend movies by genre preference
   */
  recommendByGenres(genreIds, topN = 15) {
    if (!this.isReady) return [];

    const genreMap = {
      28: "action", 12: "adventure", 16: "animation", 35: "comedy",
      80: "crime", 18: "drama", 27: "horror", 10749: "romance",
      878: "sciencefiction", 53: "thriller", 37: "western",
    };

    const queryTerms = genreIds.map((id) => genreMap[id] || "").filter(Boolean);
    if (!queryTerms.length) return [];

    return this.recommendByQuery(queryTerms.join(" "), topN);
  }

  getStats() {
    return {
      isReady: this.isReady,
      totalMovies: this.movies.length,
      indexedMovies: this.movieIndex.size,
    };
  }
}

// Export singleton instance
module.exports = new RecommendationEngine();
