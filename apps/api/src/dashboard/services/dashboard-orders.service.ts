import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardPeriod } from '../dashboard.types';
import { getDashboardPeriodRange } from '../utils/dashboard-period.util';

@Injectable()
export class DashboardOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // THỐNG KÊ TRẠNG THÁI ĐƠN
  // =========================

  // Thống kê số lượng đơn theo từng trạng thái trong khoảng thời gian
  async getOrderStatusStatistics(
    period: DashboardPeriod = '7D',
  ) {
    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const statuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'DELIVERING',
      'COMPLETED',
      'CANCELLED',
    ] as const;

    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.order.count({
          where: {
            status,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ),
    );

    return statuses.map((status, index) => ({
      status,
      count: counts[index],
    }));
  }

  // =========================
  // ĐƠN HÀNG GẦN NHẤT
  // =========================

  // Lấy danh sách đơn hàng mới nhất trong khoảng thời gian
  async getRecentOrders(
    limit = 5,
    period: DashboardPeriod = '7D',
  ) {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      20,
    );

    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      take: safeLimit,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        receiverName: true,
        receiverPhone: true,
        totalPrice: true,
        status: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },

        payment: {
          select: {
            method: true,
            status: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      createdAt: order.createdAt,
      customer: order.user,
      payment: order.payment,
    }));
  }
}