import type { Movie } from "../types";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";


function buildURL(params: Record<string, string>) {
    return `${OMDB_BASE_URL}/?${new URLSearchParams({
        apikey: OMDB_API_KEY || "",
        ...params,
    }).toString()}`;
}


async function fetchOMDb(params: Record<string, string>) {
    if (!OMDB_API_KEY) {
        console.warn("OMDB_API_KEY missing → OMDb disabled.");
        return null;
    }

    const url = buildURL(params);

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.error("OMDb request failed:", res.status);
            return null;
        }

        const data = await res.json();

        if (data.Response === "False") return null;

        return data;
    } catch (err) {
        console.error("OMDb fetch error:", err);
        return null;
    }
}


function transformMovie(data: any): Movie {
    return {
        id: data.imdbID ?? "",
        title: data.Title ?? "Untitled",
        year: data.Year ?? "",
        rating: data.imdbRating && data.imdbRating !== "N/A"
            ? Number(data.imdbRating)
            : 0,
        poster: data.Poster !== "N/A" ? data.Poster : "",
        backdrop: data.Poster !== "N/A" ? data.Poster : "",
        overview: data.Plot !== "N/A" ? data.Plot : "",
        releaseDate: data.Released !== "N/A" ? data.Released : "",
        runtime: data.Runtime !== "N/A" ? data.Runtime : "",
        genres: data.Genre && data.Genre !== "N/A"
            ? data.Genre.split(", ")
            : [],
        voteCount: data.imdbVotes && data.imdbVotes !== "N/A"
            ? Number(data.imdbVotes.replace(/,/g, ""))
            : 0,
        language: data.Language && data.Language !== "N/A"
            ? data.Language.split(", ")[0]
            : "English",
        director: data.Director !== "N/A" ? data.Director : "",
        cast: data.Actors && data.Actors !== "N/A"
            ? data.Actors.split(", ").map((name: string, index: number) => ({
                id: String(index),
                name,
                character: "",
                profilePath: "",
            }))
            : [],
    };
}

/**
 * Search movies or series, return full movie objects with detail lookups.
 */
export async function getMovies(
    query: string,
    maxResults = 10,
    type?: "movie" | "series" | "tv" | "video"
): Promise<Movie[]> {

    if (!query.trim()) return [];

    // OMDb only supports "movie" or "series"
    const typesToFetch =
        type === "movie" ? ["movie"]
        : type === "tv" || type === "series" ? ["series"]
        : ["movie", "series"]; // default: search everything

    // 1) Search result pages
    const searchResults = await Promise.all(
        typesToFetch.map(t =>
            fetchOMDb({ s: query.trim(), type: t })
        )
    );

    const mergedSearch = searchResults
        .filter(Boolean)
        .flatMap(r => r.Search ?? []);

    if (mergedSearch.length === 0) return [];

    const limited = mergedSearch.slice(0, maxResults);

    // 2) Fetch full details for each movie (OMDb requires second call)
    const detailResults = await Promise.all(
        limited.map(async item => {
            const details = await fetchOMDb({ i: item.imdbID, plot: "short" });
            if (!details) return null;
            return transformMovie(details);
        })
    );

    return detailResults.filter(
        (m): m is Movie => m !== null
    );
}
