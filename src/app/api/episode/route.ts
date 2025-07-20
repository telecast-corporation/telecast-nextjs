import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, podcastId, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!podcastId) {
      return NextResponse.json({ error: "Podcast ID is required" }, { status: 400 });
    }

    // Check if podcast belongs to current user
    const podcast = await prisma.podcast.findFirst({
      where: {
        id: podcastId,
        userId: user.id
      }
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
    }

    // Create the episode
    const episode = await prisma.episode.create({
      data: {
        title,
        description: description || "",
        podcastId,
        episodeNumber: 1, // You might want to calculate this based on existing episodes
        seasonNumber: 1,
        duration: 0, // Will be updated after processing
        audioUrl: "", // Will be updated after finalization
      },
      include: {
        podcast: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    return NextResponse.json({
      id: episode.id,
      title: episode.title,
      podcastId: episode.podcastId,
      description: episode.description,
      episodeNumber: episode.episodeNumber,
      seasonNumber: episode.seasonNumber,
    });

  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
 