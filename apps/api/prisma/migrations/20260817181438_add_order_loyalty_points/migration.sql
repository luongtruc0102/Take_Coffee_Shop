-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "loyaltyDiscountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyPointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyPointsGrantedAt" TIMESTAMP(3),
ADD COLUMN     "loyaltyPointsUsed" INTEGER NOT NULL DEFAULT 0;
