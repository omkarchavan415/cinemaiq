/**
 * HeroSection Component
 * Full-bleed featured movie banner with trailer button and info
 */

import React, { useState, useEffect } from "react";
import { Play, Plus, Check, Info, Star, Volume2, VolumeX } from "lucide-react";
import useStore from "../context/store";

export default function HeroSection({ movies = [] }) {
  const { openModal, toggleWatchlist, isInWatchlist, addToViewed } = useStore();
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [fading, setFading] = useState(false);

  // Auto-rotate hero every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % Math.min(movies.length, 5));
        setFading(false);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies.length) return <HeroSkeleton />;

  const movie = movies[current];
  const inWatchlist = isInWatchlist(movie.id);
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const overview =
    movie.overview?.length > 200
      ? movie.overview.slice(0, 200) + "…"
      : movie.overview;

  const handlePlay = () => {
    addToViewed(movie);
    openModal(movie);
  };

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Backdrop Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        {movie.backdrop_path ? (
          <img
            src={movie.backdrop_path}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f]" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-48 hero-bottom-gradient" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end pb-16 sm:pb-20 px-6 sm:px-12 lg:px-20 transition-opacity duration-500 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="max-w-2xl">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {movie.media_type === "tv" && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-wider">
                TV Series
              </span>
            )}
            {rating && (
              <div className="rating-badge">
                <Star size={12} fill="#f5c518" />
                {rating}
              </div>
            )}
            {year && (
              <span className="text-white/50 text-sm">{year}</span>
            )}
            {movie.adult === false && (
              <span className="px-1.5 py-0.5 border border-white/30 text-white/50 text-xs rounded">
                PG-13
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-4 leading-none"
            style={{ letterSpacing: "0.05em", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}
          >
            {movie.title}
          </h1>

          {/* Overview */}
          <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-xl drop-shadow-lg">
            {overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handlePlay} className="btn-primary">
              <Play size={18} fill="white" />
              Watch Now
            </button>

            <button
              onClick={() => toggleWatchlist(movie)}
              className="btn-secondary"
            >
              {inWatchlist ? (
                <>
                  <Check size={18} /> In My List
                </>
              ) : (
                <>
                  <Plus size={18} /> My List
                </>
              )}
            </button>

            <button
              onClick={() => openModal(movie)}
              className="btn-secondary hidden sm:flex"
            >
              <Info size={18} /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Mute button */}
      <button
        onClick={() => setMuted((v) => !v)}
        className="absolute bottom-20 right-8 sm:right-16 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white transition-all glass"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Slide Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 300); }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-[#e50914]" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-[#12121a]">
      <div className="skeleton absolute inset-0" />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-16 left-8 sm:left-16 space-y-4 max-w-xl">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-16 w-80 rounded" />
        <div className="skeleton h-4 w-96 rounded" />
        <div className="skeleton h-4 w-72 rounded" />
        <div className="flex gap-3 mt-8">
          <div className="skeleton h-12 w-32 rounded-md" />
          <div className="skeleton h-12 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
