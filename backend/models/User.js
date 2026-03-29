/**
 * User Model
 * Stores authentication data, watchlist, search history, and preferences
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: "", // URL to avatar image
    },
    preferences: {
      favoriteGenres: [{ type: Number }], // TMDB genre IDs
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
    },
    watchlist: [
      {
        movieId: { type: Number, required: true },
        title: String,
        poster: String,
        mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    recentlyViewed: [
      {
        movieId: { type: Number, required: true },
        title: String,
        poster: String,
        mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    searchHistory: [
      {
        query: String,
        searchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Add to Recently Viewed ─────────────────────────────────
userSchema.methods.addToRecentlyViewed = async function (movie) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(
    (m) => m.movieId !== movie.movieId
  );
  // Add to front
  this.recentlyViewed.unshift(movie);
  // Keep only last 20
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  return await this.save();
};

// ─── Instance Method: Toggle Watchlist ────────────────────────────────────────
userSchema.methods.toggleWatchlist = async function (movie) {
  const idx = this.watchlist.findIndex((m) => m.movieId === movie.movieId);
  if (idx > -1) {
    this.watchlist.splice(idx, 1);
    await this.save();
    return { action: "removed", watchlist: this.watchlist };
  } else {
    this.watchlist.unshift(movie);
    await this.save();
    return { action: "added", watchlist: this.watchlist };
  }
};

module.exports = mongoose.model("User", userSchema);
