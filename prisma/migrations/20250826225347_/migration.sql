/*
  Warnings:

  - You are about to drop the column `referenceId` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the `Draft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileReference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recording` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `audioUrl` on table `Episode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Draft" DROP CONSTRAINT "Draft_podcastId_fkey";

-- DropForeignKey
ALTER TABLE "Draft" DROP CONSTRAINT "Draft_userId_fkey";

-- DropForeignKey
ALTER TABLE "FileReference" DROP CONSTRAINT "FileReference_podcastId_fkey";

-- DropForeignKey
ALTER TABLE "FileReference" DROP CONSTRAINT "FileReference_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recording" DROP CONSTRAINT "Recording_userId_fkey";

-- DropIndex
DROP INDEX "Episode_title_idx";

-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "referenceId",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "audioUrl" SET NOT NULL,
ALTER COLUMN "keywords" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "Draft";

-- DropTable
DROP TABLE "FileReference";

-- DropTable
DROP TABLE "Recording";

-- CreateIndex
CREATE INDEX "Episode_isPublished_idx" ON "Episode"("isPublished");

-- CreateIndex
CREATE INDEX "Episode_publishedAt_idx" ON "Episode"("publishedAt");
