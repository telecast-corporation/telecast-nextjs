import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from "@/lib/prisma";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME || "telecast-corp-podcast-bucket";

export async function GET(
  request: NextRequest,
  { params }: { params: { episodeId: string } }
) {
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const episodeId = params.episodeId;

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

    // Get temp files for this episode from Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({
      prefix: `temp/${episode.podcastId}/`,
      maxResults: 100
    });

    // Filter and format temp files
    const tempFiles = files
      .filter(file => file.name.includes(`temp/${episode.podcastId}/`))
      .map(file => {
        const url = `https://storage.googleapis.com/${bucketName}/${file.name}`;
        const fileNameParts = file.name.split('/');
        const sessionId = fileNameParts[2]; // temp/podcastId/sessionId/filename
        
        return {
          fileName: file.name,
          url: url,
          sessionId: sessionId,
          originalName: fileNameParts[fileNameParts.length - 1],
          size: file.metadata?.size || 0,
          createdAt: file.metadata?.timeCreated || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date desc

    return NextResponse.json({
      episodeId: episodeId,
      podcastId: episode.podcastId,
      files: tempFiles
    });

  } catch (error) {
    console.error("Error getting temp files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
 