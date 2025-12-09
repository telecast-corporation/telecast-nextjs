export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { PodcastIndex, Podcast } from '@/lib/podcast-index';
import { searchAudible } from '@/lib/audible-search';

// OMDb API Configuration
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// Curated list of CURRENT trending TV shows (December 2025)
const TRENDING_TV_IDS = [
    "tt15392100", // Dune: Prophecy (2024) - HBO Max
    "tt11198330", // The Penguin (2024) - HBO Max
    "tt14452776", // Skeleton Crew (2024) - Disney+
    "tt10234724", // Yellowstone (Continuing)
    "tt5753856",  // Dark Winds (2024)
    "tt13622776", // Squid Game Season 2 (2024) - Netflix
    "tt1190634",  // The Boys Season 5 (2025)
    "tt2861424",  // Rick and Morty Season 8 (2025)
    "tt2707408",  // Narcos (Popular rewatch)
    "tt1831164",  // Yellowjackets Season 3 (2025)
    "tt11198854", // The Last of Us Season 2 (2025)
    "tt0944947",  // Game of Thrones (Timeless classic)
];

// Cache for trending TV shows
let trendingTVCache: any[] = [];
let tvCacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SearchResult {
    id: number | string;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    source: 'telecast' | 'spotify' | 'audible';
    category?: string;
    tags?: string[];
    type: 'podcast' | 'video' | 'music' | 'book' | 'audiobook' | 'tv';
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

interface SearchRequest {
    query: string;
    types: string[];
    maxResults?: number;
    trending?: boolean;
    page?: number;
    limit?: number;
}

async function fetchFromOMDb(params: Record<string, string>): Promise<any> {
    if (!OMDB_API_KEY) {
        console.warn('OMDB_API_KEY is not configured');
        return null;
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
            console.warn(`OMDb API request failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.Error) {
            console.warn(`OMDb API error: ${data.Error}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching from OMDb:', error);
        return null;
    }
}

// Transform OMDb response to our TV show format
function transformOMDbTVShow(data: any): any {
    return {
        type: 'tv',
        id: data.imdbID || "",
        title: truncateText(data.Title || "Unknown Title", 50),
        description: truncateText(data.Plot !== "N/A" ? data.Plot : "", 100),
        thumbnail: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/300x450",
        url: `/tv/${data.imdbID}`,
        author: data.Director !== "N/A" ? truncateText(data.Director, 30) : "Unknown",
        year: data.Year || "",
        rating: data.imdbRating !== "N/A" ? data.imdbRating : "",
        genres: data.Genre !== "N/A" ? data.Genre.split(", ") : [],
        seasons: data.totalSeasons !== "N/A" ? `${data.totalSeasons} seasons` : "",
        language: data.Language !== "N/A" ? data.Language.split(", ")[0] : "English",
        source: 'omdb',
        sourceUrl: `https://www.imdb.com/title/${data.imdbID}`,
        releaseDate: data.Released !== "N/A" ? data.Released : data.Year,
        cast: data.Actors !== "N/A" ? data.Actors : "",
    };
}

async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('Spotify credentials not configured');
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            console.warn('Failed to get Spotify access token:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
        return null;
    }
}

function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

async function searchYouTube(query: string, maxResults: number = 300) {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults,
                q: query,
                type: 'video',
                regionCode: 'CA',
                key: process.env.YOUTUBE_API_KEY,
            },
        });

        return response.data.items.map((item: any) => ({
            type: 'video',
            id: item.id.videoId,
            title: truncateText(item.snippet.title, 50),
            description: truncateText(item.snippet.description, 100),
            thumbnail: item.snippet.thumbnails.high.url,
            url: `/video/${item.id.videoId}`,
            author: truncateText(item.snippet.channelTitle, 30),
            publishedAt: item.snippet.publishedAt,
            source: 'youtube',
            sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
}

function ensureHttps(url: string | undefined): string | undefined {
    if (!url) return url;
    return url.replace(/^http:/, 'https:');
}

async function searchBooks(query: string, maxResults: number = 300) {
    try {
        const safeMaxResults = Math.min(maxResults, 40);

        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
                maxResults: safeMaxResults,
                country: 'CA',
                key: process.env.GOOGLE_BOOKS_API_KEY,
            },
        });

        return response.data.items.map((item: any) => ({
            type: 'book',
            id: item.id,
            title: truncateText(item.volumeInfo.title, 50),
            description: truncateText(item.volumeInfo.description, 100),
            thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail),
            url: `/book/${item.id}`,
            author: truncateText(item.volumeInfo.authors?.join(', ') || 'Unknown Author', 30),
            publishedDate: item.volumeInfo.publishedDate,
            categories: item.volumeInfo.categories,
            rating: item.volumeInfo.averageRating,
            ratingsCount: item.volumeInfo.ratingsCount,
            source: 'google_books',
            sourceUrl: item.volumeInfo.infoLink,
        }));
    } catch (error) {
        console.error('Books search error:', error);
        return [];
    }
}

