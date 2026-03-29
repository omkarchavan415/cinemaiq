/**
 * Navbar Component
 * Sticky nav with scroll-aware background, search, auth, theme toggle
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User, LogOut, Heart, Clock, Sun, Moon, X, Menu } from "lucide-react";
import useStore from "../context/store";
import { useSearch, useScrollNav, useDebounce } from "../hooks";
import MovieCard from "./MovieCard";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, theme, toggleTheme } = useStore();
  const scrolled = useScrollNav();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);

  const { results, loading } = useSearch(query);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
    setMenuOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "bg-gradient-to-b from-black/60 to-transparent"
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex items-center">
                <span
                  className="font-display text-3xl tracking-widest"
                  style={{ color: "#e50914", letterSpacing: "0.15em" }}
                >
                  CINEMA
                </span>
                <span
                  className="font-display text-3xl tracking-widest text-white"
                  style={{ letterSpacing: "0.15em" }}
                >
                  IQ
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { to: "/", label: "Home" },
                { to: "/browse/movies", label: "Movies" },
                { to: "/browse/tv", label: "TV Shows" },
                { to: "/watchlist", label: "My List" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium transition-colors duration-200 ${location.pathname === to
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                    }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all relative"
                    >
                      <Bell size={20} />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e50914] rounded-full" />
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-white/10">
                          <p className="text-white font-semibold text-sm">Notifications</p>
                        </div>
                        {[
                          { icon: "🎬", text: "New trending movies added", time: "2m ago" },
                          { icon: "⭐", text: "Top rated list updated", time: "1h ago" },
                          { icon: "🤖", text: "AI recommendations ready", time: "3h ago" },
                          { icon: "🎭", text: "New TV shows this week", time: "1d ago" },
                        ].map((n, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer"
                            onClick={() => setNotifOpen(false)}
                          >
                            <span className="text-lg mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-sm">{n.text}</p>
                              <p className="text-white/30 text-xs mt-0.5">{n.time}</p>
                            </div>
                            {i === 0 && (
                              <span className="w-2 h-2 bg-[#e50914] rounded-full mt-1.5 shrink-0" />
                            )}
                          </div>
                        ))}
                        <div className="px-4 py-2 border-t border-white/10">
                          <p
                            className="text-[#e50914] text-xs font-semibold cursor-pointer hover:text-red-400 transition-colors"
                            onClick={() => setNotifOpen(false)}
                          >
                            Mark all as read
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="hidden sm:block text-sm text-white/80 max-w-[100px] truncate">
                        {user?.name}
                      </span>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                          <p className="text-white/40 text-xs truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/watchlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Heart size={16} /> My Watchlist
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Clock size={16} /> Watch History
                        </Link>
                        <hr className="border-white/10 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-all"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:block text-sm text-white/70 hover:text-white px-3 py-1.5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold text-white px-4 py-1.5 bg-[#e50914] hover:bg-[#f40612] rounded-md transition-all"
                  >
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden p-2 text-white/70 hover:text-white"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-3 animate-slide-up">
            {[
              { to: "/", label: "Home" },
              { to: "/browse/movies", label: "Movies" },
              { to: "/browse/tv", label: "TV Shows" },
              { to: "/watchlist", label: "My List" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block py-2 text-white/70 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="max-w-3xl mx-auto w-full px-6 pt-24">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search
                size={22}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, actors..."
                className="w-full pl-14 pr-14 py-5 bg-white/10 border border-white/20 rounded-2xl text-white text-lg placeholder-white/30 outline-none focus:border-[#e50914] transition-all"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </form>

            {/* Results */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pb-4">
                {results.slice(0, 8).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    compact
                    onClick={() => setSearchOpen(false)}
                  />
                ))}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No results for "{query}"</p>
              </div>
            )}

            {!query && (
              <div className="text-center py-12 text-white/30">
                <p>Start typing to search for movies and TV shows</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(profileOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setProfileOpen(false); setNotifOpen(false); }}
        />
      )}
    </>
  );
}
