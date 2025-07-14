-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "referenceId" TEXT;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rssFeed" TEXT;

-- CreateTable
CREATE TABLE "FileReference" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'temp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileReference_referenceId_key" ON "FileReference"("referenceId");

-- CreateIndex
CREATE INDEX "FileReference_referenceId_idx" ON "FileReference"("referenceId");

-- CreateIndex
CREATE INDEX "FileReference_userId_idx" ON "FileReference"("userId");

-- CreateIndex
CREATE INDEX "FileReference_podcastId_idx" ON "FileReference"("podcastId");

-- AddForeignKey
ALTER TABLE "FileReference" ADD CONSTRAINT "FileReference_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileReference" ADD CONSTRAINT "FileReference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
