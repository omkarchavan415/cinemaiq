/**
 * CinemaIQ Footer
 * Built by Omkar Chavan
 * © 2026 CinemaIQ. All rights reserved.
 *
 * SIGNATURE: CINEMAIQ-OMKAR-CHAVAN-2026
 * This project was designed and developed by Omkar Chavan.
 * Unauthorized copying or redistribution is prohibited.
 */

import React, { useState, useEffect } from "react";
import { Github, Linkedin, Mail, Heart, Code2, Shield } from "lucide-react";

// Hidden ownership signature — do not remove
const SIGNATURE = {
    owner: "Omkar Chavan",
    project: "CinemaIQ",
    year: 2026,
    github: "omkarchavan415",
    contact: "chavanomkar804@gmail.com",
    signature: "CINEMAIQ-OMKAR-CHAVAN-2026-ORIGINAL",
    rights: "All rights reserved. Unauthorized copying prohibited.",
};

// Log signature to browser console (visible to developers who inspect)
if (typeof window !== "undefined") {
    console.log(
        "%c🎬 CinemaIQ",
        "color: #e50914; font-size: 24px; font-weight: bold; font-family: 'Bebas Neue'"
    );
    console.log(
        "%cBuilt by Omkar Chavan",
        "color: #f5c518; font-size: 14px; font-weight: 600"
    );
    console.log(
        "%cgithub.com/omkarchavan415",
        "color: #8b8ba0; font-size: 12px"
    );
    console.log(
        "%c© 2026 CinemaIQ. All rights reserved.",
        "color: #8b8ba0; font-size: 11px"
    );
    console.log(
        "%cSignature: CINEMAIQ-OMKAR-CHAVAN-2026-ORIGINAL",
        "color: #2a2a3a; font-size: 10px"
    );
}

