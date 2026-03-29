/**
 * Browse, Search, and Watchlist Pages
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter, Grid3X3, LayoutList, Heart, Clock, Trash2, SlidersHorizontal } from "lucide-react";
import MovieCard from "../components/MovieCard";
import MovieRow from "../components/MovieRow";
import { moviesAPI, recommendAPI } from "../utils/api";
import { useSearch, useMovies, useInfiniteScroll } from "../hooks";
import useStore from "../context/store";

// ─── Browse Page (Movies / TV) ────────────────────────────────────────────────
export function BrowsePage({ type = "movies" }) {
  const isTV = type === "tv";
  const mediaType = isTV ? "tv" : "movie";

  const { data: popular, loading: popLoading } = useMovies(isTV ? "tvTopRated" : "popular");
  const { data: topRated, loading: topLoading } = useMovies("topRated");

  const [genreMovies, setGenreMovies] = useState({});
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    moviesAPI.getGenres(mediaType).then((res) => {
      const g = (res.genres || []).slice(0, 6);
      setGenres(g);
      g.forEach((genre) => {
        moviesAPI
          .getByGenre(genre.id, mediaType)
          .then((r) =>
            setGenreMovies((prev) => ({ ...prev, [genre.id]: r.results || [] }))
          )
          .catch(() => {});
      });
    });
  }, [mediaType]);

  return (
    <div className="min-h-screen pt-20" style={{ background: "var(--bg)" }}>
      <div className="px-6 sm:px-12 lg:px-20 py-8">
        <h1
          className="font-display text-5xl text-white mb-2"
          style={{ letterSpacing: "0.08em" }}
        >
          {isTV ? "TV Shows" : "Movies"}
        </h1>
        <p className="text-white/40 mb-10">
          Explore {isTV ? "series and shows" : "films"} curated just for you
        </p>
      </div>

      <div className="space-y-4">
        <MovieRow
          title={isTV ? "Popular TV Shows" : "Popular Movies"}
          movies={popular}
          loading={popLoading}
          icon="trending"
        />
        <MovieRow
          title="Top Rated"
          movies={topRated}
          loading={topLoading}
          icon="topRated"
        />
        {genres.map((genre) => (
          <MovieRow
            key={genre.id}
            title={genre.name}
            movies={genreMovies[genre.id] || []}
            loading={!genreMovies[genre.id]}
            icon="recommended"
          />
        ))}
      </div>
      <div className="h-20" />
    </div>
  );
}

// ─── Search Results Page ──────────────────────────────────────────────────────
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const [inputVal, setInputVal] = useState(q);
  const { results, loading } = useSearch(q);
  const [mlRecs, setMlRecs] = useState([]);
  const [view, setView] = useState("grid");

  useEffect(() => { setInputVal(q); }, [q]);

  useEffect(() => {
    if (!q) return;
    recommendAPI
      .byQuery(q)
      .then((res) => setMlRecs(res.recommendations || []))
      .catch(() => {});
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() });
  };

  const allResults = q
    ? [...results, ...mlRecs.filter((m) => !results.find((r) => r.id === m.id))]
    : [];

  return (
    <div className="min-h-screen pt-24 px-6 sm:px-12 lg:px-20" style={{ background: "var(--bg)" }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mb-10">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search movies, TV shows..."
          className="search-input"
        />
        {inputVal !== q && (
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#e50914] text-white text-sm font-semibold rounded-full"
          >
            Search
          </button>
        )}
      </form>

      {q && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {loading ? "Searching…" : `${allResults.length} results for "${q}"`}
            </h2>
            {mlRecs.length > 0 && !loading && (
              <p className="text-white/30 text-xs mt-0.5">
                Including AI-powered recommendations
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { id: "grid", Icon: Grid3X3 },
              { id: "list", Icon: LayoutList },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`p-2 rounded-lg transition-all ${
                  view === id
                    ? "bg-[#e50914] text-white"
                    : "bg-white/5 text-white/40 hover:text-white"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && q && allResults.length === 0 && (
        <div className="text-center py-20">
          <Search size={60} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 text-lg">No results for "{q}"</p>
          <p className="text-white/20 text-sm mt-2">Try different keywords</p>
        </div>
      )}

      {!loading && allResults.length > 0 && (
        <div
          className={
            view === "grid"
              ? "flex flex-wrap gap-4"
              : "space-y-3 max-w-2xl"
          }
        >
          {allResults.map((movie) =>
            view === "grid" ? (
              <MovieCard key={movie.id} movie={movie} />
            ) : (
              <ListMovieCard key={movie.id} movie={movie} />
            )
          )}
        </div>
      )}

      {!q && (
        <div className="text-center py-20">
          <Search size={60} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 text-lg">What would you like to watch?</p>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}

function ListMovieCard({ movie }) {
  const { openModal, addToViewed } = useStore();
  return (
    <div
      onClick={() => { addToViewed(movie); openModal(movie); }}
      className="flex gap-4 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all cursor-pointer"
    >
      <img
        src={movie.poster_path || ""}
        alt={movie.title}
        className="w-16 h-24 object-cover rounded-lg shrink-0 bg-white/5"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate">{movie.title}</h3>
        <p className="text-white/30 text-xs mb-2">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : ""} ·{" "}
          {movie.vote_average?.toFixed(1)} ★
        </p>
        <p className="text-white/50 text-sm line-clamp-2">{movie.overview}</p>
      </div>
    </div>
  );
}

// ─── Watchlist Page ───────────────────────────────────────────────────────────
export function WatchlistPage() {
  const { watchlist, toggleWatchlist, isAuthenticated } = useStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6" style={{ background: "var(--bg)" }}>
        <Heart size={64} className="text-white/10 mb-6" />
        <h2 className="font-display text-3xl text-white mb-3" style={{ letterSpacing: "0.05em" }}>
          Your Watchlist Awaits
        </h2>
        <p className="text-white/40 mb-8 text-center max-w-sm">
          Sign in to save movies and TV shows to your personal watchlist
        </p>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 sm:px-12 lg:px-20" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl text-white" style={{ letterSpacing: "0.08em" }}>
            My List
          </h1>
          <p className="text-white/40 mt-1">{watchlist.length} titles saved</p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={64} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/30 text-lg">Your watchlist is empty</p>
          <p className="text-white/20 text-sm mt-2">
            Browse movies and click + to add them here
          </p>
          <button onClick={() => navigate("/")} className="btn-primary mt-8">
            Explore Movies
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {watchlist.map((item) => (
            <div key={item.movieId} className="relative group">
              <MovieCard
                movie={{
                  id: item.movieId,
                  title: item.title,
                  poster_path: item.poster,
                  media_type: item.mediaType,
                }}
              />
              <button
                onClick={() =>
                  toggleWatchlist({ id: item.movieId, title: item.title, poster_path: item.poster, media_type: item.mediaType })
                }
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-600"
                title="Remove from list"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="h-20" />
    </div>
  );
}

// ─── Watch History Page ───────────────────────────────────────────────────────
export function HistoryPage() {
  const { recentlyViewed } = useStore();

  return (
    <div className="min-h-screen pt-24 px-6 sm:px-12 lg:px-20" style={{ background: "var(--bg)" }}>
      <div className="mb-8">
        <h1 className="font-display text-5xl text-white" style={{ letterSpacing: "0.08em" }}>
          Watch History
        </h1>
        <p className="text-white/40 mt-1">{recentlyViewed.length} titles viewed</p>
      </div>

      {recentlyViewed.length === 0 ? (
        <div className="text-center py-24">
          <Clock size={64} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/30 text-lg">No watch history yet</p>
          <p className="text-white/20 text-sm mt-2">Movies you view will appear here</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {recentlyViewed.map((item) => (
            <div key={item.movieId} className="relative">
              <MovieCard
                movie={{
                  id: item.movieId,
                  title: item.title,
                  poster_path: item.poster,
                  media_type: item.mediaType,
                }}
              />
              <div className="mt-1 text-center">
                <span className="text-white/25 text-[10px]">
                  {new Date(item.viewedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-20" />
    </div>
  );
}
