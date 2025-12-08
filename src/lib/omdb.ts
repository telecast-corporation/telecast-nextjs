
import type { Movie } from "../types";

const OMDB_API_KEY = "1d81fa6";
const OMDB_BASE_URL = "https://www.omdbapi.com";

async function fetchFromOMDb(params: Record<string, string>): Promise<any> {
    if (!OMDB_API_KEY) {
        console.warn("OMDB_API_KEY is not configured. Movie search will be disabled.");
        return { Search: [] };
    }

    const searchParams = new URLSearchParams({ apikey: OMDB_API_KEY, ...params });
    const url = `${OMDB_BASE_URL}/?${searchParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`OMDb API request failed: ${response.status} ${response.statusText}`);
            return { Search: [] };
        }

        const data = await response.json();

        if (data.Response === "False") {
            if (data.Error !== 'Movie not found!') {
              console.error(`OMDb API error: ${data.Error}`);
            }
            return { Search: [] };
        }

        return data;
    } catch (error) {
        console.error("Error fetching from OMDb:", error);
        return { Search: [] };
    }
}

function transformOMDbMovie(data: any): Movie {
    return {
        id: data.imdbID || "",
        title: data.Title || "Unknown Title",
        year: data.Year || "",
        rating: data.imdbRating !== "N/A" ? data.imdbRating : "0",
        poster: data.Poster !== "N/A" ? data.Poster : "",
        backdrop: data.Poster !== "N/A" ? data.Poster : "",
        overview: data.Plot !== "N/A" ? data.Plot : "",
        releaseDate: data.Released !== "N/A" ? data.Released : "",
        runtime: data.Runtime !== "N/A" ? data.Runtime : "",
        genres: data.Genre !== "N/A" ? data.Genre.split(", ") : [],
        voteCount: data.imdbVotes !== "NA" ? parseInt(data.imdbVotes.replace(/,/g, "")) : 0,
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

export async function getMovies(query: string, maxResults: number = 10): Promise<Movie[]> {
    const data = await fetchFromOMDb({ s: query.trim(), type: "movie" });
    const searchResults = data.Search || [];

    if (searchResults.length === 0) {
        return [];
    }

    const detailedMoviesPromises = searchResults.slice(0, maxResults).map(async (item: any) => {
        try {
            const details = await fetchFromOMDb({ i: item.imdbID, plot: "short" });
            if (details.Response === "False") return null;
            return transformOMDbMovie(details);
        } catch (err) {
            console.error(`Failed to fetch movie details for ${item.imdbID}:`, err);
            return null;
        }
    });

    const movies = await Promise.all(detailedMoviesPromises);
    return movies.filter((movie): movie is Movie => movie !== null);
}