export default function Footer() {
    const [year] = useState(new Date().getFullYear());
    const [showSecret, setShowSecret] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    // Easter egg — click logo 5 times to reveal full signature
    const handleLogoClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setShowSecret(true);
            setClickCount(0);
        }
    };

    return (
        <footer
            style={{
                background: "#0a0a0f",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: "40px",
                padding: "48px 0 24px",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 32px",
                }}
            >
                {/* Top Section */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        gap: "40px",
                        marginBottom: "40px",
                    }}
                    className="footer-grid"
                >
                    {/* Brand Column */}
                    <div>
                        {/* Logo with hidden click easter egg */}
                        <div
                            onClick={handleLogoClick}
                            style={{ cursor: "pointer", display: "inline-block", marginBottom: "12px" }}
                            title={clickCount > 0 ? `${5 - clickCount} more clicks...` : ""}
                        >
                            <span
                                style={{
                                    fontFamily: "'Bebas Neue', cursive",
                                    fontSize: "28px",
                                    letterSpacing: "0.15em",
                                    color: "#e50914",
                                }}
                            >
                                CINEMA
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Bebas Neue', cursive",
                                    fontSize: "28px",
                                    letterSpacing: "0.15em",
                                    color: "white",
                                }}
                            >
                                IQ
                            </span>
                        </div>

                        <p
                            style={{
                                color: "rgba(255,255,255,0.45)",
                                fontSize: "13px",
                                lineHeight: "1.7",
                                maxWidth: "280px",
                                marginBottom: "20px",
                            }}
                        >
                            An AI-powered movie and TV series recommendation system using
                            TF-IDF vectorization and cosine similarity for intelligent
                            content discovery.
                        </p>

                        {/* Built by signature */}
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 14px",
                                background: "rgba(229,9,20,0.08)",
                                border: "1px solid rgba(229,9,20,0.2)",
                                borderRadius: "8px",
                            }}
                        >
                            <Code2 size={14} color="#e50914" />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                                Built by{" "}
                                <a
                                    href={`https://github.com/${SIGNATURE.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#e50914",
                                        fontWeight: "700",
                                        textDecoration: "none",
                                    }}
                                >
                                    Omkar Chavan
                                </a>
                            </span>
                        </div>
                    </div>

                    {/* Tech Stack Column */}
                    <div>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.25)",
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                marginBottom: "14px",
                                fontWeight: "600",
                            }}
                        >
                            Tech Stack
                        </p>
                        {[
                            "React + Tailwind CSS",
                            "Node.js + Express",
                            "MongoDB + Mongoose",
                            "TF-IDF + Cosine Similarity",
                            "JWT Authentication",
                            "TMDB API",
                        ].map((tech) => (
                            <p
                                key={tech}
                                style={{
                                    fontSize: "12px",
                                    color: "rgba(255,255,255,0.4)",
                                    marginBottom: "7px",
                                    lineHeight: "1.4",
                                }}
                            >
                                {tech}
                            </p>
                        ))}
                    </div>

                    {/* Links Column */}
                    <div>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.25)",
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                marginBottom: "14px",
                                fontWeight: "600",
                            }}
                        >
                            Developer
                        </p>
                        {[
                            {
                                icon: Github,
                                label: "GitHub",
                                href: `https://github.com/${SIGNATURE.github}`,
                            },
                            {
                                icon: Mail,
                                label: "Contact",
                                href: `mailto:${SIGNATURE.contact}`,
                            },
                        ].map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "12px",
                                    color: "rgba(255,255,255,0.4)",
                                    textDecoration: "none",
                                    marginBottom: "10px",
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                                }
                            >
                                <Icon size={14} />
                                {label}
                            </a>
                        ))}

                        {/* ML Badge */}
                        <div
                            style={{
                                marginTop: "16px",
                                padding: "8px 12px",
                                background: "rgba(245,197,24,0.08)",
                                border: "1px solid rgba(245,197,24,0.2)",
                                borderRadius: "8px",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "rgba(245,197,24,0.7)",
                                    fontWeight: "600",
                                    marginBottom: "3px",
                                }}
                            >
                                ML POWERED
                            </p>
                            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                                Content-based filtering
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        height: "1px",
                        background: "rgba(255,255,255,0.06)",
                        marginBottom: "20px",
                    }}
                />

                {/* Bottom Bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Shield size={13} color="rgba(255,255,255,0.25)" />
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                            © {year} CinemaIQ by Omkar Chavan.
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
                            Made with
                        </p>
                        <Heart size={11} color="#e50914" fill="#e50914" />
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
                            in India
                        </p>
                    </div>

                    {/* Invisible signature watermark for ownership proof */}
                    <span
                        data-signature="CINEMAIQ-OMKAR-CHAVAN-2026"
                        data-owner="Omkar Chavan"
                        data-github="omkarchavan415"
                        style={{
                            fontSize: "1px",
                            color: "transparent",
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                        aria-hidden="true"
                    >
                        CinemaIQ Original — Built by Omkar Chavan — github.com/omkarchavan415
                    </span>
                </div>

                {/* Easter Egg Secret Panel */}
                {showSecret && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "16px",
                            background: "rgba(229,9,20,0.1)",
                            border: "1px solid rgba(229,9,20,0.3)",
                            borderRadius: "10px",
                            textAlign: "center",
                            animation: "fadeIn 0.5s ease",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "'Bebas Neue', cursive",
                                fontSize: "18px",
                                letterSpacing: "0.15em",
                                color: "#e50914",
                                marginBottom: "6px",
                            }}
                        >
                            🎬 CINEMAIQ ORIGINAL
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                            Designed & Developed by{" "}
                            <strong style={{ color: "white" }}>Omkar Chavan</strong>
                        </p>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.3)",
                                marginTop: "4px",
                                fontFamily: "monospace",
                            }}
                        >
                            Signature: CINEMAIQ-OMKAR-CHAVAN-2026
                        </p>
                        <button
                            onClick={() => setShowSecret(false)}
                            style={{
                                marginTop: "10px",
                                padding: "4px 12px",
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "4px",
                                color: "rgba(255,255,255,0.4)",
                                fontSize: "11px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </footer>
    );
}