async function searchPodcasts(query: string, maxResults: number = 300, request?: Request) {
    try {
        const podcastIndex = new PodcastIndex();
        const externalResults = await podcastIndex.search(query);

        let internalResults: any[] = [];
        try {
            if (request) {
                const user = await getAuth0User(request as any);
                if (user) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });

                    if (dbUser) {
                        const internalPodcasts = await prisma.podcast.findMany({
                            where: {
                                userId: dbUser.id,
                                AND: [
                                    {
                                        OR: [
                                            { isAvailable: true },
                                            { isAvailable: false }
                                        ]
                                    },
                                    {
                                        OR: [
                                            { title: { contains: query, mode: 'insensitive' } },
                                            { description: { contains: query, mode: 'insensitive' } },
                                            { tags: { hasSome: [query] } },
                                            { category: { contains: query, mode: 'insensitive' } },
                                        ]
                                    }
                                ]
                            },
                            orderBy: { createdAt: 'desc' },
                            take: Math.floor(maxResults / 2),
                        });

                        internalResults = internalPodcasts.map(podcast => ({
                            type: 'podcast',
                            id: `internal-${podcast.id}`,
                            title: truncateText(podcast.title, 50),
                            description: truncateText(podcast.description || '', 100),
                            thumbnail: podcast.coverImage || 'https://via.placeholder.com/150',
                            url: `/podcast/${podcast.id}`,
                            author: truncateText(podcast.author || 'Unknown Author', 30),
                            duration: podcast.isAvailable ? 'User uploaded' : 'Draft (unpublished)',
                            categories: podcast.tags || [],
                            language: podcast.language || 'en',
                            explicit: podcast.explicit || false,
                            source: 'internal',
                            sourceUrl: `/podcast/${podcast.id}`,
                            published: podcast.isAvailable,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error searching internal podcasts:', error);
        }

        const externalMapped = externalResults.slice(0, maxResults - internalResults.length).map((podcast: Podcast) => ({
            type: 'podcast',
            id: podcast.id,
            title: truncateText(podcast.title, 50),
            description: truncateText(podcast.description, 100),
            thumbnail: podcast.image,
            url: `/podcast/${podcast.id}`,
            author: truncateText(podcast.author, 30),
            duration: `${podcast.episodeCount || 0} episodes`,
            categories: podcast.categories,
            language: podcast.language,
            explicit: podcast.explicit,
            source: 'podcastindex',
            sourceUrl: podcast.url,
        }));

        const combinedResults = [...internalResults, ...externalMapped];

        return combinedResults.slice(0, maxResults);
    } catch (error) {
        console.error('Podcast search error:', error);
        return [];
    }
}

async function searchMusic(query: string, maxResults: number = 300) {
    try {
        const accessToken = await getSpotifyAccessToken();
        if (!accessToken) {
            return [];
        }

        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                q: query,
                type: 'track',
                limit: maxResults,
                market: 'CA',
            },
        });

        return response.data.tracks.items.map((item: any) => ({
            type: 'music',
            id: item.id,
            title: truncateText(item.name, 50),
            description: truncateText(item.artists.map((artist: any) => artist.name).join(', '), 100),
            thumbnail: item.album.images[0]?.url,
            url: item.external_urls.spotify,
            author: truncateText(item.artists[0].name, 30),
            duration: `${Math.floor(item.duration_ms / 60000)}:${((item.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
            album: truncateText(item.album.name, 50),
            releaseDate: item.album.release_date,
        }));
    } catch (error) {
        console.error('Music search error:', error);
        return [];
    }
}

async function searchAudiobooks(query: string, maxResults: number = 300) {
    try {
        console.log('🎧 Searching audiobooks for query:', query);

        const books = await searchAudible(query, maxResults);

        console.log('🎧 Raw audiobooks from searchAudible:', books.map(book => ({
            title: book.title,
            url: book.url,
            audibleUrl: book.audibleUrl,
            id: book.id
        })));

        const mappedBooks = books.map((item: any) => ({
            type: 'audiobook',
            id: item.id,
            title: truncateText(item.title, 50),
            description: truncateText(item.description, 100),
            thumbnail: ensureHttps(item.thumbnail),
            url: item.url,
            author: truncateText(item.author, 30),
            duration: item.duration,
            narrator: item.narrator,
            rating: item.rating,
            audibleUrl: item.audibleUrl,
            source: 'audible',
            sourceUrl: item.sourceUrl,
        }));

        console.log('🎧 Mapped audiobooks:', mappedBooks.map(book => ({
            title: book.title,
            url: book.url,
            audibleUrl: book.audibleUrl,
            id: book.id
        })));

        return mappedBooks;
    } catch (error: any) {
        console.error('🎧 Audiobook search error:', error);
        if (error.response) {
            console.error('🎧 Error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });
        }
        return [];
    }
}

async function searchTVShows(query: string, maxResults: number = 300) {
    try {
        const params: Record<string, string> = {
            s: query.trim(),
            type: "series"
        };

        const data = await fetchFromOMDb(params);

        if (!data || !data.Search) {
            return [];
        }

        const searchResults = data.Search || [];

        const detailedShows = await Promise.all(
            searchResults.slice(0, Math.min(maxResults, 20)).map(async (item: any) => {
                try {
                    const details = await fetchFromOMDb({ i: item.imdbID, plot: "short" });
                    if (details) {
                        return transformOMDbTVShow(details);
                    }
                    return {
                        type: 'tv',
                        id: item.imdbID,
                        title: truncateText(item.Title, 50),
                        description: "",
                        thumbnail: item.Poster !== "N/A" ? item.Poster : "https://via.placeholder.com/300x450",
                        url: `/tv/${item.imdbID}`,
                        author: "Unknown",
                        year: item.Year,
                        rating: "",
                        genres: [],
                        seasons: "",
                        language: "English",
                        source: 'omdb',
                        sourceUrl: `https://www.imdb.com/title/${item.imdbID}`,
                    };
                } catch (error) {
                    console.error(`Failed to fetch TV show ${item.imdbID}:`, error);
                    return null;
                }
            })
        );

        return detailedShows.filter((show): show is any => show !== null);
    } catch (error) {
        console.error('TV shows search error:', error);
        return [];
    }
}

