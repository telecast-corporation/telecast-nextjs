import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moveFile, deleteFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { referenceId, tempPath, podcastId, metadata } = body;

    if (!referenceId || !tempPath || !podcastId || !metadata) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate final file path
    const timestamp = Date.now();
    const fileExtension = tempPath.split('.').pop() || 'wav';
    const finalFileName = `episodes/${podcastId}/${referenceId}/${timestamp}.${fileExtension}`;

    // Move file from temp to final location
    const moveResult = await moveFile(tempPath, finalFileName);
    if (!moveResult.success) {
      throw new Error('Failed to move file to final location');
    }

    // Create episode in database
    const episode = await prisma.episode.create({
      data: {
        title: metadata.episodeTitle,
        description: metadata.episodeDescription,
        duration: 0, // Will be calculated later
        episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : null,
        seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : null,
        audioUrl: moveResult.url,
        publishDate: new Date(metadata.publishDate),
        podcastId: podcastId,
        authorId: session.user.id,
        explicit: metadata.explicit,
        keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [],
        referenceId: referenceId,
      },
    });

    // Clean up temp file
    try {
      await deleteFile(tempPath);
    } catch (error) {
      console.error('Failed to delete temp file:', error);
      // Don't fail the whole operation if temp cleanup fails
    }

    return NextResponse.json({
      success: true,
      episodeId: episode.id,
      episodeUrl: moveResult.url,
    });

  } catch (error) {
    console.error("Finalize error:", error);
    return NextResponse.json(
      { error: "Failed to finalize podcast" },
      { status: 500 }
    );
  }
} 
 