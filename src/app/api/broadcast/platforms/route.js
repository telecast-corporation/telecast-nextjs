"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("next/server");
var auth0_user_1 = require("@/lib/auth0-user");
// authOptions removed - using Auth0
var prisma_1 = require("@/lib/prisma");
var podcast_platforms_1 = require("@/lib/podcast-platforms");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, body, episodeId, platforms, metadata, episode, results, _i, _a, platform, accessToken, _b, spotifyApi, spotifyMetadata, _c, appleApi, appleMetadata, _d, googleApi, googleMetadata, _e, error_1, error_2;
        var _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    _l.trys.push([0, 18, , 19]);
                    return [4 /*yield*/, (0, auth0_user_1.getUserFromRequest)(request)];
                case 1:
                    user = _l.sent();
                    if (!((_f = session === null || session === void 0 ? void 0 : session.user) === null || _f === void 0 ? void 0 : _f.id)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _l.sent();
                    episodeId = body.episodeId, platforms = body.platforms, metadata = body.metadata;
                    if (!episodeId || !platforms || !metadata) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 })];
                    }
                    return [4 /*yield*/, prisma_1.prisma.episode.findUnique({
                            where: { id: episodeId },
                            include: { podcast: true },
                        })];
                case 3:
                    episode = _l.sent();
                    if (!episode) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Episode not found' }, { status: 404 })];
                    }
                    // Verify user owns the episode
                    if (episode.podcast.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied' }, { status: 403 })];
                    }
                    results = {
                        spotify: null,
                        apple: null,
                        google: null,
                    };
                    _i = 0, _a = platforms;
                    _l.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 16];
                    platform = _a[_i];
                    return [4 /*yield*/, (0, podcast_platforms_1.getValidAccessToken)(user.id, platform)];
                case 5:
                    accessToken = _l.sent();
                    if (!accessToken) {
                        results[platform] = {
                            success: false,
                            error: 'Platform not connected or token expired',
                        };
                        return [3 /*break*/, 15];
                    }
                    _l.label = 6;
                case 6:
                    _l.trys.push([6, 14, , 15]);
                    _b = platform;
                    switch (_b) {
                        case 'spotify': return [3 /*break*/, 7];
                        case 'apple': return [3 /*break*/, 9];
                        case 'google': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 7:
                    spotifyApi = new podcast_platforms_1.SpotifyPodcastAPI(accessToken);
                    spotifyMetadata = {
                        episodeTitle: metadata.episodeTitle,
                        episodeDescription: metadata.episodeDescription,
                        episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
                        seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
                        explicit: metadata.explicit,
                        publishDate: metadata.publishDate,
                        keywords: metadata.keywords ? metadata.keywords.split(',').map(function (k) { return k.trim(); }) : [],
                    };
                    _c = results;
                    return [4 /*yield*/, spotifyApi.createEpisode('', spotifyMetadata, episode.audioUrl)];
                case 8:
                    _c.spotify = _l.sent();
                    return [3 /*break*/, 13];
                case 9:
                    appleApi = new podcast_platforms_1.ApplePodcastAPI(accessToken);
                    appleMetadata = {
                        episodeTitle: metadata.episodeTitle,
                        episodeDescription: metadata.episodeDescription,
                        episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
                        seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
                        explicit: metadata.explicit,
                        publishDate: metadata.publishDate,
                        keywords: metadata.keywords ? metadata.keywords.split(',').map(function (k) { return k.trim(); }) : [],
                        subtitle: (_g = metadata.apple) === null || _g === void 0 ? void 0 : _g.subtitle,
                        summary: (_h = metadata.apple) === null || _h === void 0 ? void 0 : _h.summary,
                        itunesCategory: (_j = metadata.apple) === null || _j === void 0 ? void 0 : _j.itunesCategory,
                    };
                    _d = results;
                    return [4 /*yield*/, appleApi.createEpisode('', appleMetadata, episode.audioUrl)];
                case 10:
                    _d.apple = _l.sent();
                    return [3 /*break*/, 13];
                case 11:
                    googleApi = new podcast_platforms_1.GooglePodcastAPI(accessToken);
                    googleMetadata = {
                        email: ((_k = metadata.google) === null || _k === void 0 ? void 0 : _k.email) || user.email || '',
                        episodeTitle: metadata.episodeTitle,
                        episodeDescription: metadata.episodeDescription,
                        episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
                        seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
                        explicit: metadata.explicit,
                        publishDate: metadata.publishDate,
                        keywords: metadata.keywords ? metadata.keywords.split(',').map(function (k) { return k.trim(); }) : [],
                    };
                    _e = results;
                    return [4 /*yield*/, googleApi.uploadToYouTube(googleMetadata, episode.audioUrl)];
                case 12:
                    _e.google = _l.sent();
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_1 = _l.sent();
                    console.error("Error broadcasting to ".concat(platform, ":"), error_1);
                    results[platform] = {
                        success: false,
                        error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                    };
                    return [3 /*break*/, 15];
                case 15:
                    _i++;
                    return [3 /*break*/, 4];
                case 16: 
                // Update episode with broadcast results
                return [4 /*yield*/, prisma_1.prisma.episode.update({
                        where: { id: episodeId },
                        data: {
                            // You might want to store broadcast results in a separate table
                            // For now, we'll just mark it as published
                            updatedAt: new Date(),
                        },
                    })];
                case 17:
                    // Update episode with broadcast results
                    _l.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            results: results,
                            message: 'Broadcast completed',
                        })];
                case 18:
                    error_2 = _l.sent();
                    console.error('Broadcast error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to broadcast episode' }, { status: 500 })];
                case 19: return [2 /*return*/];
            }
        });
    });
}
