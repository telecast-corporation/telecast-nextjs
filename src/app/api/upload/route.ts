
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = 'telecast-videos'; // Replace with your bucket name

async function notifyUploadToMail(file: File) {
    const response = await fetch('http://localhost:3000/api/events/notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            title: file.name, 
            description: "A new file has been uploaded.",
            category: "Uploaded Media",
            city: "Unknown",
            country: "Unknown",
            id: uuidv4(),
        }),
    });

    if (!response.ok) {
        console.error('Failed to send notification email.');
    }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const blob = storage.bucket(bucketName).file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    const fileBuffer = await file.arrayBuffer();
    blobStream.end(Buffer.from(fileBuffer));

    await new Promise((resolve, reject) => {
      blobStream.on('finish', resolve);
      blobStream.on('error', reject);
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    await notifyUploadToMail(file);

    return NextResponse.json({ videoUrl: publicUrl });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
