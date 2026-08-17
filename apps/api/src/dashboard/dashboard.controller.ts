import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import {
  DashboardOverviewService,
  DashboardRevenueService,
  DashboardOrdersService,
  DashboardProductsService,
  DashboardPaymentsService,
  DashboardVouchersService,
  DashboardCustomersService,
} from './services/dashboard.index';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly overviewService: DashboardOverviewService,
    private readonly revenueService: DashboardRevenueService,
    private readonly ordersService: DashboardOrdersService,
    private readonly productsService: DashboardProductsService,
    private readonly paymentsService: DashboardPaymentsService,
    private readonly vouchersService: DashboardVouchersService,
    private readonly customersService: DashboardCustomersService,
  ) {}

  // Tổng quan KPI theo khoảng thời gian
  @Roles('ADMIN')
  @Get('overview')
  getOverview(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.overviewService.getOverview(
      period ?? '7D',
    );
  }

  // Thống kê trạng thái đơn theo khoảng thời gian
  @Roles('ADMIN')
  @Get('orders/status')
  getOrderStatusStatistics(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.ordersService.getOrderStatusStatistics(
      period ?? '7D',
    );
  }

  // Đơn hàng gần nhất trong khoảng thời gian
  @Roles('ADMIN')
  @Get('orders/recent')
  getRecentOrders(
    @Query('limit') limit?: string,
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.ordersService.getRecentOrders(
      limit ? Number(limit) : 5,
      period ?? '7D',
    );
  }

  // Top sản phẩm theo khoảng thời gian
  @Roles('ADMIN')
  @Get('products/top')
  getTopProducts(
    @Query('limit') limit?: string,
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.productsService.getTopProducts(
      limit ? Number(limit) : 5,
      period ?? '7D',
    );
  }

  // Top topping theo khoảng thời gian
  @Roles('ADMIN')
  @Get('toppings/top')
  getTopToppings(
    @Query('limit') limit?: string,
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.productsService.getTopToppings(
      limit ? Number(limit) : 5,
      period ?? '7D',
    );
  }

  // Thống kê thanh toán theo khoảng thời gian
  @Roles('ADMIN')
  @Get('payments/statistics')
  getPaymentStatistics(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.paymentsService.getPaymentStatistics(
      period ?? '7D',
    );
  }

  // Thống kê voucher theo khoảng thời gian
  @Roles('ADMIN')
  @Get('vouchers/statistics')
  getVoucherStatistics(
    @Query('limit') limit?: string,
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.vouchersService.getVoucherStatistics(
      limit ? Number(limit) : 5,
      period ?? '7D',
    );
  }

  // Khách hàng mới theo khoảng thời gian
  @Roles('ADMIN')
  @Get('customers/new')
  getNewCustomers(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.customersService.getNewCustomers(
      period ?? '7D',
    );
  }

  // Top khách hàng theo khoảng thời gian
  @Roles('ADMIN')
  @Get('customers/top')
  getTopCustomers(
    @Query('limit') limit?: string,
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.customersService.getTopCustomers(
      limit ? Number(limit) : 5,
      period ?? '7D',
    );
  }

  // Tỷ lệ khách mới và khách quay lại
  @Roles('ADMIN')
  @Get('customers/retention')
  getCustomerRetention(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.customersService.getCustomerRetention(
      period ?? '7D',
    );
  }

  // Doanh thu theo ngày, tháng, năm dùng riêng cho biểu đồ dài hạn
  @Roles('ADMIN')
  @Get('revenue')
  getRevenue(
    @Query('period') period?: '7D' | '30D' | '1Y',
  ) {
    return this.revenueService.getRevenue(
      period ?? '7D',
    );
  }
}