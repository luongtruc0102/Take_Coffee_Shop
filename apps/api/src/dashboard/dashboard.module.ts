import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import {
  DashboardOverviewService,
  DashboardRevenueService,
  DashboardOrdersService,
  DashboardProductsService,
  DashboardPaymentsService,
  DashboardVouchersService,
  DashboardCustomersService,
} from './services/dashboard.index';

@Module({
  controllers: [DashboardController],

  providers: [
    DashboardOverviewService,
    DashboardRevenueService,
    DashboardOrdersService,
    DashboardProductsService,
    DashboardPaymentsService,
    DashboardVouchersService,
    DashboardCustomersService,
  ],
})
export class DashboardModule {}