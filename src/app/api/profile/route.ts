import { NextResponse } from 'next/server';
import { getOrCreateUser, getUserFromRequest } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadProfileFile, deleteProfileFile } from '@/lib/storage';

export async function PUT(req: Request) {
  try {
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const imageFile = formData.get('imageFile') as File;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    let imageUrl = user.image;

    // If new image is provided, upload it
    if (imageFile) {
      // Convert file to buffer
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      // Upload new image
      const result = await uploadProfileFile(
        imageBuffer,
        imageFile.name,
        imageFile.type
      );
      imageUrl = result.url;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        image: imageUrl,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      usedFreeTrial: user.usedFreeTrial,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
} 