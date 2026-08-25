-- Lưu nguyên nhân và thời điểm hủy để lịch sử đơn hàng minh bạch hơn.
ALTER TABLE "Order"
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "cancelledAt" TIMESTAMP(3);
