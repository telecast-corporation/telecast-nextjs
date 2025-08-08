import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth0-user';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { title, description, explicit = false, keywords = [], publishDate } = await request.json();

    const draft = await prisma.draft.findFirst({ where: { id, userId: user.id }, include: { podcast: true } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    if (!draft.originalPath && !draft.editedPath) {
      return NextResponse.json({ error: 'No audio uploaded' }, { status: 400 });
    }

    // Determine audio URL by generating a signed read URL once published OR rely on GCS signed URL generation on demand
    // Here we keep paths and use long-lived signed URL for published episode
    const finalPath = draft.editedPath || draft.originalPath!;

    // Create episode with next episode number
    const latest = await prisma.episode.findFirst({
      where: { podcastId: draft.podcastId },
      orderBy: { episodeNumber: 'desc' },
    });
    const nextEpisodeNumber = latest?.episodeNumber ? latest.episodeNumber + 1 : 1;

    const episode = await prisma.episode.create({
      data: {
        title,
        description: description || '',
        podcastId: draft.podcastId,
        episodeNumber: nextEpisodeNumber,
        seasonNumber: 1,
        duration: 0,
        audioUrl: finalPath, // store path; consumer can resolve to signed URL if needed
        explicit,
        keywords,
        publishedAt: publishDate ? new Date(publishDate) : new Date(),
        referenceId: draft.id,
      },
    });

    // Publish podcast if first episode
    const count = await prisma.episode.count({ where: { podcastId: draft.podcastId } });
    if (count === 1 && !draft.podcast.published) {
      await prisma.podcast.update({ where: { id: draft.podcastId }, data: { published: true } });
    }

    // Close draft
    await prisma.draft.update({ where: { id }, data: { status: 'closed', updatedAt: new Date() } });

    return NextResponse.json({ success: true, episodeId: episode.id, podcastId: draft.podcastId });
  } catch (error) {
    console.error('Draft finalize error:', error);
    return NextResponse.json({ error: 'Failed to finalize draft' }, { status: 500 });
  }
} 