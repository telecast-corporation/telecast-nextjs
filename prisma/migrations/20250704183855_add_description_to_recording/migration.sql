/*
  Warnings:

  - Added the required column `description` to the `Recording` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "description" TEXT NOT NULL;
