/*
  Warnings:

  - A unique constraint covering the columns `[userId,episodeTitle,audioFileName]` on the table `TelecastPodcast` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TelecastPodcast_userId_episodeTitle_audioFileName_key" ON "TelecastPodcast"("userId", "episodeTitle", "audioFileName");
