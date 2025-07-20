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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const podcastId = params.id;

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

    // Get temp files for this podcast from Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({
      prefix: `temp/${podcastId}/`,
      maxResults: 100
    });

    // Filter and format temp files
    const tempFiles = files
      .filter(file => file.name.includes(`temp/${podcastId}/`))
      .map(file => {
        const url = `https://storage.googleapis.com/${bucketName}/${file.name}`;
        const fileNameParts = file.name.split('/');
        const referenceId = fileNameParts[2]; // temp/podcastId/referenceId/filename
        
        return {
          fileName: file.name,
          url: url,
          referenceId: referenceId,
          originalName: fileNameParts[fileNameParts.length - 1],
          size: file.metadata?.size || 0,
          createdAt: file.metadata?.timeCreated || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date desc

    return NextResponse.json({
      podcastId: podcastId,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const podcastId = params.id;

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const referenceId = formData.get("referenceId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!referenceId) {
      return NextResponse.json({ error: "No reference ID provided" }, { status: 400 });
    }

    // Validate reference ID ownership
    const fileReference = await prisma.fileReference.findFirst({
      where: {
        referenceId: referenceId,
        userId: user.id,
        podcastId: podcastId
      }
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
    const tempFileName = `temp/${podcastId}/${referenceId}/${timestamp}.${fileExtension}`;

    // Upload to temporary location in Google Cloud Storage
    const { uploadPodcastFile } = await import("@/lib/storage");
    const result = await uploadPodcastFile(
      buffer,
      tempFileName,
      file.type,
      false // not an image
    );

    return NextResponse.json({
      success: true,
      tempUrl: result.url,
      tempFileName: result.filename,
      size: file.size,
      type: file.type,
      referenceId: referenceId,
    });

  } catch (error) {
    console.error("Temp upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload temporary file" },
      { status: 500 }
    );
  }
} 
 