async function getTrendingTVShows(maxResults: number = 300) {
    try {
        const now = Date.now();

        if (trendingTVCache.length > 0 && (now - tvCacheTimestamp) < CACHE_DURATION) {
            return trendingTVCache.slice(0, maxResults);
        }

        const showPromises = TRENDING_TV_IDS.map(async (imdbId) => {
            try {
                const data = await fetchFromOMDb({ i: imdbId, plot: "short" });
                if (data) {
                    return transformOMDbTVShow(data);
                }
                return null;
            } catch (err) {
                console.error(`Failed to fetch TV show ${imdbId}:`, err);
                return null;
            }
        });

        const results = await Promise.all(showPromises);
        const shows = results.filter((show): show is any => show !== null);

        trendingTVCache = shows;
        tvCacheTimestamp = now;

        return shows.slice(0, maxResults);
    } catch (error) {
        console.error('Error fetching trending TV shows:', error);
        return [];
    }
}

function calculateRelevanceScore(item: any, queryWords: string[], query: string): number {
    const title = item.title.toLowerCase();
    const description = (item.description || '').toLowerCase();
    const author = (item.author || '').toLowerCase();

    let score = 0;

    if (title === query.toLowerCase()) {
        score += 1000;
    }

    if (title.startsWith(query.toLowerCase())) {
        score += 500;
    }

    const titleWords = title.split(/\s+/);
    let allWordsInOrder = true;
    let wordIndex = 0;

    for (const queryWord of queryWords) {
        const foundIndex = titleWords.findIndex((titleWord: string, index: number) =>
            index >= wordIndex && titleWord.includes(queryWord)
        );
        if (foundIndex === -1) {
            allWordsInOrder = false;
            break;
        }
        wordIndex = foundIndex + 1;
    }

    if (allWordsInOrder) {
        score += 300;
    }

    const allWordsFound = queryWords.every(queryWord =>
        titleWords.some((titleWord: string) => titleWord.includes(queryWord))
    );

    if (allWordsFound) {
        score += 200;
    }

    let titleWordMatches = 0;
    for (const queryWord of queryWords) {
        for (const titleWord of titleWords) {
            if (titleWord.includes(queryWord)) {
                titleWordMatches++;
                break;
            }
        }
    }
    score += titleWordMatches * 50;

    if (author.includes(query.toLowerCase())) {
        score += 150;
    }

    const descWords = description.split(/\s+/);
    let descWordMatches = 0;
    for (const queryWord of queryWords) {
        for (const descWord of descWords) {
            if (descWord.includes(queryWord)) {
                descWordMatches++;
                break;
            }
        }
    }
    score += descWordMatches * 10;

    score += Math.max(0, 50 - titleWords.length * 2);

    if (item.publishedAt || item.publishedDate || item.releaseDate) {
        score += 5;
    }

    if (item.rating && parseFloat(item.rating) >= 7.5) {
        score += 20;
    }

    return score;
}

