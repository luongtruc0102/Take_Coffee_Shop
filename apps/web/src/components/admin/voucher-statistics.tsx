'use client';

import type { VoucherStatistics } from '@/types/dashboard';

type VoucherStatisticsProps = {
  data: VoucherStatistics;
};

export default function VoucherStatisticsCard({
  data,
}: VoucherStatisticsProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Voucher
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Hiệu quả sử dụng voucher
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[#FAF8F5] p-4">
          <p className="text-sm text-[#78866B]">
            Voucher đang hoạt động
          </p>

          <p className="mt-1 text-2xl font-bold text-[#4A2C20]">
            {data.activeVouchers}
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF8F5] p-4">
          <p className="text-sm text-[#78866B]">
            Tổng tiền đã giảm
          </p>

          <p className="mt-1 text-2xl font-bold text-[#4A2C20]">
            {formatCurrency(data.totalDiscount)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.topVouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="flex items-center justify-between rounded-xl border border-[#F0E8E0] px-4 py-3"
          >
            <div>
              <p className="font-semibold text-[#1F1B18]">
                {voucher.code}
              </p>

              <p className="mt-1 text-xs text-[#78866B]">
                Đã dùng {voucher.usedCount}
                {voucher.usageLimit !== null
                  ? ` / ${voucher.usageLimit}`
                  : ''}
              </p>
            </div>

            <span className="rounded-full bg-[#F3E9DE] px-3 py-1 text-xs font-medium text-[#4A2C20]">
              Còn {voucher.remainingUsage ?? '∞'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}