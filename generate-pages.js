import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API = "https://movie-stream.828477ww.workers.dev";

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return await response.json();
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateMoviePage(movie, credits) {
  const cast = (credits.cast || []).slice(0, 10);
  const directors = (credits.crew || [])
    .filter(person => person.job === "Director")
    .filter((person, index, array) => array.findIndex(item => item.id === person.id) === index);
  const genres = movie.genres || [];
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";
  const year = movie.release_date ? movie.release_date.slice(0,4) : "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "";
  const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Release date unavailable";
  const runtime = movie.runtime ? `${movie.runtime} min` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${movie.title} | Pure Cinema</title>
  <meta name="description" content="${movie.overview ? movie.overview.slice(0, 160) : 'Watch ' + movie.title + ' online. Movie details, cast, and more.'}">
  <link rel="canonical" href="https://pure-cinema.in/movie/${slugify(movie.title)}/" />
  <meta property="og:title" content="${movie.title} | Pure Cinema" />
  <meta property="og:description" content="${movie.overview ? movie.overview.slice(0, 160) : 'Watch ' + movie.title + ' online.'}" />
  <meta property="og:image" content="${posterUrl}" />
  <meta property="og:url" content="https://pure-cinema.in/movie/${slugify(movie.title)}/" />
  <meta property="og:type" content="video.movie" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #0b0b0f; color: #f5f5f5; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .back-link { color: #ffd21f; text-decoration: none; display: inline-block; margin-bottom: 20px; }
    .movie-detail { display: grid; grid-template-columns: 300px 1fr; gap: 40px; }
    .poster { width: 100%; border-radius: 10px; }
    h1 { font-size: 38px; margin-bottom: 8px; }
    .tagline { color: #ffd21f; font-size: 17px; font-style: italic; margin-bottom: 12px; }
    .genres { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
    .genre-tag { background: #1c1c25; border: 1px solid #292933; padding: 6px 12px; border-radius: 999px; color: #9b9ba5; font-size: 13px; }
    .meta { color: #9b9ba5; margin: 8px 0; }
    .overview { color: #9b9ba5; line-height: 1.6; margin: 12px 0; }
    .watch-btn { background: #ff9800; color: white; border: 0; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px; }
    .details-box { margin-top: 28px; background: #15151c; border: 1px solid #292933; border-radius: 14px; padding: 14px; }
    .info-row { display: grid; grid-template-columns: 110px 1fr; padding: 9px 0; border-bottom: 1px solid #292933; }
    .info-row:last-child { border-bottom: 0; }
    .info-label { font-weight: 800; }
    .info-value { color: #9b9ba5; }
    .actor-link { color: #f5f5f5; font-weight: 600; }
    .director-link { color: #f5f5f5; font-weight: 700; }
    @media (max-width: 650px) { .movie-detail { grid-template-columns: 1fr; gap: 20px; } h1 { font-size: 26px; } }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Back to Home</a>
    <div class="movie-detail">
      <img class="poster" src="${posterUrl}" alt="${movie.title}">
      <div>
        <h1>${movie.title}</h1>
        ${movie.tagline ? `<p class="tagline">${movie.tagline}</p>` : ""}
        <div class="genres">
          ${genres.map(g => `<span class="genre-tag">${g.name}</span>`).join("")}
        </div>
        <div class="meta">
          ${releaseDate}
          ${runtime ? ` • ${runtime}` : ""}
          ${rating ? ` • ⭐ ${rating}` : ""}
        </div>
        <p class="overview">${movie.overview || "No description available."}</p>
        <a href="/watch?id=${movie.id}" class="watch-btn">▶ Watch Now</a>
      </div>
    </div>
    <div class="details-box">
      <div class="info-row">
        <div class="info-label">Stars</div>
        <div class="info-value">
          ${cast.length ? cast.map(p => `<div><span class="actor-link">${p.name}</span>${p.character ? ` — ${p.character}` : ""}</div>`).join("") : "Cast information unavailable."}
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">Director</div>
        <div class="info-value">
          ${directors.length ? directors.map(p => `<span class="director-link">${p.name}</span>`).join(", ") : "Director information unavailable."}
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">Release Date</div>
        <div class="info-value">${releaseDate}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function generateAllMovies() {
  console.log("Fetching popular movies...");
  
  let allMovies = [];
  for (let page = 1; page <= 10; page++) {
    try {
      const data = await getJSON(API + "/popular?page=" + page);
      allMovies = allMovies.concat(data.results || []);
      console.log(`Fetched page ${page}, total: ${allMovies.length}`);
    } catch (e) {
      console.error(`Failed to fetch page ${page}:`, e.message);
    }
  }

  console.log(`Generating pages for ${allMovies.length} movies...`);

  const dir = "./movies";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  for (const movie of allMovies) {
    try {
      const credits = await getJSON(API + "/movie/" + movie.id + "/credits");
      const html = generateMoviePage(movie, credits);
      const slug = slugify(movie.title);
      const filePath = path.join(dir, `${slug}.html`);
      fs.writeFileSync(filePath, html);
      console.log(`Generated: ${slug}.html`);
    } catch (e) {
      console.error(`Failed to generate ${movie.title}:`, e.message);
    }
  }

  console.log("Done! Generated " + allMovies.length + " movie pages.");
}

generateAllMovies();
