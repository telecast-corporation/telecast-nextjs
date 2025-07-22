import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const episodeId = id;

    // Get the episode and check ownership
    const episode = await prisma.episode.findFirst({
      where: {
        id: episodeId,
        podcast: {
          userId: user.id
        }
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

    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Check if the episode belongs to the current user
    if (episode.podcast.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: episode.id,
      title: episode.title,
      podcastId: episode.podcastId,
      podcastTitle: episode.podcast.title,
      userId: episode.podcast.userId
    });

  } catch (error) {
    console.error("Error checking episode ownership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
 