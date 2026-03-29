/**
 * Custom React Hooks
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { moviesAPI, recommendAPI } from "../utils/api";

// ─── Debounce Hook ────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Infinite Scroll Hook ─────────────────────────────────────────────────────
export function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore) return;
      observerRef.current = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) callback(); },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [callback, hasMore]
  );
  return sentinelRef;
}

// ─── Lazy Image Hook ──────────────────────────────────────────────────────────
export function useLazyImage(src) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);

  return { loaded, error, imgRef };
}

// ─── Movies Fetch Hook ────────────────────────────────────────────────────────
export function useMovies(type = "popular") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchers = {
      popular: () => moviesAPI.getPopular(3),
      trending: () => moviesAPI.getTrending(),
      topRated: () => moviesAPI.getTopRated(),
      tvTopRated: () => moviesAPI.getTopRated("tv"),
    };

    const fetch = fetchers[type] || fetchers.popular;

    fetch()
      .then((res) => {
        if (!cancelled) setData(res.results || []);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [type]);

  return { data, loading, error };
}

// ─── Search Hook ──────────────────────────────────────────────────────────────
export function useSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery?.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    moviesAPI
      .search(debouncedQuery)
      .then((res) => { if (!cancelled) setResults(res.results || []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { results, loading };
}

// ─── Movie Details Hook ───────────────────────────────────────────────────────
export function useMovieDetails(id, mediaType = "movie") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setData(null);

    moviesAPI
      .getDetails(id, mediaType)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id, mediaType]);

  return { data, loading, error };
}

// ─── Recommendations Hook ─────────────────────────────────────────────────────
export function useRecommendations(movieId) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    let cancelled = false;
    setLoading(true);

    recommendAPI
      .byMovie(movieId)
      .then((res) => { if (!cancelled) setRecs(res.recommendations || []); })
      .catch(() => { if (!cancelled) setRecs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [movieId]);

  return { recs, loading };
}

// ─── Scroll to hide navbar ────────────────────────────────────────────────────
export function useScrollNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
}
