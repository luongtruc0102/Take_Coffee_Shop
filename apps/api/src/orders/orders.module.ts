import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],

  // Sau này Payment hoặc Voucher có thể dùng lại OrdersService
  exports: [OrdersService],
})
export class OrdersModule {}