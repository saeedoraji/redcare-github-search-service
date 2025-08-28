# GitHub Repository Search API

This project is a **NestJS-based API** for searching GitHub repositories with advanced filtering, popularity scoring, and caching.

## 🚀 How to Run the Project

1. **Clone the repository** and install dependencies:

   ```bash
   git clone
   cd <project-directory>
   yarn install
   ```

2. **Set up environment variables** (see below).

3. **Start the development server**:
   - Using Docker (recommended for development):
     ```bash
     docker compose up
     ```
   - Or locally:
     ```bash
     yarn start:dev
     ```

4. **API will be available at**:  
   `http://localhost:3000/api`

## 🌟 What Does This Project Do?

- **Search GitHub repositories** with filters for language, license, stars, last update, etc.
- **Popularity scoring**: Each repository result is enriched with a computed `popularity_score` based on stars, forks, recency.
- **Caching**: Results are cached in memory and/or Redis for fast repeated queries.
- **Rate limiting**: Prevents abuse by limiting the number of requests per client.
- **Health checks**: Built-in endpoints for monitoring service health.

## 🏆 Popularity Scoring Algorithm

We turn stars, forks, and “how recently it was updated” into 0–1 scores, then take a weighted average and scale to 0–100.

- **Stars/forks** are log-scaled so each doubling helps but huge repos don’t dominate.
- **Recency** uses exponential decay with a chosen half-life (e.g., 90 days).
- **earlyMomentumBoost** if the repo is very new (e.g., under 30 days), we multiply the recency score by (1 + boost) (e.g., +10%) and cap at 1.0.
- **Final score** = 0.55×stars + 0.25×forks + 0.20×recency (then ×100).

**Example:**  
500 stars, 100 forks, updated 10 days ago, repo age 20 days, boost 10%  
stars ≈ 0.675, forks ≈ 0.576, recency ≈ 0.926 → boosted to 1.000 →  
score ≈ 0.55×0.675 + 0.25×0.576 + 0.20×1.0 = 0.715 → 71.5/100.

---

### Sample `popularity_score` object

```json
{
  "stargazers_count": 195,
  "forks_count": 51,
  "popularity_score": {
    "score": 60.6,
    "cfg": {
      "S_CAP": 10000,
      "F_CAP": 3000,
      "HALF_LIFE_DAYS": 90,
      "weights": {
        "alpha": 0.3151817879398237,
        "beta": 0.12337302825643756,
        "gamma": 0.1675329006450312
      },
      "earlyMomentumBoost": 0.1,
      "earlyMomentumDays": 30
    }
  }
}
```

## ⚙️ Environment Variables

Create a `.env` file in the project root. The following variables are supported:

```

| Variable            | Description                                          | Default       |
| ------------------- | ---------------------------------------------------- | ------------- |
| `PORT`              | Port to run the API server                           | `3000`        |
| `HOST`              | Host address                                         | `localhost`   |
| `CACHE_TTL`         | Cache time-to-live in milliseconds                   | `60000`       |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds (for controller logic)          | `300`         |
| `REDIS_URL`         | Redis connection string (optional)                   | _(none)_      |
| `THROTTLE_TTL`      | Rate limit window in ms                              | `60000`       |
| `THROTTLE_LIMIT`    | Max requests per window                              | `60`          |
| `GITHUB_TOKEN`      | GitHub API token (optional, for higher rate limits)  | _(none)_      |
| `NODE_ENV`          | Node environment (`development`, `production`, etc.) | `development` |

```
