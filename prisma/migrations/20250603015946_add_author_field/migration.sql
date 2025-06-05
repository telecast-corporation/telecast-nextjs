/*
  Warnings:

  - Added the required column `author` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "author" TEXT NOT NULL;
