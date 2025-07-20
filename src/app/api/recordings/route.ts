import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const audioFile = formData.get('audio') as File;

    if (!title || !audioFile) {
      return NextResponse.json({ error: 'Title and audio file are required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'recordings');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${dbUser.id}_${timestamp}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
    const filePath = join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Parse tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Create recording in database
    const recording = await prisma.recording.create({
      data: {
        title,
        description: description || "",
        audioUrl: `/uploads/recordings/${filename}`,
        duration: 0, // Will be calculated later if needed
        userId: dbUser.id,
        tags: tagArray,
        isPublic: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(recording);
  } catch (error) {
    console.error('Recording upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublic = searchParams.get('public') === 'true';
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause
    const where: any = {};
    
    if (isPublic) {
      where.isPublic = true;
    } else if (userId) {
      where.userId = userId;
    } else {
      // Default: get user's own recordings
      where.userId = dbUser.id;
    }

    // Get recordings with pagination
    const [recordings, total] = await Promise.all([
      prisma.recording.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.recording.count({ where })
    ]);

    return NextResponse.json({
      recordings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
} 