import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // TỔNG QUAN DASHBOARD
  // =========================

  // Lấy các KPI chính hiển thị ở đầu dashboard
  async getOverview() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      todayRevenue,
      totalRevenue,
      todayOrders,
      totalCustomers,
      activeProducts,
      pendingOrders,
    ] = await Promise.all([
      // Doanh thu hôm nay, chỉ tính đơn đã hoàn thành
      this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          totalPrice: true,
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

      // Tổng số đơn được tạo hôm nay
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      // Tổng số tài khoản khách hàng
      this.prisma.user.count({
        where: {
          role: {
            name: 'USER',
          },
        },
      }),

      // Số sản phẩm và danh mục đang hoạt động
      this.prisma.product.count({
        where: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      }),

      // Số đơn đang chờ xác nhận
      this.prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    return {
      todayRevenue: Number(todayRevenue._sum.totalPrice ?? 0),
      totalRevenue: Number(totalRevenue._sum.totalPrice ?? 0),
      todayOrders,
      totalCustomers,
      activeProducts,
      pendingOrders,
    };
  }

  // =========================
  // DOANH THU
  // =========================

  // Doanh thu theo ngày, dùng cho biểu đồ đường
  async getRevenueByDay(days = 7) {
    // Giới hạn từ 1 đến 30 ngày
    const safeDays = Math.min(Math.max(days, 1), 30);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (safeDays - 1));

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
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

    const revenueMap = new Map<string, number>();

    // Tạo đủ các ngày để ngày không có doanh thu vẫn trả về 0
    for (let i = 0; i < safeDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = date.toISOString().split('T')[0];

      revenueMap.set(key, 0);
    }

    // Cộng tổng doanh thu theo từng ngày
    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];

      revenueMap.set(
        key,
        (revenueMap.get(key) ?? 0) +
          Number(order.totalPrice),
      );
    }

    return Array.from(revenueMap.entries()).map(
      ([date, revenue]) => ({
        date,
        revenue,
      }),
    );
  }

  // Doanh thu theo tháng, dùng cho thống kê dài hạn
  async getRevenueByMonth(months = 6) {
    // Giới hạn từ 1 đến 12 tháng
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

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
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

    const revenueMap = new Map<string, number>();

    // Tạo sẵn các tháng để tháng không có doanh thu vẫn trả về 0
    for (let i = 0; i < safeMonths; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1,
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      revenueMap.set(key, 0);
    }

    // Cộng doanh thu theo từng tháng
    for (const order of orders) {
      const date = order.createdAt;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      revenueMap.set(
        key,
        (revenueMap.get(key) ?? 0) +
          Number(order.totalPrice),
      );
    }

    return Array.from(revenueMap.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );
  }

  // =========================
  // ĐƠN HÀNG
  // =========================

  // Thống kê số lượng đơn theo từng trạng thái
  async getOrderStatusStatistics() {
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
          },
        }),
      ),
    );

    return statuses.map((status, index) => ({
      status,
      count: counts[index],
    }));
  }

  // Lấy danh sách đơn hàng mới nhất
  async getRecentOrders(limit = 5) {
    // Giới hạn tối đa 20 đơn
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const orders = await this.prisma.order.findMany({
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

  // =========================
  // SẢN PHẨM
  // =========================

  // Top sản phẩm bán chạy theo số lượng
  async getTopProducts(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const products = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],

      // Chỉ tính sản phẩm trong đơn đã hoàn thành
      where: {
        order: {
          status: 'COMPLETED',
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
      quantitySold: product._sum.quantity ?? 0,
      revenue: Number(product._sum.lineTotal ?? 0),
    }));
  }

  // =========================
  // TOPPING
  // =========================

  // Top topping được chọn nhiều nhất
  async getTopToppings(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const toppings =
      await this.prisma.orderItemTopping.groupBy({
        by: ['toppingId', 'toppingName'],

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
      selectedCount: topping._count.toppingId,
    }));
  }

  // =========================
  // THANH TOÁN
  // =========================

  // Thống kê thanh toán theo trạng thái và phương thức
  async getPaymentStatistics() {
    const [statusStats, methodStats] =
      await Promise.all([
        // Thống kê PENDING, PAID, FAILED, CANCELLED
        this.prisma.payment.groupBy({
          by: ['status'],
          _count: {
            _all: true,
          },
          _sum: {
            amount: true,
          },
        }),

        // Thống kê COD và BANK_TRANSFER
        this.prisma.payment.groupBy({
          by: ['method'],
          _count: {
            _all: true,
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    return {
      byStatus: statusStats.map((item) => ({
        status: item.status,
        count: item._count._all,
        amount: Number(item._sum.amount ?? 0),
      })),

      byMethod: methodStats.map((item) => ({
        method: item.method,
        count: item._count._all,
        amount: Number(item._sum.amount ?? 0),
      })),
    };
  }

  // =========================
  // VOUCHER
  // =========================

  // Thống kê voucher và tổng số tiền đã giảm cho khách
  async getVoucherStatistics(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const [
      topVouchers,
      totalDiscount,
      activeVouchers,
    ] = await Promise.all([
      // Voucher được sử dụng nhiều nhất
      this.prisma.voucher.findMany({
        take: safeLimit,

        orderBy: {
          usedCount: 'desc',
        },

        select: {
          id: true,
          code: true,
          description: true,
          usedCount: true,
          usageLimit: true,
          endAt: true,
          isActive: true,
        },
      }),

      // Tổng số tiền voucher đã giảm cho khách
      this.prisma.order.aggregate({
        _sum: {
          discountAmount: true,
        },
      }),

      // Voucher đang trong thời gian hoạt động
      this.prisma.voucher.count({
        where: {
          isActive: true,
          startAt: {
            lte: new Date(),
          },
          endAt: {
            gte: new Date(),
          },
        },
      }),
    ]);

    return {
      totalDiscount: Number(
        totalDiscount._sum.discountAmount ?? 0,
      ),

      activeVouchers,

      topVouchers: topVouchers.map((voucher) => ({
        id: voucher.id,
        code: voucher.code,
        description: voucher.description,
        usedCount: voucher.usedCount,
        usageLimit: voucher.usageLimit,

        // Số lượt còn lại, null nếu voucher không giới hạn lượt
        remainingUsage:
          voucher.usageLimit !== null
            ? Math.max(
                voucher.usageLimit - voucher.usedCount,
                0,
              )
            : null,

        endAt: voucher.endAt,
        isActive: voucher.isActive,
      })),
    };
  }

  // =========================
  // KHÁCH HÀNG
  // =========================

  // Thống kê số lượng khách hàng mới theo ngày
  async getNewCustomersByDay(days = 7) {
    const safeDays = Math.min(Math.max(days, 1), 30);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (safeDays - 1));

    const users = await this.prisma.user.findMany({
      where: {
        role: {
          name: 'USER',
        },

        createdAt: {
          gte: startDate,
        },
      },

      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    const customerMap = new Map<string, number>();

    // Tạo đủ các ngày để ngày không có khách mới vẫn trả về 0
    for (let i = 0; i < safeDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = date.toISOString().split('T')[0];

      customerMap.set(key, 0);
    }

    // Cộng số tài khoản USER được tạo theo ngày
    for (const user of users) {
      const key = user.createdAt.toISOString().split('T')[0];

      customerMap.set(
        key,
        (customerMap.get(key) ?? 0) + 1,
      );
    }

    return Array.from(customerMap.entries()).map(
      ([date, newCustomers]) => ({
        date,
        newCustomers,
      }),
    );
  }

  // Top khách hàng có tổng chi tiêu cao nhất
  async getTopCustomers(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const customers = await this.prisma.order.groupBy({
      by: ['userId'],

      // Chỉ tính các đơn đã hoàn thành
      where: {
        status: 'COMPLETED',
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

    // Lấy thông tin user sau khi đã xác định top customer
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
}