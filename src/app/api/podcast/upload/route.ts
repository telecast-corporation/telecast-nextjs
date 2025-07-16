import { NextRequest, NextResponse } from "next/server";
import { uploadPodcastTempFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const podcastId = formData.get("podcastId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!podcastId) {
      return NextResponse.json({ error: "No podcast ID provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid file type. Only audio files are allowed." }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Cloud Storage temp location
    const result = await uploadPodcastTempFile(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.filename,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 
 