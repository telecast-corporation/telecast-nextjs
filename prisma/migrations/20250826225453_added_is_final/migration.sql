-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Episode_isFinal_idx" ON "Episode"("isFinal");
