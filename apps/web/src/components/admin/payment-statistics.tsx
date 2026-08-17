'use client';

import type { PaymentStatistics } from '@/types/dashboard';

type PaymentStatisticsProps = {
  data: PaymentStatistics;
};

export default function PaymentStatisticsCard({
  data,
}: PaymentStatisticsProps) {
  const paid = data.byStatus.find(
    (item) => item.status === 'PAID',
  );

  const pending = data.byStatus.find(
    (item) => item.status === 'PENDING',
  );

  const cod = data.byMethod.find(
    (item) => item.method === 'COD',
  );

  const bankTransfer = data.byMethod.find(
    (item) => item.method === 'BANK_TRANSFER',
  );

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
          Thanh toán
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Tổng quan trạng thái và phương thức thanh toán
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            Đã thanh toán
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-800">
            {paid?.count ?? 0}
          </p>

          <p className="mt-1 text-xs text-emerald-700">
            {formatCurrency(paid?.amount ?? 0)}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            Chờ thanh toán
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-800">
            {pending?.count ?? 0}
          </p>

          <p className="mt-1 text-xs text-amber-700">
            {formatCurrency(pending?.amount ?? 0)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E9E1D8] p-4">
          <p className="text-sm text-[#78866B]">
            COD
          </p>

          <p className="mt-1 text-xl font-semibold text-[#1F1B18]">
            {cod?.count ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-[#E9E1D8] p-4">
          <p className="text-sm text-[#78866B]">
            Chuyển khoản
          </p>

          <p className="mt-1 text-xl font-semibold text-[#1F1B18]">
            {bankTransfer?.count ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}