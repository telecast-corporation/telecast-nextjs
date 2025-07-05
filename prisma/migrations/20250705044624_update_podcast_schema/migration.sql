/*
  Warnings:

  - You are about to drop the column `likes` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `ownerEmail` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `rssFeed` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the `TelecastPodcast` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TelecastPodcast" DROP CONSTRAINT "TelecastPodcast_userId_fkey";

-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "likes",
DROP COLUMN "ownerEmail",
DROP COLUMN "ownerName",
DROP COLUMN "rssFeed",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rssFeed" TEXT;

-- DropTable
DROP TABLE "TelecastPodcast";
