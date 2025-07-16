import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\n/g, '\n'),
  },
});

const bucketName = process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME || "telecast-corp-podcast-bucket";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const podcastId = searchParams.get("podcastId");
    if (!podcastId) {
      return NextResponse.json({ error: "Missing podcastId" }, { status: 400 });
    }
    // Check if podcast belongs to current user
    const podcast = await prisma.podcast.findFirst({
      where: { id: podcastId, userId: session.user.id }
    });
    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
    }
    // Get temp files for this podcast from Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: `podcasts/temp/${podcastId}/`, maxResults: 100 });
    const tempFiles = files
      .filter(file => file.name.includes(`podcasts/temp/${podcastId}/`))
      .map(file => {
        const url = `https://storage.googleapis.com/${bucketName}/${file.name}`;
        const fileNameParts = file.name.split('/');
        const referenceId = fileNameParts[3]; // podcasts/temp/podcastId/referenceId/filename
        return {
          fileName: file.name,
          url,
          referenceId,
          originalName: fileNameParts[fileNameParts.length - 1],
          size: file.metadata?.size || 0,
          createdAt: file.metadata?.timeCreated || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ podcastId, files: tempFiles });
  } catch (error) {
    console.error("Error getting temp files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const podcastId = formData.get("podcastId") as string;
    const referenceId = formData.get("referenceId") as string;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!podcastId) {
      return NextResponse.json({ error: "No podcastId provided" }, { status: 400 });
    }
    if (!referenceId) {
      return NextResponse.json({ error: "No reference ID provided" }, { status: 400 });
    }
    // Validate reference ID ownership
    const fileReference = await prisma.fileReference.findFirst({
      where: { referenceId, userId: session.user.id, podcastId }
    });
    if (!fileReference) {
      return NextResponse.json({ error: "Reference ID not found or access denied" }, { status: 404 });
    }
    // Validate file type
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid file type. Only audio files are allowed." }, { status: 400 });
    }
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    // Generate temporary filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const tempFileName = `podcasts/temp/${podcastId}/${referenceId}/${timestamp}.${fileExtension}`;
    // Upload to temporary location in Google Cloud Storage
    const { uploadPodcastTempFile } = await import("@/lib/storage");
    const result = await uploadPodcastTempFile(buffer, tempFileName, file.type);
    return NextResponse.json({
      success: true,
      tempUrl: result.url,
      tempFileName: result.filename,
      size: file.size,
      type: file.type,
      referenceId,
    });
  } catch (error) {
    console.error("Temp upload error:", error);
    return NextResponse.json({ error: "Failed to upload temporary file" }, { status: 500 });
  }
} 
 