/*
  Warnings:

  - You are about to drop the column `author` on the `Podcast` table. All the data in the column will be lost.
  - Added the required column `imageFilename` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "author",
ADD COLUMN     "imageFilename" TEXT NOT NULL;
