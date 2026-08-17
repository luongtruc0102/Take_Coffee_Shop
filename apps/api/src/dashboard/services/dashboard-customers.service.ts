import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardPeriod } from '../dashboard.types';
import { getDashboardPeriodRange } from '../utils/dashboard-period.util';

@Injectable()
export class DashboardCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // KHÁCH HÀNG MỚI
  // =========================

  // Thống kê khách hàng mới theo khoảng thời gian
  async getNewCustomers(
    period: DashboardPeriod = '7D',
  ) {
    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const users = await this.prisma.user.findMany({
      where: {
        role: {
          name: 'USER',
        },

        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    // Với 1 năm, nhóm theo tháng để tránh trả về 365 điểm dữ liệu
    if (period === '1Y') {
      return this.groupCustomersByMonth(
        users,
        startDate,
      );
    }

    // 7 ngày và 30 ngày hiển thị theo ngày
    return this.groupCustomersByDay(
      users,
      startDate,
      endDate,
    );
  }

  // =========================
  // TOP KHÁCH HÀNG
  // =========================

  // Top khách hàng chi tiêu nhiều nhất trong khoảng thời gian
  async getTopCustomers(
    limit = 5,
    period: DashboardPeriod = '7D',
  ) {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      20,
    );

    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const customers =
      await this.prisma.order.groupBy({
        by: ['userId'],

        // Chỉ tính đơn hoàn thành trong khoảng thời gian đã chọn
        where: {
          status: 'COMPLETED',

          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },

        _sum: {
          totalPrice: true,
        },

        _count: {
          id: true,
        },

        orderBy: {
          _sum: {
            totalPrice: 'desc',
          },
        },

        take: safeLimit,
      });

    const userIds = customers.map(
      (customer) => customer.userId,
    );

    if (userIds.length === 0) {
      return [];
    }

    // Lấy thông tin của các khách hàng đã lọc
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },

      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    const userMap = new Map(
      users.map((user) => [user.id, user]),
    );

    return customers.map((customer) => ({
      userId: customer.userId,

      customer:
        userMap.get(customer.userId) ?? null,

      totalOrders: customer._count.id,

      totalSpent: Number(
        customer._sum.totalPrice ?? 0,
      ),
    }));
  }

  // =========================
  // HELPER
  // =========================

  // Nhóm khách hàng theo ngày cho 7D và 30D
  private groupCustomersByDay(
    users: { createdAt: Date }[],
    startDate: Date,
    endDate: Date,
  ) {
    const customerMap =
      new Map<string, number>();

    const current = new Date(startDate);

    while (current <= endDate) {
      const key =
        current.toISOString().split('T')[0];

      customerMap.set(key, 0);

      current.setDate(
        current.getDate() + 1,
      );
    }

    for (const user of users) {
      const key =
        user.createdAt
          .toISOString()
          .split('T')[0];

      customerMap.set(
        key,
        (customerMap.get(key) ?? 0) + 1,
      );
    }

    return Array.from(
      customerMap.entries(),
    ).map(([date, newCustomers]) => ({
      date,
      newCustomers,
    }));
  }

  // Nhóm khách hàng theo tháng khi xem 1 năm
  private groupCustomersByMonth(
    users: { createdAt: Date }[],
    startDate: Date,
  ) {
    const customerMap =
      new Map<string, number>();

    const now = new Date();

    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
    );

    while (current <= now) {
      const key = `${current.getFullYear()}-${String(
        current.getMonth() + 1,
      ).padStart(2, '0')}`;

      customerMap.set(key, 0);

      current.setMonth(
        current.getMonth() + 1,
      );
    }

    for (const user of users) {
      const date = user.createdAt;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      customerMap.set(
        key,
        (customerMap.get(key) ?? 0) + 1,
      );
    }

    return Array.from(
      customerMap.entries(),
    ).map(([date, newCustomers]) => ({
      date,
      newCustomers,
    }));
  }

  // =========================
  // KHÁCH HÀNG QUAY LẠI
  // =========================

  // Thống kê khách mới và khách quay lại theo khoảng thời gian
  async getCustomerRetention(
    period: DashboardPeriod = '7D',
  ) {
    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    // Lấy các khách có ít nhất 1 đơn hoàn thành trong kỳ
    const customersInPeriod =
      await this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },

        select: {
          userId: true,
        },

        distinct: ['userId'],
      });

    const userIds = customersInPeriod.map(
      (order) => order.userId,
    );

    if (userIds.length === 0) {
      return {
        period,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        newCustomerRate: 0,
        returningCustomerRate: 0,
      };
    }

    // Tìm những khách đã từng mua trước khoảng thời gian hiện tại
    const previousCustomers =
      await this.prisma.order.groupBy({
        by: ['userId'],

        where: {
          userId: {
            in: userIds,
          },

          status: 'COMPLETED',

          createdAt: {
            lt: startDate,
          },
        },
      });

    const returningCustomerIds =
      new Set(
        previousCustomers.map(
          (customer) => customer.userId,
        ),
      );

    const totalCustomers =
      userIds.length;

    const returningCustomers =
      returningCustomerIds.size;

    const newCustomers =
      totalCustomers -
      returningCustomers;

    const newCustomerRate =
      totalCustomers > 0
        ? (newCustomers /
            totalCustomers) *
          100
        : 0;

    const returningCustomerRate =
      totalCustomers > 0
        ? (returningCustomers /
            totalCustomers) *
          100
        : 0;

    return {
      period,
      totalCustomers,
      newCustomers,
      returningCustomers,

      newCustomerRate: Number(
        newCustomerRate.toFixed(1),
      ),

      returningCustomerRate: Number(
        returningCustomerRate.toFixed(1),
      ),
    };
  }
}