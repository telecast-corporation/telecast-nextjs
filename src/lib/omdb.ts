
import type { Movie, CastMember } from "../types/movies";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// More resilient fetch function
async function fetchFromOMDb(params: Record<string, string>): Promise<any> {
    if (!OMDB_API_KEY) {
        console.warn("OMDB_API_KEY missing → OMDb disabled.");
        return { Response: "False", Error: "OMDB_API_KEY not configured" };
    }

    const searchParams = new URLSearchParams({ apikey: OMDB_API_KEY, ...params });
    const url = `${OMDB_BASE_URL}/?${searchParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
        });

        if (!response.ok) {
            console.error(`OMDb API request failed: ${response.status} ${response.statusText}`);
            return { Response: "False", Error: `Request failed with status ${response.status}` };
        }

        const data = await response.json();
        
        // Don't treat "Movie not found!" as a critical error, just return no results
        if (data.Response === "False" && data.Error !== "Movie not found!") {
            console.warn(`OMDb API error: ${data.Error}`);
        }

        return data;
    } catch (error) {
        console.error("Error fetching from OMDb:", error);
        return { Response: "False", Error: "Failed to fetch data" };
    }
}


// Updated transformer to match the new, more detailed Movie type
function transformOMDbMovie(data: any): Movie {
    return {
        id: data.imdbID || "",
        title: data.Title || "Unknown Title",
        year: data.Year || "",
        rating: data.imdbRating !== "N/A" ? data.imdbRating : "0", // Use string "0" for consistency
        poster: data.Poster !== "N/A" ? data.Poster : "/placeholder.png", // Add placeholder for missing posters
        backdrop: data.Poster !== "N/A" ? data.Poster.replace('SX300', 'SX1200') : undefined, // Attempt to get a larger backdrop
        overview: data.Plot !== "N/A" ? data.Plot : "",
        releaseDate: data.Released !== "N/A" ? data.Released : undefined,
        runtime: data.Runtime !== "N/A" ? data.Runtime : undefined,
        genres: data.Genre && data.Genre !== "N/A" ? data.Genre.split(", ") : [],
        voteCount: data.imdbVotes && data.imdbVotes !== "N/A" ? parseInt(data.imdbVotes.replace(/,/g, ""), 10) : 0,
        language: data.Language && data.Language !== "N/A" ? data.Language.split(", ")[0] : undefined,
        director: data.Director !== "N/A" ? data.Director : undefined,
        cast: data.Actors && data.Actors !== "N/A"
            ? data.Actors.split(", ").map((name: string, idx: number) => ({
                id: String(idx),
                name,
                character: "", // OMDb doesn't provide character names
                profilePath: undefined,
            }))
            : [],
    };
}


const TRENDING_MOVIE_IDS = [
  "tt30274401", "tt19847976", "tt13622970", "tt26443597", "tt1757678", 
  "tt16311594", "tt9603208", "tt3566834", "tt11655566", "tt14513804", 
  "tt12299608", "tt6263850",
];

// Cache for trending movies
let trendingMoviesCache: Movie[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTrendingMovies(): Promise<Movie[]> {
    const now = Date.now();
    if (trendingMoviesCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
        return trendingMoviesCache;
    }

    const moviePromises = TRENDING_MOVIE_IDS.map(async (imdbId) => {
        try {
            const data = await fetchFromOMDb({ i: imdbId, plot: "short" });
            if (data.Response === "True") {
                return transformOMDbMovie(data);
            }
            return null;
        } catch (err) {
            console.error(`Failed to fetch trending movie ${imdbId}:`, err);
            return null;
        }
    });

    const results = await Promise.all(moviePromises);
    const movies = results.filter((m): m is Movie => m !== null);

    if (movies.length > 0) {
        trendingMoviesCache = movies;
        cacheTimestamp = now;
    }

    return movies;
}

export async function searchMovies(query: string, maxResults = 10): Promise<Movie[]> {
    if (!query || !query.trim()) return [];

    const data = await fetchFromOMDb({ s: query.trim(), type: "movie" });
    const searchResults = data.Search || [];

    if (searchResults.length === 0) return [];

    const detailedMoviePromises = searchResults.slice(0, maxResults).map(async (item: any) => {
        try {
            const details = await fetchFromOMDb({ i: item.imdbID, plot: "short" });
            if (details.Response === "True") {
                return transformOMDbMovie(details);
            }
            return null;
        } catch {
            return null;
        }
    });

    const detailedMovies = await Promise.all(detailedMoviePromises);
    return detailedMovies.filter((m): m is Movie => m !== null);
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
    if (!id) return null;
    try {
        const data = await fetchFromOMDb({ i: id, plot: "full" });
        if (data.Response === "True") {
            return transformOMDbMovie(data);
        }
        return null;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}
