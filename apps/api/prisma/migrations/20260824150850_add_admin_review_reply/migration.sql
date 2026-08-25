-- AlterTable
ALTER TABLE "OrderReview" ADD COLUMN     "adminRepliedAt" TIMESTAMP(3),
ADD COLUMN     "adminRepliedById" INTEGER,
ADD COLUMN     "adminReply" TEXT;

-- CreateIndex
CREATE INDEX "OrderReview_adminRepliedById_idx" ON "OrderReview"("adminRepliedById");

-- AddForeignKey
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_adminRepliedById_fkey" FOREIGN KEY ("adminRepliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