async function searchNews(query: string, maxResults: number = 300) {
    try {
        console.log('📰 Searching Canadian news for:', query);

        // Try multiple Canadian news sources
        const newsSources = [
            'https://globalnews.ca/feed/',
            'https://www.cbc.ca/webfeed/rss/rss-topstoriestopstories',
            'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
            'https://www.cbc.ca/webfeed/rss/rss-business',
            'https://www.cbc.ca/webfeed/rss/rss-politics',
            'https://www.cbc.ca/webfeed/rss/rss-canada',
            'https://www.cbc.ca/webfeed/rss/rss-world',
            'https://www.cbc.ca/webfeed/rss/rss-technology',
            'https://www.cbc.ca/webfeed/rss/rss-sports',
            'https://www.cbc.ca/webfeed/rss/rss-arts'
        ];

        let allArticles = [];

        for (const source of newsSources) {
            try {
                console.log(`📰 Trying source: ${source}`);
                const response = await fetch(source, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Telecast/1.0)'
                    }
                });

                if (!response.ok) {
                    console.log(`📰 Source failed: ${source} - ${response.status}`);
                    continue;
                }

                const xmlText = await response.text();

                // Parse RSS feed - handle CDATA sections
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
                const descriptionRegex = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/;
                const linkRegex = /<link>(.*?)<\/link>/;
                const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
                const creatorRegex = /<dc:creator>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:creator>/;
                const mediaThumbnailRegex = /<media:thumbnail url="(.*?)"/;

                let match;
                let itemCount = 0;
                while ((match = itemRegex.exec(xmlText)) !== null) {
                    itemCount++;
                    const itemContent = match[1];

                    const title = itemContent.match(titleRegex)?.[1] || 'No title';
                    const description = itemContent.match(descriptionRegex)?.[1] || 'No description';
                    const link = itemContent.match(linkRegex)?.[1] || '';
                    const pubDate = itemContent.match(pubDateRegex)?.[1] || '';
                    const creator = itemContent.match(creatorRegex)?.[1] || 'Unknown Author';
                    const thumbnail = itemContent.match(mediaThumbnailRegex)?.[1] || 'https://via.placeholder.com/300x200?text=Canadian+News';

                    console.log(`📰 Parsed item ${itemCount}:`, { title: title.substring(0, 50) + '...', hasDescription: !!description, hasLink: !!link });

                    // Filter by query if provided (but be less strict for news)
                    if (query && query.trim() !== '') {
                        const queryLower = query.toLowerCase();
                        const titleLower = title.toLowerCase();
                        const descriptionLower = description.toLowerCase();

                        // For news, be more lenient - show articles if they match OR if query is general
                        const isGeneralQuery = ['canada', 'canadian', 'news', 'latest', 'update', 'today'].some(term =>
                            queryLower.includes(term)
                        );

                        if (!isGeneralQuery && !titleLower.includes(queryLower) && !descriptionLower.includes(queryLower)) {
                            console.log(`📰 Item filtered out by query: "${query}"`);
                            continue;
                        }
                    }

                    allArticles.push({
                        type: 'news',
                        id: `news-${allArticles.length}-${Date.now()}`,
                        title: title,
                        description: description,
                        thumbnail: thumbnail,
                        url: link,
                        author: creator,
                        publishedAt: pubDate,
                        source: source.includes('globalnews') ? 'globalnews' :
                            source.includes('cbc') ? 'cbc' : 'ctv',
                        sourceUrl: link,
                    });
                }

                console.log(`📰 Total items parsed from ${source}: ${itemCount}, articles added: ${allArticles.length}`);

                console.log(`📰 Found ${allArticles.length} articles from ${source}`);

                // Continue fetching from all sources

            } catch (error: any) {
                console.log(`📰 Error with source ${source}:`, error.message);
                continue;
            }
        }

        // If no articles found from RSS feeds, add some fallback Canadian news
        if (allArticles.length === 0) {
            console.log('📰 No RSS articles found, adding fallback Canadian news');
            allArticles = [
                {
                    type: 'news',
                    id: `news-fallback-1-${Date.now()}`,
                    title: 'Canadian News - Latest Updates',
                    description: 'Stay informed with the latest news from across Canada.',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Canadian+News',
                    url: 'https://www.cbc.ca/news',
                    author: 'CBC News',
                    publishedAt: new Date().toISOString(),
                    source: 'cbc',
                    sourceUrl: 'https://www.cbc.ca/news',
                },
                {
                    type: 'news',
                    id: `news-fallback-2-${Date.now()}`,
                    title: 'Toronto News - City Updates',
                    description: 'Latest news and updates from the city of Toronto.',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Toronto+News',
                    url: 'https://www.cbc.ca/news/canada/toronto',
                    author: 'CBC Toronto',
                    publishedAt: new Date().toISOString(),
                    source: 'cbc',
                    sourceUrl: 'https://www.cbc.ca/news/canada/toronto',
                },
                {
                    type: 'news',
                    id: `news-fallback-3-${Date.now()}`,
                    title: 'Vancouver News - West Coast Updates',
                    description: 'Latest news and updates from Vancouver and British Columbia.',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Vancouver+News',
                    url: 'https://www.cbc.ca/news/canada/british-columbia',
                    author: 'CBC Vancouver',
                    publishedAt: new Date().toISOString(),
                    source: 'cbc',
                    sourceUrl: 'https://www.cbc.ca/news/canada/british-columbia',
                },
                {
                    type: 'news',
                    id: `news-fallback-4-${Date.now()}`,
                    title: 'Montreal News - Quebec Updates',
                    description: 'Latest news and updates from Montreal and Quebec.',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Montreal+News',
                    url: 'https://www.cbc.ca/news/canada/montreal',
                    author: 'CBC Montreal',
                    publishedAt: new Date().toISOString(),
                    source: 'cbc',
                    sourceUrl: 'https://www.cbc.ca/news/canada/montreal',
                },
                {
                    type: 'news',
                    id: `news-fallback-5-${Date.now()}`,
                    title: 'Calgary News - Alberta Updates',
                    description: 'Latest news and updates from Calgary and Alberta.',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Calgary+News',
                    url: 'https://www.cbc.ca/news/canada/calgary',
                    author: 'CBC Calgary',
                    publishedAt: new Date().toISOString(),
                    source: 'cbc',
                    sourceUrl: 'https://www.cbc.ca/news/canada/calgary',
                }
            ];
        }

        const articles = allArticles;
        return articles;
    } catch (error: any) {
        console.error('📰 Error searching Canadian news:', error.message);

        // Fallback: return some sample Canadian news
        return [
            {
                type: 'news',
                id: `news-fallback-1`,
                title: 'Toronto News - Latest Updates',
                description: 'Stay informed with the latest news from Toronto and across Canada.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Toronto+News',
                url: 'https://www.cbc.ca/news/canada/toronto',
                author: 'CBC Toronto',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/toronto',
            },
            {
                type: 'news',
                id: `news-fallback-2`,
                title: 'Canadian Business News',
                description: 'Latest business and economic news from across Canada.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Business+News',
                url: 'https://www.cbc.ca/news/business',
                author: 'CBC Business',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/business',
            },
            {
                type: 'news',
                id: `news-fallback-3`,
                title: 'Vancouver News - West Coast Updates',
                description: 'Latest news and updates from Vancouver and British Columbia.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Vancouver+News',
                url: 'https://www.cbc.ca/news/canada/british-columbia',
                author: 'CBC Vancouver',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/british-columbia',
            },
            {
                type: 'news',
                id: `news-fallback-4`,
                title: 'Montreal News - Quebec Updates',
                description: 'Latest news and updates from Montreal and Quebec.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Montreal+News',
                url: 'https://www.cbc.ca/news/canada/montreal',
                author: 'CBC Montreal',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/montreal',
            },
            {
                type: 'news',
                id: `news-fallback-5`,
                title: 'Calgary News - Alberta Updates',
                description: 'Latest news and updates from Calgary and Alberta.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Calgary+News',
                url: 'https://www.cbc.ca/news/canada/calgary',
                author: 'CBC Calgary',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/calgary',
            },
            {
                type: 'news',
                id: `news-fallback-6`,
                title: 'Ottawa News - National Updates',
                description: 'Latest national news and updates from Ottawa.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Ottawa+News',
                url: 'https://www.cbc.ca/news/politics',
                author: 'CBC Politics',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/politics',
            },
            {
                type: 'news',
                id: `news-fallback-7`,
                title: 'Edmonton News - Alberta Updates',
                description: 'Latest news and updates from Edmonton and Alberta.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Edmonton+News',
                url: 'https://www.cbc.ca/news/canada/edmonton',
                author: 'CBC Edmonton',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/edmonton',
            },
            {
                type: 'news',
                id: `news-fallback-8`,
                title: 'Winnipeg News - Manitoba Updates',
                description: 'Latest news and updates from Winnipeg and Manitoba.',
                thumbnail: 'https://via.placeholder.com/300x200?text=Winnipeg+News',
                url: 'https://www.cbc.ca/news/canada/manitoba',
                author: 'CBC Manitoba',
                publishedAt: new Date().toISOString(),
                source: 'cbc',
                sourceUrl: 'https://www.cbc.ca/news/canada/manitoba',
            }
        ];
    }
}


