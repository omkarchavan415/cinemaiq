
/**
 * CinemaIQ App
 * Main router and layout
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MovieModal from "./components/MovieModal";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import { LoginPage, RegisterPage } from "./pages/Auth";
import { BrowsePage, SearchPage, WatchlistPage, HistoryPage } from "./pages/Browse";
import useStore from "./context/store";
import "./styles/globals.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { theme, isAuthenticated, refreshUser } = useStore();

  // Apply theme to root
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  // Refresh user session on mount
  useEffect(() => {
    if (isAuthenticated) refreshUser();
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/movies" element={<BrowsePage type="movies" />} />
          <Route path="/browse/tv" element={<BrowsePage type="tv" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Movie Modal */}
      <MovieModal />

      {/* Footer Signature */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
