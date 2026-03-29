# 🎬 CinemaIQ — Netflix-Level Movie Recommendation System

> An AI-powered, full-stack movie & TV series recommendation platform built with React, Node.js, MongoDB, and Machine Learning (TF-IDF + Cosine Similarity).

---

## 📁 Project Structure

```
cinemaiq/
├── backend/                      # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── ml/
│   │   └── recommendationEngine.js  # TF-IDF + Cosine Similarity ML engine
│   ├── models/
│   │   └── User.js               # MongoDB User schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth (login, register, me)
│   │   ├── movies.js             # /api/movies (TMDB proxy)
│   │   ├── recommend.js          # /api/recommend (ML endpoints)
│   │   └── user.js               # /api/user (watchlist, history)
│   ├── services/
│   │   └── tmdbService.js        # TMDB API integration + caching
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml               # Render.com deployment config
│   └── server.js                 # Express app entry point
│
└── frontend/                     # React + Tailwind CSS
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── HeroSection.jsx   # Full-bleed hero banner
    │   │   ├── MovieCard.jsx     # Hover-animated movie card
    │   │   ├── MovieModal.jsx    # Details popup + YouTube trailer
    │   │   ├── MovieRow.jsx      # Horizontal scroll row
    │   │   └── Navbar.jsx        # Sticky nav + search overlay
    │   ├── context/
    │   │   └── store.js          # Zustand global state
    │   ├── hooks/
    │   │   └── index.js          # Custom React hooks
    │   ├── pages/
    │   │   ├── Auth.jsx          # Login + Register
    │   │   ├── Browse.jsx        # Browse, Search, Watchlist, History
    │   │   └── Home.jsx          # Main homepage
    │   ├── styles/
    │   │   └── globals.css       # Global styles + Tailwind
    │   ├── utils/
    │   │   └── api.js            # Axios API client
    │   ├── App.jsx               # Router + layout
    │   └── index.js              # React entry point
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vercel.json               # Vercel deployment config
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (Atlas free tier or local)
- **TMDB API Key** (free at themoviedb.org)
- **Git**

---

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/cinemaiq.git
cd cinemaiq

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Get a Free TMDB API Key

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create a free account
3. Go to **Settings → API**
4. Click **"Create"** and choose **"Developer"**
5. Copy your **API Key (v3 auth)**

---

### Step 3: Set Up MongoDB Atlas (Free)

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and click **"Build a Database"**
3. Choose **Free (M0)** tier → choose a region → **Create**
4. Set a username and password (save these!)
5. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development
6. Click **Connect → Drivers → Copy** the connection string
7. Replace `<password>` with your actual password in the URI

---

### Step 4: Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Your MongoDB Atlas URI
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/cinemaiq?retryWrites=true&w=majority

# Generate a secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_secret_here
JWT_EXPIRES_IN=7d

# Your TMDB API Key
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

---

### Step 5: Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB connected
🚀 CinemaIQ Backend running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
The app opens at [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Reference

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Popular movies (paginated) |
| GET | `/api/movies/trending` | Trending movies & TV |
| GET | `/api/movies/top-rated` | Top rated by media type |
| GET | `/api/movies/search?q=query` | Search with TMDB |
| GET | `/api/movies/genres` | Genre list |
| GET | `/api/movies/genre/:id` | Movies by genre |
| GET | `/api/movies/:id` | Full movie details + cast + trailer |

### Recommendations (ML)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommend/movie/:id` | Similar movies (TF-IDF) |
| GET | `/api/recommend/query?q=query` | Semantic search recs |
| GET | `/api/recommend/personalized` | User taste profile recs 🔒 |
| GET | `/api/recommend/genres?ids=28,18` | By genre preference |
| GET | `/api/recommend/stats` | ML engine statistics |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | Get current user 🔒 |

### User (🔒 = Requires Bearer JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/watchlist/toggle` | Add/remove from watchlist 🔒 |
| GET | `/api/user/watchlist` | Get watchlist 🔒 |
| POST | `/api/user/viewed` | Log recently viewed 🔒 |
| PUT | `/api/user/preferences` | Update genre prefs + theme 🔒 |

---

## 🤖 ML Recommendation Engine

The engine (`backend/ml/recommendationEngine.js`) implements **content-based filtering**:

1. **Data Collection**: Fetches 1,000+ movies from TMDB API across multiple pages
2. **Feature Engineering**: Builds rich text documents per movie combining:
   - Title (3× weight boost)
   - Overview
   - Genres (2× weight boost)
   - Keywords, Cast, Director
   - Quality signals (8.0+ = "masterpiece acclaimed")
3. **TF-IDF Vectorization**: Uses `natural` library to compute term frequency × inverse document frequency
4. **Cosine Similarity**: Finds most similar movies by computing:
   ```
   similarity = (A · B) / (||A|| × ||B||)
   ```
5. **Personalization**: Averages TF-IDF vectors of user's watch history to build a "taste profile vector" and finds closest unseen movies

---

## 🎨 Frontend Architecture

- **State**: Zustand with localStorage persistence (auth, watchlist, recently viewed, theme)
- **Data Fetching**: Custom hooks + Axios client with JWT interceptor
- **Animations**: Pure CSS transitions + `framer-motion` for modals
- **Infinite Scroll**: `IntersectionObserver` via custom `useInfiniteScroll` hook
- **Search**: Debounced (400ms) with live suggestions overlay
- **Images**: Lazy loading via `IntersectionObserver` + fade-in on load
- **Routing**: React Router v6 with protected routes

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `REACT_APP_API_URL` = your Render backend URL (e.g. `https://cinemaiq-api.onrender.com/api`)

### Backend → Render.com

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo → select `backend/` as root
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. Add environment variables (MONGODB_URI, JWT_SECRET, TMDB_API_KEY, FRONTEND_URL)
7. Deploy!

---

## 🔧 Performance Optimizations

- **Caching**: `node-cache` with 10-min TTL for dynamic data, 1-hour for static
- **Parallel Fetching**: `Promise.allSettled` for multi-page TMDB requests
- **Rate Limiting**: 200 req/15min per IP via `express-rate-limit`
- **Compression**: gzip via `compression` middleware
- **Image Lazy Loading**: IntersectionObserver-based fade-in
- **Debounced Search**: 400ms debounce prevents excessive API calls
- **ML Pre-computation**: TF-IDF vectors pre-computed at startup and cached

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| ML | TF-IDF (natural.js), Cosine Similarity |
| Auth | JWT + bcryptjs |
| API | TMDB API |
| Caching | node-cache |
| Deployment | Vercel (FE) + Render (BE) |

---

## 📝 License

MIT — Free to use and modify.
