'use client';

import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { OrderStatusStatistic } from '@/types/dashboard';

type OrderStatusChartProps = {
  data: OrderStatusStatistic[];
};

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: '#D9A441',
  },

  CONFIRMED: {
    label: 'Đã xác nhận',
    color: '#5B8DEF',
  },

  PREPARING: {
    label: 'Đang chuẩn bị',
    color: '#9B7ED9',
  },

  DELIVERING: {
    label: 'Đang giao',
    color: '#4FA3B8',
  },

  COMPLETED: {
    label: 'Hoàn thành',
    color: '#5F9E6E',
  },

  CANCELLED: {
    label: 'Đã hủy',
    color: '#D46A6A',
  },
};

export default function OrderStatusChart({
  data,
}: OrderStatusChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label:
        statusConfig[item.status]?.label ??
        item.status,

      // Gán màu theo từng trạng thái
      fill:
        statusConfig[item.status]?.color ??
        '#C9894B',
    }));

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Trạng thái đơn hàng
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Tỷ lệ đơn theo trạng thái hiện tại
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            />

            <Tooltip
              formatter={(value) => [
                Number(value),
                'Số đơn',
              ]}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}