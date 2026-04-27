# 🎬 CinemaIQ

**An AI-powered movie and TV series recommendation platform built with the MERN stack and content-based machine learning.**

🔗 **Live Demo:** [cinemaiq-git-main-chavanomkar804-7459s-projects.vercel.app](https://cinemaiq-git-main-chavanomkar804-7459s-projects.vercel.app)

---

## ✨ Features

- 🎭 **Netflix-style UI** — Hero banner, horizontal scroll rows, hover animations, dark/light theme
- 🤖 **AI Recommendations** — Content-based filtering using TF-IDF vectorization + Cosine Similarity
- 🎯 **Personalized Feed** — "Because You Watched" row built from your personal taste profile
- 🔍 **Smart Search** — Debounced live search with ML-augmented results
- 🎬 **Movie Details** — Full cast, director, genres, YouTube trailer, and similar movies
- 📋 **Watchlist** — Save movies, synced to MongoDB for logged-in users
- 🕐 **Watch History** — Recently viewed movies tracked per user
- 🔐 **Authentication** — JWT-based login/register with bcrypt password hashing
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| ML Engine | TF-IDF (natural.js), Cosine Similarity |
| Auth | JWT, bcryptjs |
| API | TMDB API (1000+ movies) |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🤖 How the ML Recommendation Engine Works

1. Fetches **1000+ movies** from MovieApi across multiple pages
2. Builds a **text document** per movie — title (3× weight), genres (2× weight), overview, cast, director
3. Applies **TF-IDF vectorization** — rare meaningful words score higher than common ones
4. Computes **Cosine Similarity** between movie vectors to find the most similar content
5. For logged-in users, **averages watched movie vectors** into a personal taste profile and finds unseen movies closest to it

---

## 🚀 Local Setup

```bash
# Clone the repo
git clone https://github.com/omkarchavan415/cinemaiq.git
cd cinemaiq

# Backend
cd backend
cp .env.example .env        # Fill in MONGODB_URI, TMDB_API_KEY, JWT_SECRET
npm install
npm run dev                  # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env        # Set REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                    # Runs on http://localhost:3000
```

---

## 👨‍💻 Author

**Omkar Chavan**
GitHub: [@omkarchavan415](https://github.com/omkarchavan415)

---

## 📄 License

© 2026 CinemaIQ by Omkar Chavan.

