import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { CheckoutDto } from './dto/checkout.dto';
  import { OrdersService } from './orders.service';
  import { Patch } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
  
  interface JwtUser {
    sub: number;
    email: string;
    role: string;
  }
  
  // JwtAuthGuard đã gắn payload JWT vào request.user
  interface AuthenticatedRequest extends Request {
    user: JwtUser;
  }
  
  @Controller('orders')
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    // Tạo đơn hàng từ giỏ hàng của user đang đăng nhập
    @Post('checkout')
    checkout(
      @Req() request: AuthenticatedRequest,
      @Body() checkoutDto: CheckoutDto,
    ) {
      return this.ordersService.checkout(
        request.user.sub,
        checkoutDto,
      );
    }
  
    // Lấy lịch sử đơn hàng của user hiện tại
    @Get()
    findMyOrders(@Req() request: AuthenticatedRequest) {
      return this.ordersService.findMyOrders(request.user.sub);
    }
  
    // Lấy chi tiết một đơn nhưng chỉ khi nó thuộc user hiện tại
    @Get(':id')
    findMyOrder(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.ordersService.findMyOrder(
        request.user.sub,
        id,
      );
    }

    // ADMIN và STAFF xem toàn bộ đơn hàng
    @Roles('ADMIN', 'STAFF')
    @Get('management/all')
    findAll() {
    return this.ordersService.findAll();
    }

    // ADMIN và STAFF xem chi tiết bất kỳ đơn hàng nào
    @Roles('ADMIN', 'STAFF')
    @Get('management/:id')
    findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
    }

    // ADMIN và STAFF cập nhật trạng thái đơn hàng
    @Roles('ADMIN', 'STAFF')
    @Patch('management/:id/status')
    updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
    return this.ordersService.updateStatus(
        id,
        updateOrderStatusDto.status,
    );
    }
  }