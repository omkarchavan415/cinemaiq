/**
 * MovieRow Component
 * Horizontal scrollable row with arrow navigation
 */

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Star, Zap, Clock, Heart } from "lucide-react";
import MovieCard from "./MovieCard";

const ICON_MAP = {
  trending: TrendingUp,
  topRated: Star,
  recommended: Zap,
  recent: Clock,
  watchlist: Heart,
};

export default function MovieRow({
  title,
  movies = [],
  loading = false,
  icon = "trending",
  accent = false,
}) {
  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 20);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  const Icon = ICON_MAP[icon] || TrendingUp;

  if (!loading && movies.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-6 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={accent ? "text-[#e50914]" : "text-[#f5c518]"}
          />
          <h2 className="section-title">{title}</h2>
          {!loading && movies.length > 0 && (
            <span className="text-white/30 text-sm font-body hidden sm:block">
              {movies.length} titles
            </span>
          )}
        </div>

        {/* Navigation arrows (desktop) */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!showLeft}
            className={`p-2 rounded-full border transition-all ${
              showLeft
                ? "border-white/20 text-white/70 hover:border-white hover:text-white"
                : "border-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!showRight}
            className={`p-2 rounded-full border transition-all ${
              showRight
                ? "border-white/20 text-white/70 hover:border-white hover:text-white"
                : "border-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative">
        {/* Left fade */}
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--bg), transparent)" }}
          />
        )}

        {/* Right fade */}
        {showRight && (
          <div className="absolute right-0 top-0 bottom-4 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
          />
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="scroll-row px-6 sm:px-12 lg:px-20"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="w-[180px] sm:w-[200px] shrink-0">
      <div className="skeleton w-full h-[270px] sm:h-[300px] rounded-t-lg" />
      <div className="bg-[#1a1a24] rounded-b-lg p-2.5 space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2 w-1/2 rounded" />
      </div>
    </div>
  );
}
