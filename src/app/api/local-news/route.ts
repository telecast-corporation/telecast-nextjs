
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    const where = status ? { status } : {};
    const news = await prisma.localNews.findMany({ where });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const locationCity = formData.get('locationCity') as string;
    const locationCountry = formData.get('locationCountry') as string;

    if (!file || !title || !description || !locationCity || !locationCountry) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // In a real app, you'd upload to a service like S3. For now, we simulate.
    const videoUrl = `/uploads/placeholder_${Date.now()}_${file.name}`;

    const newsItem = await prisma.localNews.create({
      data: {
        title,
        description,
        videoUrl, // This is the placeholder URL
        locationCity,
        locationCountry,
        category: "Default",
        status: 'pending',
        userId: userId, 
      },
    });

    // Send email for approval
    const approvalUrl = `${process.env.NEXTAUTH_URL}/admin/news-approval?id=${newsItem.id}`;
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'admin@telecast.ca',
      subject: 'New Local News Submission for Approval',
      html: `
        <h1>New Submission</h1>
        <p><strong>Title:</strong> ${title}</p>
        <p>A new local news video has been submitted for your approval.</p>
        <p>Please review it here: <a href="${approvalUrl}">${approvalUrl}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'News submitted for approval' }, { status: 201 });

  } catch (error) {
    console.error('Error creating news item or sending email:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `Internal server error: ${error.message}`}, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
