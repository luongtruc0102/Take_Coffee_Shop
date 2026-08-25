'use client';

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  RevenueStatistic,
} from '@/types/dashboard';

type Props = {
  data: RevenueStatistic[];
};

export default function RevenueChart({
  data,
}: Props) {
  const chartData = data.map((item) => ({
    ...item,

    // 7D / 30D dùng date, 1Y dùng month
    label:
      item.date ??
      item.month ??
      '',
  }));

  function formatCurrency(
    value: number,
  ) {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        maximumFractionDigits: 0,
      },
    ).format(value);
  }

  function formatLabel(
    value: string,
  ) {
    // Dữ liệu theo tháng: 2026-08
    if (
      /^\d{4}-\d{2}$/.test(value)
    ) {
      const [year, month] =
        value.split('-');

      return `${month}/${year}`;
    }

    // Dữ liệu theo ngày: 2026-08-14
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        value,
      )
    ) {
      const [, month, day] =
        value.split('-');

      return `${day}/${month}`;
    }

    return value;
  }

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1F1B18]">
          Hiệu suất kinh doanh
        </h3>

        <p className="mt-1 text-sm text-[#78866B]">
          Doanh thu, đơn hoàn thành và giá trị đơn trung bình
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <ComposedChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickFormatter={
                formatLabel
              }
              tick={{
                fontSize: 12,
              }}
            />

            {/* Trục tiền */}
            <YAxis
              yAxisId="money"
              tickFormatter={(value) =>
                formatCurrency(
                  Number(value),
                )
              }
              tick={{
                fontSize: 12,
              }}
            />

            {/* Trục số lượng đơn */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              allowDecimals={false}
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={false}
              labelFormatter={(label) =>
                formatLabel(
                  String(label),
                )
              }
              formatter={(
                value,
                name,
              ) => {
                const numberValue =
                  Number(value);

                if (
                  name ===
                  'Đơn hoàn thành'
                ) {
                  return [
                    `${numberValue} đơn`,
                    name,
                  ];
                }

                return [
                  `${formatCurrency(
                    numberValue,
                  )} đ`,
                  name,
                ];
              }}
            />

            <Legend />

            {/* AREA: Doanh thu */}
            <Area
              yAxisId="money"
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              fill="#C9894B"
              stroke="#C9894B"
              fillOpacity={0.18}
            />

            {/* BAR: Số đơn hoàn thành */}
            <Bar
              yAxisId="orders"
              dataKey="completedOrders"
              name="Đơn hoàn thành"
              fill="#8FA47C"
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />

            {/* LINE: AOV */}
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="averageOrderValue"
              name="Doanh thu trung bình"
              stroke="#4A2C20"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: '#FFFFFF',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}