export async function POST(request: Request) {
    try {
        const body: SearchRequest = await request.json();
        const { query, types, maxResults = 300, trending = false, page = 1, limit = 20 } = body;

        console.log('🔍 Search API called:', { query, types, maxResults, trending, page, limit });

        if (trending && query === 'recommended') {
            console.log('📈 Fetching trending content for types:', types);

            if (types.includes('tv')) {
                console.log('📺 Fetching trending TV shows');
                const tvResults = await getTrendingTVShows(maxResults);

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedResults = tvResults.slice(startIndex, endIndex);
                const totalPages = Math.ceil(tvResults.length / limit);

                return NextResponse.json({
                    results: paginatedResults,
                    pagination: {
                        page,
                        limit,
                        total: tvResults.length,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        startIndex: startIndex + 1,
                        endIndex: Math.min(endIndex, tvResults.length),
                    },
                });
            }

            if (types.includes('audiobook')) {
                console.log('🎧 Falling back to regular search for audiobooks');
                const fallbackResults = await searchAudiobooks('fiction', Math.min(maxResults, 300));

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedResults = fallbackResults.slice(startIndex, endIndex);
                const totalPages = Math.ceil(fallbackResults.length / limit);

                return NextResponse.json({
                    results: paginatedResults,
                    pagination: {
                        page,
                        limit,
                        total: fallbackResults.length,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        startIndex: startIndex + 1,
                        endIndex: Math.min(endIndex, fallbackResults.length),
                    },
                });
            }

            try {
                let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

                if (!baseUrl) {
                    const host = request.headers.get('host');
                    const protocol = request.headers.get('x-forwarded-proto') || 'https';
                    if (host) {
                        baseUrl = `${protocol}://${host}`;
                        console.log('📈 Constructed base URL from request headers:', baseUrl);
                    } else {
                        console.log('📈 No base URL configured and cannot construct from headers, skipping trending content');
                        throw new Error('No base URL configured');
                    }
                }

                const trendingResponse = await axios.get(`${baseUrl}/api/trending`);

                console.log('📈 Trending API response status:', trendingResponse.status);

                if (trendingResponse.status !== 200) {
                    throw new Error(`Trending API returned ${trendingResponse.status}`);
                }

                const trendingData = trendingResponse.data;
                console.log('📈 Trending data received:', {
                    videos: trendingData.videos?.length || 0,
                    books: trendingData.books?.length || 0,
                    music: trendingData.music?.length || 0,
                    podcasts: trendingData.podcasts?.length || 0,
                    news: trendingData.news?.length || 0,
                    tv: trendingData.tv?.length || 0,
                });

                let trendingResults: any[] = [];

                if (types.includes('all')) {
                    trendingResults = [
                        ...trendingData.videos || [],
                        ...trendingData.music || [],
                        ...trendingData.books || [],
                        ...trendingData.podcasts || [],
                        ...trendingData.news || [],
                    ];
                } else {
                    if (types.includes('video')) trendingResults.push(...(trendingData.videos || []));
                    if (types.includes('music')) trendingResults.push(...(trendingData.music || []));
                    if (types.includes('book')) trendingResults.push(...(trendingData.books || []));
                    if (types.includes('podcast')) trendingResults.push(...(trendingData.podcasts || []));
                    if (types.includes('news')) trendingResults.push(...(trendingData.news || []));
                }

                console.log('📈 Returning trending results:', trendingResults.length);

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedResults = trendingResults.slice(startIndex, endIndex);
                const totalPages = Math.ceil(trendingResults.length / limit);

                return NextResponse.json({
                    results: paginatedResults,
                    pagination: {
                        page,
                        limit,
                        total: trendingResults.length,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        startIndex: startIndex + 1,
                        endIndex: Math.min(endIndex, trendingResults.length),
                    },
                });
            } catch (error) {
                console.error('❌ Error fetching trending content:', error);

                if (types.includes('book')) {
                    console.log('📚 Falling back to fiction search for books');
                    const fallbackResults = await searchBooks('fiction', Math.min(maxResults, 300));

                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedResults = fallbackResults.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(fallbackResults.length / limit);

                    return NextResponse.json({
                        results: paginatedResults,
                        pagination: {
                            page,
                            limit,
                            total: fallbackResults.length,
                            totalPages,
                            hasNextPage: page < totalPages,
                            hasPrevPage: page > 1,
                            startIndex: startIndex + 1,
                            endIndex: Math.min(endIndex, fallbackResults.length),
                        },
                    });
                }
            }
        }

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        console.log('🔍 Performing regular search for query:', query);

        const searchPromises = [];

        if (types.includes('all')) {
            searchPromises.push(searchYouTube(query, maxResults));
            searchPromises.push(searchBooks(query, Math.min(maxResults, 300)));
            searchPromises.push(searchAudiobooks(query, Math.min(maxResults, 300)));
            searchPromises.push(searchPodcasts(query, maxResults, request));
            searchPromises.push(searchMusic(query, maxResults));
            searchPromises.push(searchTVShows(query, maxResults));
            searchPromises.push(searchNews(query, maxResults));
        } else {
            if (types.includes('video')) {
                searchPromises.push(searchYouTube(query, maxResults));
            }
            if (types.includes('book')) {
                searchPromises.push(searchBooks(query, Math.min(maxResults, 300)));
            }
            if (types.includes('audiobook')) {
                searchPromises.push(searchAudiobooks(query, Math.min(maxResults, 300)));
            }
            if (types.includes('podcast')) {
                searchPromises.push(searchPodcasts(query, maxResults, request));
            }
            if (types.includes('music')) {
                searchPromises.push(searchMusic(query, maxResults));
            }
            if (types.includes('tv')) {
                searchPromises.push(searchTVShows(query, maxResults));
            }
            if (types.includes('news')) {
                searchPromises.push(searchNews(query, maxResults));
            }
        }

        const results = await Promise.allSettled(searchPromises);
        const searchResults = results
            .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
            .flatMap(result => result.value);

        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);

        searchResults.sort((a, b) => {
            const scoreA = calculateRelevanceScore(a, queryWords, query);
            const scoreB = calculateRelevanceScore(b, queryWords, query);

            if (scoreA !== scoreB) {
                return scoreB - scoreA;
            }

            return a.title.length - b.title.length;
        });

        const topResults = searchResults.slice(0, 10);
        console.log('🔍 Top results with relevance scores:');
        topResults.forEach((result, index) => {
            const score = calculateRelevanceScore(result, queryWords, query);
            console.log(`${index + 1}. [${score}pts] ${result.title} (${result.type})`);
        });

        console.log('🔍 Search completed, returning results:', searchResults.length);

        const audiobooks = searchResults.filter(result => result.type === 'audiobook');
        if (audiobooks.length > 0) {
            console.log('🎧 Audiobooks being sent to frontend:', audiobooks.map(book => ({
                title: book.title,
                url: book.url,
                audibleUrl: book.audibleUrl,
                id: book.id
            })));
        }

        const tvShows = searchResults.filter(result => result.type === 'tv');
        if (tvShows.length > 0) {
            console.log('📺 TV shows being sent to frontend:', tvShows.map(show => ({
                title: show.title,
                url: show.url,
                id: show.id,
                rating: show.rating
            })));
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = searchResults.slice(startIndex, endIndex);
        const totalPages = Math.ceil(searchResults.length / limit);

        return NextResponse.json({
            results: paginatedResults,
            pagination: {
                page,
                limit,
                total: searchResults.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                startIndex: startIndex + 1,
                endIndex: Math.min(endIndex, searchResults.length),
            },
        });
    } catch (error) {
        console.error('❌ Search error:', error);
        return NextResponse.json(
            { error: 'An error occurred while searching' },
            { status: 500 }
        );
    }
}