/**
 * Home Page
 * Main landing page with Hero, horizontal rows, personalized recs
 */

import React, { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import MovieRow from "../components/MovieRow";
import { useMovies } from "../hooks";
import { moviesAPI, recommendAPI } from "../utils/api";
import useStore from "../context/store";

export default function HomePage() {
  const { user, isAuthenticated, recentlyViewed } = useStore();
  const { data: trending, loading: trendingLoading } = useMovies("trending");
  const { data: topRated, loading: topRatedLoading } = useMovies("topRated");
  const { data: popular, loading: popularLoading } = useMovies("popular");
  const { data: tvTopRated, loading: tvLoading } = useMovies("tvTopRated");

  const [actionMovies, setActionMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [personalRecs, setPersonalRecs] = useState([]);
  const [personalBasedOn, setPersonalBasedOn] = useState("");
  const [loadingPersonal, setLoadingPersonal] = useState(false);

  // Fetch genre-specific rows
  useEffect(() => {
    moviesAPI.getByGenre(28).then((res) => setActionMovies(res.results || [])).catch(() => {});
    moviesAPI.getByGenre(18).then((res) => setDramaMovies(res.results || [])).catch(() => {});
  }, []);

  // Personalized recs if logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingPersonal(true);
    recommendAPI
      .personalized()
      .then((res) => {
        setPersonalRecs(res.recommendations || []);
        setPersonalBasedOn(res.based_on || "");
      })
      .catch(() => {})
      .finally(() => setLoadingPersonal(false));
  }, [isAuthenticated]);

  // Hero uses trending movies
  const heroMovies = trending.slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero Banner */}
      <HeroSection movies={heroMovies} />

      {/* Content Rows */}
      <div className="relative z-10 -mt-8 space-y-2">

        {/* Personalized Recommendations */}
        {isAuthenticated && (personalRecs.length > 0 || loadingPersonal) && (
          <MovieRow
            title={personalBasedOn ? `Because You Watched: ${personalBasedOn}` : "Recommended For You"}
            movies={personalRecs}
            loading={loadingPersonal}
            icon="recommended"
            accent
          />
        )}

        {/* Trending */}
        <MovieRow
          title="Trending Now"
          movies={trending}
          loading={trendingLoading}
          icon="trending"
        />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <MovieRow
            title="Recently Viewed"
            movies={recentlyViewed.map((m) => ({
              id: m.movieId,
              title: m.title,
              poster_path: m.poster,
              media_type: m.mediaType,
            }))}
            icon="recent"
          />
        )}

        {/* Top Rated Movies */}
        <MovieRow
          title="Top Rated Movies"
          movies={topRated}
          loading={topRatedLoading}
          icon="topRated"
        />

        {/* Popular */}
        <MovieRow
          title="Popular on CinemaIQ"
          movies={popular}
          loading={popularLoading}
          icon="trending"
        />

        {/* Action */}
        <MovieRow
          title="Action & Adventure"
          movies={actionMovies}
          loading={!actionMovies.length}
          icon="trending"
        />

        {/* Top Rated TV */}
        <MovieRow
          title="Top Rated TV Shows"
          movies={tvTopRated}
          loading={tvLoading}
          icon="topRated"
        />

        {/* Drama */}
        <MovieRow
          title="Critically Acclaimed Dramas"
          movies={dramaMovies}
          loading={!dramaMovies.length}
          icon="recommended"
        />

        {/* User Watchlist preview */}
        {isAuthenticated && user?.watchlist?.length > 0 && (
          <MovieRow
            title="My Watchlist"
            movies={user.watchlist.slice(0, 20).map((m) => ({
              id: m.movieId,
              title: m.title,
              poster_path: m.poster,
              media_type: m.mediaType,
            }))}
            icon="watchlist"
          />
        )}
      </div>

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  );
}
