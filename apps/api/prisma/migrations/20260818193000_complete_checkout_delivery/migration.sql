-- Persist the delivery quote that is included in the final order total.
ALTER TABLE "Order"
ADD COLUMN "deliveryLatitude" DECIMAL(10,7),
ADD COLUMN "deliveryLongitude" DECIMAL(10,7),
ADD COLUMN "deliveryDistanceKm" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "deliveryBaseFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "deliveryDiscountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Preserve every database voucher applied to an order (maximum two at checkout).
CREATE TABLE "OrderVoucher" (
  "orderId" INTEGER NOT NULL,
  "voucherId" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderVoucher_pkey" PRIMARY KEY ("orderId", "voucherId")
);

CREATE INDEX "OrderVoucher_voucherId_idx" ON "OrderVoucher"("voucherId");

ALTER TABLE "OrderVoucher"
ADD CONSTRAINT "OrderVoucher_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderVoucher"
ADD CONSTRAINT "OrderVoucher_voucherId_fkey"
FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;