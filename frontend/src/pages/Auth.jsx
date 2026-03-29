/**
 * Auth Pages: Login + Register
 */

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import useStore from "../context/store";

function AuthInput({ icon: Icon, type, placeholder, value, onChange, ...rest }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="relative">
      <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 z-10" style={{ color: "rgba(255,255,255,0.4)" }} />
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          paddingLeft: "44px",
          paddingRight: type === "password" ? "44px" : "16px",
          paddingTop: "14px",
          paddingBottom: "14px",
          backgroundColor: "rgba(255,255,255,0.07)",
          border: `1.5px solid ${focused ? "#e50914" : "rgba(255,255,255,0.12)"}`,
          borderRadius: "12px",
          color: "#ffffff",
          fontSize: "14px",
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "inherit",
          boxSizing: "border-box",
          WebkitTextFillColor: "#ffffff",
          caretColor: "#ffffff",
        }}
        {...rest}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            padding: "0",
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const demoLogin = async () => {
    setEmail("demo@cinemaiq.com");
    setPassword("demo123456");
    setError("");
    setLoading(true);
    try {
      await login("demo@cinemaiq.com", "demo123456");
      navigate("/");
    } catch {
      setError("Demo account not available. Please register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="font-display text-4xl text-white mb-2" style={{ letterSpacing: "0.05em" }}>
        Welcome Back
      </h2>
      <p className="text-white/40 mb-8 text-sm">Sign in to your CinemaIQ account</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-white/10" />
        <span className="text-white/20 text-xs">OR</span>
        <hr className="flex-1 border-white/10" />
      </div>

      <button
        onClick={demoLogin}
        disabled={loading}
        className="w-full py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-sm font-medium rounded-xl transition-all"
      >
        Try Demo Account
      </button>

      <p className="text-center text-white/40 text-sm mt-6">
        New to CinemaIQ?{" "}
        <Link to="/register" className="text-[#e50914] hover:text-red-400 font-semibold transition-colors">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="font-display text-4xl text-white mb-2" style={{ letterSpacing: "0.05em" }}>
        Join CinemaIQ
      </h2>
      <p className="text-white/40 mb-8 text-sm">Create your free account today</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={User}
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
        </button>
      </form>

      <p className="text-center text-white/40 text-sm mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[#e50914] hover:text-red-400 font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}

// ─── Shared Auth Layout ───────────────────────────────────────────────────────
function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#e50914]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#e50914]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span
              className="font-display text-4xl tracking-widest"
              style={{ color: "#e50914", letterSpacing: "0.15em" }}
            >
              CINEMA
            </span>
            <span
              className="font-display text-4xl text-white tracking-widest"
              style={{ letterSpacing: "0.15em" }}
            >
              IQ
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(18,18,26,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "36px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
