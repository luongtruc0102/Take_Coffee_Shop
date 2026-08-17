'use client';

import type {
  TopCustomer,
} from '@/types/dashboard';

type Props = {
  data: TopCustomer[];
};

export default function TopCustomers({
  data,
}: Props) {
  function formatCurrency(
    value: number,
  ) {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
      },
    ).format(value);
  }

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Top khách hàng
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Khách hàng có tổng chi tiêu cao nhất
        </p>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-[#78866B]">
            Chưa có dữ liệu khách hàng.
          </p>
        ) : (
          data.map(
            (item, index) => (
              <div
                key={item.userId}
                className="flex items-center justify-between rounded-xl border border-[#F0E8E0] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E9DE] text-sm font-bold text-[#4A2C20]">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-semibold text-[#1F1B18]">
                      {item.customer
                        ?.fullName ??
                        'Khách hàng'}
                    </p>

                    <p className="mt-1 text-xs text-[#78866B]">
                      {
                        item.customer
                          ?.email
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-[#4A2C20]">
                    {formatCurrency(
                      item.totalSpent,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-[#78866B]">
                    {item.totalOrders} đơn
                  </p>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}