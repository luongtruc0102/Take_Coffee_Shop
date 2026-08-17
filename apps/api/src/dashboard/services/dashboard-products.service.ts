import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardPeriod } from '../dashboard.types';
import { getDashboardPeriodRange } from '../utils/dashboard-period.util';

@Injectable()
export class DashboardProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Top sản phẩm bán chạy theo số lượng
  async getTopProducts(
    limit = 5,
    period: DashboardPeriod = '7D',
  ) {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      20,
    );

    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const products =
      await this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],

        where: {
          order: {
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },

        _sum: {
          quantity: true,
          lineTotal: true,
        },

        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },

        take: safeLimit,
      });

    return products.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      quantitySold:
        product._sum.quantity ?? 0,
      revenue: Number(
        product._sum.lineTotal ?? 0,
      ),
    }));
  }

  // Top topping được chọn nhiều nhất trong khoảng thời gian
  async getTopToppings(
    limit = 5,
    period: DashboardPeriod = '7D',
  ) {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      20,
    );

    const { startDate, endDate } =
      getDashboardPeriodRange(period);

    const toppings =
      await this.prisma.orderItemTopping.groupBy({
        by: ['toppingId', 'toppingName'],

        where: {
          orderItem: {
            order: {
              status: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },

        _count: {
          toppingId: true,
        },

        orderBy: {
          _count: {
            toppingId: 'desc',
          },
        },

        take: safeLimit,
      });

    return toppings.map((topping) => ({
      toppingId: topping.toppingId,
      toppingName: topping.toppingName,
      selectedCount:
        topping._count.toppingId,
    }));
  }
}