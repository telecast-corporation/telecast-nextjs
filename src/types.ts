
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

export interface TrendingItem {
  id: string;
  thumbnail: string;
  title: string;
  rating?: number;
  author: string;
  description?: string;
  duration?: string;
  narrator?: string;
  ratingsCount?: number;
  categories?: string[];
  audibleUrl?: string;
  kindleUrl?: string;
  type?: string;
  views?: string;
  artist?: string;
  album?: string;
  episodeCount?: number;
  source?: string;
  year?: string;
}
