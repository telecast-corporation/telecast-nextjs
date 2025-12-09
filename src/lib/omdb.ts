
import type { Movie } from "../types";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// Curated list of CURRENT trending/now playing movies from your example
const TRENDING_MOVIE_IDS = [
    "tt30274401", // Five Nights at Freddy's 2 (2025)
    "tt19847976", // Wicked: For Good (2025)
    "tt13622970", // Moana 2 (2024)
    "tt26443597", // Zootopia 2 (2025)
    "tt1757678",  // Avatar: Fire and Ash (2025)
    "tt16311594", // F1 (2025)
    "tt9603208",  // Mission: Impossible - The Final Reckoning (2025)
    "tt3566834",  // A Minecraft Movie (2025)
    "tt11655566", // Lilo & Stitch (2025)
    "tt14513804", // Captain America: Brave New World (2025)
    "tt12299608", // Mickey 17 (2025)
    "tt6263850",  // Gladiator II (2024)
];

// Cache for trending movies
let trendingMoviesCache: Movie[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchFromOMDb(params: Record<string, string>): Promise<any> {
    if (!OMDB_API_KEY) {
        throw new Error("OMDB_API_KEY is not configured");
    }

    const searchParams = new URLSearchParams({ apikey: OMDB_API_KEY, ...params });
    const url = `${OMDB_BASE_URL}/?${searchParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OMDb API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.Error) {
        throw new Error(`OMDb API error: ${data.Error}`);
    }

    return data;
}

function transformOMDbMovie(data: any): Movie {
    return {
        id: data.imdbID || "",
        title: data.Title || "Unknown Title",
        year: data.Year || "",
        rating: data.imdbRating !== "N/A" ? data.imdbRating : "",
        poster: data.Poster !== "N/A" ? data.Poster : "",
        backdrop: data.Poster !== "N/A" ? data.Poster : "",
        overview: data.Plot !== "N/A" ? data.Plot : "",
        releaseDate: data.Released !== "N/A" ? data.Released : "",
        runtime: data.Runtime !== "N/A" ? data.Runtime : "",
        genres: data.Genre !== "N/A" ? data.Genre.split(", ") : [],
        voteCount: data.imdbVotes !== "N/A" ? parseInt(data.imdbVotes.replace(/,/g, "")) : 0,
        language: data.Language !== "N/A" ? data.Language.split(", ")[0] : "English",
        director: data.Director !== "N/A" ? data.Director : "",
        cast: data.Actors !== "N/A"
            ? data.Actors.split(", ").map((name: string, idx: number) => ({
                id: String(idx),
                name,
                character: "",
                profilePath: "",
            }))
            : [],
    };
}

export async function getTrendingMovies(): Promise<Movie[]> {
    const now = Date.now();
    if (trendingMoviesCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
        return trendingMoviesCache;
    }

    const moviePromises = TRENDING_MOVIE_IDS.map(async (imdbId) => {
        try {
            const data = await fetchFromOMDb({ i: imdbId, plot: "short" });
            return transformOMDbMovie(data);
        } catch (err) {
            console.error(`Failed to fetch trending movie ${imdbId}:`, err);
            return null;
        }
    });

    const results = await Promise.all(moviePromises);
    const movies = results.filter((m): m is Movie => m !== null);

    trendingMoviesCache = movies;
    cacheTimestamp = now;

    return movies;
}

export async function searchMovies(query: string, maxResults = 10): Promise<Movie[]> {
    if (!query.trim()) return [];

    const data = await fetchFromOMDb({ s: query.trim(), type: "movie" });
    const searchResults = data.Search || [];

    const detailedMovies = await Promise.all(
        searchResults.slice(0, maxResults).map(async (item: any) => {
            try {
                const details = await fetchFromOMDb({ i: item.imdbID, plot: "short" });
                return transformOMDbMovie(details);
            } catch {
                return null; // Or a partial movie object
            }
        })
    );

    return detailedMovies.filter((m): m is Movie => m !== null);
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
    try {
        const data = await fetchFromOMDb({ i: id, plot: "full" });
        return transformOMDbMovie(data);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}