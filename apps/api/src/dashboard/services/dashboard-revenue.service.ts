import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardPeriod } from '../dashboard.types';
import { getDashboardPeriodRange } from '../utils/dashboard-period.util';

@Injectable()
export class DashboardRevenueService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy doanh thu theo khoảng thời gian của Dashboard
  async getRevenue(
    period: DashboardPeriod = '7D',
  ) {
    if (period === '1Y') {
      return this.getRevenueByMonth(12);
    }
  
    return this.getRevenueByDay(
      period === '30D' ? 30 : 7,
    );
  }

// Hiệu suất kinh doanh theo ngày
private async getRevenueByDay(days: number) {
  const safeDays = Math.min(
    Math.max(days, 1),
    30,
  );

  const startDate = new Date();

  startDate.setHours(0, 0, 0, 0);

  startDate.setDate(
    startDate.getDate() - (safeDays - 1),
  );

  const endDate = new Date();

  const orders =
    await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',

        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        totalPrice: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

  const statisticsMap = new Map<
    string,
    {
      revenue: number;
      completedOrders: number;
    }
  >();

  // Tạo đủ các ngày kể cả ngày không có đơn
  for (let i = 0; i < safeDays; i++) {
    const date = new Date(startDate);

    date.setDate(
      startDate.getDate() + i,
    );

    const key =
      date.toISOString().split('T')[0];

    statisticsMap.set(key, {
      revenue: 0,
      completedOrders: 0,
    });
  }

  // Tổng hợp doanh thu và số đơn hoàn thành
  for (const order of orders) {
    const key =
      order.createdAt
        .toISOString()
        .split('T')[0];

    const current =
      statisticsMap.get(key);

    if (!current) {
      continue;
    }

    current.revenue +=
      Number(order.totalPrice);

    current.completedOrders += 1;
  }

  return Array.from(
    statisticsMap.entries(),
  ).map(([date, statistic]) => ({
    date,

    revenue: statistic.revenue,

    completedOrders:
      statistic.completedOrders,

    averageOrderValue:
      statistic.completedOrders > 0
        ? statistic.revenue /
          statistic.completedOrders
        : 0,
  }));
}

  // Hiệu suất kinh doanh theo tháng
  private async getRevenueByMonth(
    months: number,
  ) {
    const safeMonths = Math.min(
      Math.max(months, 1),
      12,
    );

    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - (safeMonths - 1),
      1,
    );

    const orders =
      await this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',

          createdAt: {
            gte: startDate,
            lte: now,
          },
        },

        select: {
          totalPrice: true,
          createdAt: true,
        },

        orderBy: {
          createdAt: 'asc',
        },
      });

    const statisticsMap = new Map<
      string,
      {
        revenue: number;
        completedOrders: number;
      }
    >();

    // Tạo đủ các tháng kể cả tháng không có đơn
    for (let i = 0; i < safeMonths; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1,
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      statisticsMap.set(key, {
        revenue: 0,
        completedOrders: 0,
      });
    }

    // Tổng hợp doanh thu và số đơn theo tháng
    for (const order of orders) {
      const date = order.createdAt;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      const current =
        statisticsMap.get(key);

      if (!current) {
        continue;
      }

      current.revenue +=
        Number(order.totalPrice);

      current.completedOrders += 1;
    }

    return Array.from(
      statisticsMap.entries(),
    ).map(([month, statistic]) => ({
      month,

      revenue: statistic.revenue,

      completedOrders:
        statistic.completedOrders,

      averageOrderValue:
        statistic.completedOrders > 0
          ? statistic.revenue /
            statistic.completedOrders
          : 0,
    }));
  }
}