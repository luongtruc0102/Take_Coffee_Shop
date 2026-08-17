'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  CustomerRetentionSummary,
} from '@/types/dashboard';

type Props = {
  data: CustomerRetentionSummary;
};

export default function CustomerRetentionChart({
  data,
}: Props) {
  const chartData = (data.timeline ?? []).map((item) => ({
    ...item,
    label:
      item.date ??
      item.month ??
      '',
  }));

  function formatLabel(value: string) {
    if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] =
        value.split('-');

      return `${month}/${year}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [, month, day] =
        value.split('-');

      return `${day}/${month}`;
    }

    return value;
  }

  return (
    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1F1B18]">
            Khách hàng
          </h3>

          <p className="mt-1 text-sm text-[#78866B]">
            Xu hướng khách mới và khách quay lại
          </p>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-xs text-[#8A817B]">
              Khách mới
            </p>

            <p className="mt-1 text-lg font-semibold text-[#C9894B]">
              {data.newCustomerRate.toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8A817B]">
              Quay lại
            </p>

            <p className="mt-1 text-lg font-semibold text-[#6F8C63]">
              {data.returningCustomerRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickFormatter={formatLabel}
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
              labelFormatter={(label) =>
                formatLabel(
                  String(label),
                )
              }
              formatter={(value, name) => [
                `${Number(value)} khách`,
                name,
              ]}
            />

            <Legend />

            <Area
              type="monotone"
              dataKey="newCustomers"
              name="Khách mới"
              stroke="#C9894B"
              fill="#C9894B"
              fillOpacity={0.18}
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="returningCustomers"
              name="Khách quay lại"
              stroke="#6F8C63"
              fill="#8FA47C"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t border-[#F0E8E0] pt-4 text-sm text-[#78866B]">
        Tổng khách mua hàng:{' '}
        <span className="font-semibold text-[#1F1B18]">
          {data.totalCustomers}
        </span>
      </div>
    </div>
  );
}