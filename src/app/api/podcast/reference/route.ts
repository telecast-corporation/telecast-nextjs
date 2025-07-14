import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { podcastId } = await request.json();

    if (!podcastId) {
      return NextResponse.json({ error: "Podcast ID is required" }, { status: 400 });
    }

    // Check if podcast belongs to current user
    const podcast = await prisma.podcast.findFirst({
      where: {
        id: podcastId,
        userId: session.user.id
      }
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
    }

    // Generate a unique reference ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const referenceId = `ref_${timestamp}_${randomString}`;

    // Store reference ID with ownership
    const reference = await prisma.fileReference.create({
      data: {
        referenceId: referenceId,
        podcastId: podcastId,
        userId: session.user.id,
        status: 'temp', // temp, final, deleted
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      referenceId: referenceId,
      podcastId: podcastId,
      createdAt: reference.createdAt.toISOString(),
    });

  } catch (error) {
    console.error("Error generating reference ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
 
 