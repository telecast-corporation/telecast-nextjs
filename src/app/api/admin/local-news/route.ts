
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface PostBody {
  title: string;
  description: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin' || !token.sub) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  const { title, description, videoUrl, locationCity, locationCountry } = await req.json() as PostBody;

  if (!title || !description || !videoUrl || !locationCity || !locationCountry) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  try {
    const newsItem = await prisma.localNews.create({
      data: {
        title,
        description,
        videoUrl,
        locationCity,
        locationCountry,
        category: "Default",
        status: 'pending',
        userId: userId, 
      },
    });

    const approvalUrl = `${process.env.NEXTAUTH_URL}/api/admin/local-news/approve?id=${newsItem.id}`;
    const rejectionUrl = `${process.env.NEXTAUTH_URL}/api/admin/local-news/reject?id=${newsItem.id}`;

    const mailOptions = {
      from: `"Telecast" <${process.env.SMTP_FROM}>`,
      to: 'samueloni0987@gmail.com',
      subject: 'New EventSubmission for Approval',
      html: `
        <h1>New EventSubmission</h1>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
        <p><strong>Location:</strong> ${locationCity}, ${locationCountry}</p>
        <video width="320" height="240" controls>
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <br>
        <a href="${approvalUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Approve</a>
        <a href="${rejectionUrl}" style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reject</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'News submitted for approval' }, { status: 201 });
  } catch (error) {
    console.error('Error creating news item or sending email:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
