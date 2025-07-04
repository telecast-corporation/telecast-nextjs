-- CreateTable
CREATE TABLE "TelecastPodcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "episodeTitle" TEXT NOT NULL,
    "episodeDescription" TEXT NOT NULL,
    "episodeType" TEXT NOT NULL DEFAULT 'full',
    "episodeNumber" TEXT,
    "pubDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audioFileName" TEXT NOT NULL,
    "audioFileSize" INTEGER NOT NULL,
    "audioFileType" TEXT NOT NULL,
    "audioFileData" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TelecastPodcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelecastPodcast_userId_idx" ON "TelecastPodcast"("userId");

-- CreateIndex
CREATE INDEX "TelecastPodcast_title_idx" ON "TelecastPodcast"("title");

-- CreateIndex
CREATE INDEX "TelecastPodcast_category_idx" ON "TelecastPodcast"("category");

-- CreateIndex
CREATE INDEX "TelecastPodcast_published_idx" ON "TelecastPodcast"("published");

-- CreateIndex
CREATE INDEX "TelecastPodcast_createdAt_idx" ON "TelecastPodcast"("createdAt");

-- AddForeignKey
ALTER TABLE "TelecastPodcast" ADD CONSTRAINT "TelecastPodcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
