import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  // Tổng quan KPI dashboard
  @Roles('ADMIN')
  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  // Doanh thu theo ngày, dùng cho biểu đồ đường
  @Roles('ADMIN')
  @Get('revenue')
  getRevenueByDay(
    @Query('days') days?: string,
  ) {
    return this.dashboardService.getRevenueByDay(
      days ? Number(days) : 7,
    );
  }

  // Thống kê số lượng đơn theo trạng thái
  @Roles('ADMIN')
  @Get('orders/status')
  getOrderStatusStatistics() {
    return this.dashboardService.getOrderStatusStatistics();
  }

  // Top sản phẩm bán chạy
  @Roles('ADMIN')
  @Get('products/top')
  getTopProducts(
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getTopProducts(
      limit ? Number(limit) : 5,
    );
  }

  // Top topping được chọn nhiều nhất
  @Roles('ADMIN')
  @Get('toppings/top')
  getTopToppings(
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getTopToppings(
      limit ? Number(limit) : 5,
    );
  }

  // Danh sách đơn hàng mới nhất
  @Roles('ADMIN')
  @Get('orders/recent')
  getRecentOrders(
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRecentOrders(
      limit ? Number(limit) : 5,
    );
  }

  // Thống kê thanh toán theo trạng thái và phương thức
  @Roles('ADMIN')
  @Get('payments/statistics')
  getPaymentStatistics() {
    return this.dashboardService.getPaymentStatistics();
  }

  // Thống kê voucher và tổng tiền giảm giá
  @Roles('ADMIN')
  @Get('vouchers/statistics')
  getVoucherStatistics(
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getVoucherStatistics(
      limit ? Number(limit) : 5,
    );
  }

  // Thống kê số khách hàng mới theo ngày
  @Roles('ADMIN')
  @Get('customers/new')
  getNewCustomersByDay(
    @Query('days') days?: string,
  ) {
    return this.dashboardService.getNewCustomersByDay(
      days ? Number(days) : 7,
    );
  }

  // Top khách hàng chi tiêu nhiều nhất
  @Roles('ADMIN')
  @Get('customers/top')
  getTopCustomers(
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getTopCustomers(
      limit ? Number(limit) : 5,
    );
  }

  // Doanh thu theo tháng, dùng cho biểu đồ dài hạn
  @Roles('ADMIN')
  @Get('revenue/monthly')
  getRevenueByMonth(
    @Query('months') months?: string,
  ) {
    return this.dashboardService.getRevenueByMonth(
      months ? Number(months) : 6,
    );
  }
}