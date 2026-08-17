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

import type { TopProduct } from '@/types/dashboard';

type TopProductsChartProps = {
  data: TopProduct[];
};

export default function TopProductsChart({
  data,
}: TopProductsChartProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Sản phẩm bán chạy
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Top sản phẩm theo số lượng đã bán
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 20,
              left: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              allowDecimals={false}
            />

            <YAxis
              type="category"
              dataKey="productName"
              width={130}
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
            cursor={false}
            formatter={(value, name) => {
                if (name === 'quantitySold') {
                return [
                    `${Number(value)} sản phẩm`,
                    'Đã bán',
                ];
                }

                return [
                Number(value),
                String(name),
                ];
            }}
            labelFormatter={(label) => String(label)}
            />

            <Bar
              dataKey="quantitySold"
              name="quantitySold"
              fill="#C9894B"
              radius={[0, 8, 8, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tổng doanh thu từng sản phẩm có thể dùng ở tooltip/bảng sau */}
      {data.length > 0 && (
        <div className="mt-2 border-t border-[#F0E8E0] pt-4">
          <p className="text-xs text-[#8A817B]">
            Sản phẩm dẫn đầu:{' '}
            <span className="font-medium text-[#4A2C20]">
              {data[0].productName}
            </span>
            {' · '}
            {formatCurrency(data[0].revenue)}đ doanh thu
          </p>
        </div>
      )}
    </div>
  );
}