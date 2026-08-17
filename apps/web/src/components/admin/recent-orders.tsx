'use client';

import type { RecentOrder } from '@/types/dashboard';

type RecentOrdersProps = {
  data: RecentOrder[];
};

const statusConfig: Record<
  RecentOrder['status'],
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-50 text-blue-700',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    className: 'bg-violet-50 text-violet-700',
  },
  DELIVERING: {
    label: 'Đang giao',
    className: 'bg-cyan-50 text-cyan-700',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'bg-emerald-50 text-emerald-700',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-red-50 text-red-700',
  },
};

export default function RecentOrders({
  data,
}: RecentOrdersProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E9E1D8] bg-white shadow-sm">
      <div className="border-b border-[#F0E8E0] p-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Đơn hàng gần đây
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Các đơn hàng mới nhất trong hệ thống
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#FAF8F5]">
            <tr className="text-xs uppercase tracking-wide text-[#78866B]">
              <th className="px-5 py-4 font-medium">Mã đơn</th>
              <th className="px-5 py-4 font-medium">Khách hàng</th>
              <th className="px-5 py-4 font-medium">Thanh toán</th>
              <th className="px-5 py-4 font-medium">Tổng tiền</th>
              <th className="px-5 py-4 font-medium">Trạng thái</th>
              <th className="px-5 py-4 font-medium">Thời gian</th>
            </tr>
          </thead>

          <tbody>
            {data.map((order) => {
              const status = statusConfig[order.status];

              return (
                <tr
                  key={order.id}
                  className="border-t border-[#F0E8E0] text-sm transition hover:bg-[#FCFAF7]"
                >
                  <td className="px-5 py-4 font-semibold text-[#4A2C20]">
                    #{order.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1F1B18]">
                      {order.receiverName}
                    </p>

                    <p className="mt-1 text-xs text-[#8A817B]">
                      {order.customer.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-[#1F1B18]">
                    {order.payment
                      ? `${order.payment.method} · ${order.payment.status}`
                      : 'Chưa có'}
                  </td>

                  <td className="px-5 py-4 font-medium text-[#1F1B18]">
                    {formatCurrency(order.totalPrice)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-[#78866B]">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}