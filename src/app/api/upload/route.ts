
import { NextRequest, NextResponse } from 'next/server';
// import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// const storage = new Storage({
//   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
//   credentials: {
//     client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
//     private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   },
// });

const bucketName = 'telecast-videos'; // Replace with your bucket name

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    // const blob = storage.bucket(bucketName).file(fileName);
    // const blobStream = blob.createWriteStream({
    //   resumable: false,
    // });

    const fileBuffer = await file.arrayBuffer();
    // blobStream.end(Buffer.from(fileBuffer));

    // await new Promise((resolve, reject) => {
    //   blobStream.on('finish', resolve);
    //   blobStream.on('error', reject);
    // });

    // const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({ videoUrl: "publicUrl" });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
