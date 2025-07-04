/*
  Warnings:

  - You are about to drop the column `url` on the `Recording` table. All the data in the column will be lost.
  - Added the required column `audioUrl` to the `Recording` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recording" DROP COLUMN "url",
ADD COLUMN     "audioUrl" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;
