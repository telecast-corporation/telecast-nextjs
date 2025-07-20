import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const podcastId = searchParams.get("podcastId");
    if (!podcastId) {
      return NextResponse.json({ error: "Missing podcastId" }, { status: 400 });
    }
    // Check if podcast belongs to current user
    const podcast = await prisma.podcast.findFirst({
      where: { id: podcastId, userId: user.id }
    });
    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
    }
    // Get all episodes for this podcast
    const episodes = await prisma.episode.findMany({
      where: { podcastId },
      orderBy: { createdAt: 'desc' },
      include: {
        podcast: { select: { id: true, title: true, userId: true } }
      }
    });
    return NextResponse.json({ podcastId, episodes });
  } catch (error) {
    console.error("Error getting episodes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, description, referenceId, podcastId } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!referenceId) {
      return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
    }
    if (!podcastId) {
      return NextResponse.json({ error: "Podcast ID is required" }, { status: 400 });
    }
    // Check if podcast belongs to current user
    const podcast = await prisma.podcast.findFirst({
      where: { id: podcastId, userId: user.id }
    });
    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
    }
    // Get the latest episode number for this podcast
    const latestEpisode = await prisma.episode.findFirst({
      where: { podcastId },
      orderBy: { episodeNumber: 'desc' }
    });
    const nextEpisodeNumber = latestEpisode && latestEpisode.episodeNumber ? latestEpisode.episodeNumber + 1 : 1;
    // Create the episode
    const episode = await prisma.episode.create({
      data: {
        title,
        description: description || "",
        podcastId,
        episodeNumber: nextEpisodeNumber,
        seasonNumber: 1,
        duration: 0,
        audioUrl: "",
        referenceId,
      },
      include: {
        podcast: { select: { id: true, title: true, userId: true } }
      }
    });
    return NextResponse.json({
      id: episode.id,
      title: episode.title,
      podcastId: episode.podcastId,
      description: episode.description,
      episodeNumber: episode.episodeNumber,
      seasonNumber: episode.seasonNumber,
      referenceId: episode.referenceId,
    });
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
 