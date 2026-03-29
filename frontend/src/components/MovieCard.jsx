/**
 * MovieCard Component
 * Responsive card with lazy image, hover overlay, ratings, watchlist toggle
 */

import React, { useState } from "react";
import { Play, Plus, Check, Star, Info } from "lucide-react";
import useStore from "../context/store";
import { useLazyImage } from "../hooks";

export default function MovieCard({ movie, compact = false, onClick }) {
  const { openModal, toggleWatchlist, isInWatchlist, addToViewed } = useStore();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const inWatchlist = isInWatchlist(movie.id);
  const { loaded } = useLazyImage(movie.poster_path);

  const handleCardClick = () => {
    addToViewed(movie);
    if (onClick) onClick(movie);
    openModal(movie);
  };

  const handleWatchlist = async (e) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    await toggleWatchlist(movie);
    setAdding(false);
  };

  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const cardWidth = compact ? "w-[140px]" : "w-[180px] sm:w-[200px]";
  const imgHeight = compact ? "h-[210px]" : "h-[270px] sm:h-[300px]";

  return (
    <div
      className={`movie-card ${cardWidth} cursor-pointer select-none`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      {/* Poster */}
      <div className={`relative ${imgHeight} bg-[#1a1a24] overflow-hidden rounded-t-lg`}>
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } ${hovered ? "scale-110" : "scale-100"}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a24] to-[#2a2a3a]">
            <span className="text-white/20 text-4xl font-display tracking-widest">
              {movie.title?.[0] || "?"}
            </span>
          </div>
        )}

        {!loaded && movie.poster_path && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-between p-3 transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          }}
        >
          {/* Top: Watchlist button */}
          <div className="flex justify-end">
            <button
              onClick={handleWatchlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                inWatchlist
                  ? "bg-[#e50914] text-white"
                  : "bg-white/20 text-white hover:bg-white/40"
              }`}
            >
              {adding ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : inWatchlist ? (
                <Check size={14} />
              ) : (
                <Plus size={14} />
              )}
            </button>
          </div>

          {/* Bottom: Actions + info */}
          <div>
            {!compact && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-black text-xs font-bold rounded transition-all hover:bg-white/90"
                >
                  <Play size={12} fill="black" /> Play
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  className="p-1.5 bg-white/20 text-white rounded hover:bg-white/30 transition-all"
                >
                  <Info size={14} />
                </button>
              </div>
            )}

            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-1 mb-1">
                <Star size={11} fill="#f5c518" color="#f5c518" />
                <span className="text-white text-xs font-semibold">{rating}</span>
                {year && (
                  <span className="text-white/40 text-xs ml-1">· {year}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media type badge */}
        {movie.media_type === "tv" && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded">
            TV
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-2.5 bg-[#1a1a24] rounded-b-lg">
        <p className="text-white text-xs font-semibold truncate leading-tight">
          {movie.title}
        </p>
        {!compact && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/40 text-[11px]">{year || "—"}</span>
            {rating && (
              <span className="text-[#f5c518] text-[11px] font-semibold flex items-center gap-0.5">
                <Star size={9} fill="#f5c518" />
                {rating}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
