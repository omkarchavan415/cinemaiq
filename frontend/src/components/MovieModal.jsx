/**
 * MovieModal Component
 * Full details popup with YouTube trailer, cast, ratings, similar movies
 */

import React, { useEffect, useCallback } from "react";
import {
  X, Play, Plus, Check, Star, Calendar, Clock, Globe,
  Users, Film, ExternalLink, ChevronRight,
} from "lucide-react";
import useStore from "../context/store";
import { useMovieDetails, useRecommendations } from "../hooks";
import MovieCard from "./MovieCard";

export default function MovieModal() {
  const { selectedMovie, isModalOpen, closeModal, toggleWatchlist, isInWatchlist } = useStore();

  const { data: movie, loading } = useMovieDetails(
    isModalOpen ? selectedMovie?.id : null,
    selectedMovie?.media_type
  );
  const { recs } = useRecommendations(isModalOpen ? selectedMovie?.id : null);

  const inWatchlist = isInWatchlist(selectedMovie?.id);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Escape") closeModal(); },
    [closeModal]
  );

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, handleKeyDown]);

  if (!isModalOpen || !selectedMovie) return null;

  const displayMovie = movie || selectedMovie;
  const rating = displayMovie.vote_average
    ? Number(displayMovie.vote_average).toFixed(1)
    : null;
  const year = displayMovie.release_date
    ? new Date(displayMovie.release_date).getFullYear()
    : null;
  const genres = displayMovie.genres?.map((g) => g.name) || [];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#12121a] shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-white hover:bg-black transition-all"
        >
          <X size={20} />
        </button>

        {/* Backdrop / Trailer */}
        <div className="relative w-full aspect-video bg-[#0a0a0f] overflow-hidden rounded-t-2xl">
          {loading ? (
            <div className="skeleton w-full h-full" />
          ) : movie?.trailer_key ? (
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&mute=1&controls=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={displayMovie.title}
            />
          ) : displayMovie.backdrop_path ? (
            <img
              src={displayMovie.backdrop_path}
              alt={displayMovie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f]">
              <Film size={64} className="text-white/10" />
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#12121a] to-transparent" />
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-10">
          {/* Title + Meta */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6 -mt-2">
            <div className="flex-1">
              <h2
                className="font-display text-3xl sm:text-4xl text-white leading-tight mb-2"
                style={{ letterSpacing: "0.04em" }}
              >
                {displayMovie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {rating && (
                  <div className="rating-badge">
                    <Star size={13} fill="#f5c518" />
                    {rating}
                    <span className="text-white/30 text-xs ml-1">
                      ({displayMovie.vote_count?.toLocaleString()})
                    </span>
                  </div>
                )}
                {year && (
                  <span className="text-white/50 flex items-center gap-1">
                    <Calendar size={13} /> {year}
                  </span>
                )}
                {displayMovie.runtime && (
                  <span className="text-white/50 flex items-center gap-1">
                    <Clock size={13} /> {Math.floor(displayMovie.runtime / 60)}h{" "}
                    {displayMovie.runtime % 60}m
                  </span>
                )}
                {displayMovie.original_language && (
                  <span className="text-white/50 flex items-center gap-1 uppercase">
                    <Globe size={13} /> {displayMovie.original_language}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {movie?.trailer_key && (
                <a
                  href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Play size={16} fill="white" /> Trailer
                  <ExternalLink size={13} className="opacity-60" />
                </a>
              )}
              <button
                onClick={() => toggleWatchlist(displayMovie)}
                className="btn-secondary"
              >
                {inWatchlist ? (
                  <><Check size={16} /> Saved</>
                ) : (
                  <><Plus size={16} /> My List</>
                )}
              </button>
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/8 border border-white/10 text-white/70"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          {displayMovie.overview && (
            <p className="text-white/75 leading-relaxed mb-8 text-sm sm:text-base">
              {displayMovie.overview}
            </p>
          )}

          {/* Director + Cast */}
          {!loading && movie && (
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {movie.director && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
                    Director
                  </p>
                  <p className="text-white font-semibold">{movie.director}</p>
                </div>
              )}

              {movie.cast?.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users size={13} /> Cast
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {movie.cast.slice(0, 8).map((actor) => (
                      <div key={actor.id} className="shrink-0 text-center w-16">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1a1a24] mx-auto mb-1.5">
                          {actor.profile ? (
                            <img
                              src={actor.profile}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xl font-display">
                              {actor.name[0]}
                            </div>
                          )}
                        </div>
                        <p className="text-white text-[10px] font-semibold truncate">
                          {actor.name}
                        </p>
                        <p className="text-white/30 text-[9px] truncate">
                          {actor.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar / Recommended */}
          {recs.length > 0 && (
            <div>
              <h3 className="section-title mb-4 flex items-center gap-2">
                <ChevronRight size={20} className="text-[#e50914]" />
                More Like This
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-3 scroll-row">
                {recs.slice(0, 10).map((rec) => (
                  <MovieCard key={rec.id} movie={rec} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
