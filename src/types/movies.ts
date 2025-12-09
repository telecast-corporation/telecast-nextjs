
// Movie types for RapidAPI integration
export interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  poster: string;
  backdrop?: string;
  overview?: string;
  releaseDate?: string;
  runtime?: string;
  genres?: string[];
  cast?: CastMember[];
  director?: string;
  language?: string;
  voteCount?: number;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profilePath?: string;
}

export interface MovieSearchParams {
  query?: string;
  genre?: string;
  year?: string;
  sortBy?: 'popularity' | 'rating' | 'release_date';
}

export interface MovieApiResponse {
  movies: Movie[];
  totalPages: number;
  currentPage: number;
}

export interface MovieDetailResponse {
  movie: Movie;
}
