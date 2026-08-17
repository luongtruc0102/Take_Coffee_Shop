import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardPeriod } from '../dashboard.types';
import { getDashboardPeriodRange } from '../utils/dashboard-period.util';

@Injectable()
export class DashboardOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy các KPI chính hiển thị ở đầu dashboard
  async getOverview(
    period: DashboardPeriod = '7D',
  ) {
    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const [
      periodRevenue,
      periodOrders,
      newCustomers,
      activeProducts,
      pendingOrders,
      totalRevenue,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      // Doanh thu trong khoảng đang chọn
      this.prisma.order.aggregate({
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
      }),

      // Tổng số đơn trong khoảng đang chọn
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Khách hàng mới trong khoảng đang chọn
      this.prisma.user.count({
        where: {
          role: {
            name: 'USER',
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Dữ liệu hiện tại, không phụ thuộc khoảng thời gian
      this.prisma.product.count({
        where: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      }),

      // Đơn đang chờ xử lý ở thời điểm hiện tại
      this.prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),

      // Tổng doanh thu toàn hệ thống
      this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          totalPrice: true,
        },
      }),

      this.prisma.order.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    
      this.prisma.order.count({
        where: {
          status: 'CANCELLED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const revenue = Number(
      periodRevenue._sum.totalPrice ?? 0,
    );
    
    // Giá trị trung bình của mỗi đơn đã hoàn thành
    const averageOrderValue =
      completedOrders > 0
        ? revenue / completedOrders
        : 0;
    
    // Tỷ lệ đơn bị hủy trong khoảng thời gian
    const cancellationRate =
      periodOrders > 0
        ? (cancelledOrders / periodOrders) * 100
        : 0;

    return {
      period,
      periodRevenue: revenue,

      totalRevenue: Number(
        totalRevenue._sum.totalPrice ?? 0,
      ),

      periodOrders,
      newCustomers,
      activeProducts,
      pendingOrders,

      averageOrderValue,
      cancellationRate,
    };
  }
}