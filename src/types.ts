
export interface Movie {
    id: string;
    title: string;
    year: string;
    rating: string;
    poster: string;
    backdrop: string;
    overview: string;
    releaseDate: string;
    runtime: string;
    genres: string[];
    voteCount: number;
    language: string;
    director: string;
    cast: CastMember[];
}

export interface MovieApiResponse {
    movies: Movie[];
    totalPages: number;
    currentPage: number;
}

export interface CastMember {
    id: string;
    name: string;
    character: string;
    profilePath: string;
}
