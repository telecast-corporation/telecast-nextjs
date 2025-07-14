import { NextRequest, NextResponse } from "next/server";
import { uploadPodcastFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const podcastId = formData.get("podcastId") as string;
    const referenceId = formData.get("referenceId") as string;
    const tempPath = formData.get("tempPath") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid file type. Only audio files are allowed." }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let tempFileName: string;

    if (tempPath) {
      // Update existing temp file
      tempFileName = tempPath;
      console.log('Updating existing temp file:', tempFileName);
    } else {
      // Create new temp file
      if (!podcastId) {
        return NextResponse.json({ error: "No podcast ID provided" }, { status: 400 });
      }

      if (!referenceId) {
        return NextResponse.json({ error: "No reference ID provided" }, { status: 400 });
      }

      // Generate temporary filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      tempFileName = `temp/${podcastId}/${referenceId}/${timestamp}.${fileExtension}`;
      console.log('Creating new temp file:', tempFileName);
    }

    // Upload to temporary location in Google Cloud Storage
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
      tempPath: tempFileName,
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
 