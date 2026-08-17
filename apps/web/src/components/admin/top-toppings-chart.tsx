'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TopTopping } from '@/types/dashboard';

type TopToppingsChartProps = {
  data: TopTopping[];
};

export default function TopToppingsChart({
  data,
}: TopToppingsChartProps) {
  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Topping phổ biến
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Top topping được khách lựa chọn nhiều nhất
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="toppingName"
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              allowDecimals={false}
            />

            <Tooltip
              cursor={false}
              formatter={(value) => [
                `${Number(value)} lần`,
                'Lượt chọn',
              ]}
            />

            <Bar
              dataKey="selectedCount"
              fill="#8FA47C"
              radius={[8, 8, 0, 0]}
              maxBarSize={55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}