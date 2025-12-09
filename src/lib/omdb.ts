
import type { Movie, CastMember } from "../types/movies";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// A more resilient fetch function with better error handling and logging
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
        
        // Don't treat "Movie not found!" or "Too many results." as critical errors
        if (data.Response === "False" && data.Error !== "Movie not found!" && data.Error !== "Too many results.") {
            console.warn(`OMDb API error: ${data.Error}`);
        }

        return data;
    } catch (error) {
        console.error("Error fetching from OMDb:", error);
        return { Response: "False", Error: "Failed to fetch data" };
    }
}

// Transformer to handle both search results and detailed results
function transformOMDbMovie(data: any, isDetailed: boolean = false): Movie {
    return {
        id: data.imdbID || "",
        title: data.Title || "Unknown Title",
        year: data.Year || "",
        // For basic search results, rating/poster might not be in the main object
        rating: data.imdbRating !== "N/A" ? data.imdbRating : "0", 
        poster: data.Poster !== "N/A" ? data.Poster : "/placeholder.png",
        
        // Detailed information (only available when isDetailed is true)
        overview: isDetailed && data.Plot !== "N/A" ? data.Plot : "",
        releaseDate: isDetailed && data.Released !== "N/A" ? data.Released : undefined,
        runtime: isDetailed && data.Runtime !== "N/A" ? data.Runtime : undefined,
        genres: isDetailed && data.Genre && data.Genre !== "N/A" ? data.Genre.split(", ") : [],
        director: isDetailed && data.Director !== "N/A" ? data.Director : undefined,
        cast: isDetailed && data.Actors && data.Actors !== "N/A"
            ? data.Actors.split(", ").map((name: string, idx: number) => ({
                id: String(idx),
                name,
                character: "", // OMDb doesn't provide character names
            }))
            : [],
        voteCount: isDetailed && data.imdbVotes && data.imdbVotes !== "N/A" ? parseInt(data.imdbVotes.replace(/,/g, ""), 10) : 0,
        language: isDetailed && data.Language && data.Language !== "N/A" ? data.Language.split(", ")[0] : undefined,
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
            // Fetch full plot for trending movies as they are for the main page
            const data = await fetchFromOMDb({ i: imdbId, plot: "full" });
            if (data.Response === "True") {
                return transformOMDbMovie(data, true); // Use detailed transform
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

// **Optimized searchMovies function**
// This function will no longer fetch detailed information for each search result.
// It will only perform a single search and return the basic info.
export async function searchMovies(query: string, maxResults: number = 10): Promise<Movie[]> {
    if (!query || !query.trim()) {
        return [];
    }

    const data = await fetchFromOMDb({ s: query.trim(), type: "movie", page: "1" });

    if (data.Response === "False") {
        return [];
    }

    const searchResults = data.Search || [];
    
    // We limit the results here, but we are not making extra API calls.
    const limitedResults = searchResults.slice(0, maxResults);

    // Transform the basic search results into our Movie type. No detailed fetch.
    return limitedResults.map((item: any) => transformOMDbMovie(item, false));
}


export async function getMovieDetails(id: string): Promise<Movie | null> {
    if (!id) return null;
    try {
        // Fetch with full plot for the detail view
        const data = await fetchFromOMDb({ i: id, plot: "full" });
        if (data.Response === "True") {
            return transformOMDbMovie(data, true); // Use detailed transform
        }
        return null;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}
