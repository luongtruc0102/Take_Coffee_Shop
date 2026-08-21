import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AddressSuggestionsDto } from './dto/address-suggestions.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { DeliveryLocationQuoteDto } from './dto/delivery-location-quote.dto';
import { DeliveryQuoteDto } from './dto/delivery-quote.dto';
import { OrdersService } from './orders.service';
import { Patch } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SearchQueryDto } from '../common/dto/search-query.dto';

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

  // Backend geocode địa chỉ và tính khoảng cách/phí giao hàng.
  @Post('delivery-quote')
  quoteDelivery(@Body() deliveryQuoteDto: DeliveryQuoteDto) {
    return this.ordersService.quoteDelivery(deliveryQuoteDto);
  }

  // Gợi ý địa chỉ Việt Nam khi khách nhập trên checkout.
  @Get('address-suggestions')
  searchAddressSuggestions(
    @Query() addressSuggestionsDto: AddressSuggestionsDto,
  ) {
    return this.ordersService.searchAddressSuggestions(
      addressSuggestionsDto.query,
    );
  }

  // Tính tuyến từ tọa độ khách chọn trên bản đồ và lấy lại tên địa chỉ.
  @Post('delivery-location-quote')
  quoteDeliveryLocation(
    @Body() deliveryLocationQuoteDto: DeliveryLocationQuoteDto,
  ) {
    return this.ordersService.quoteDeliveryLocation(deliveryLocationQuoteDto);
  }

  // Tạo đơn hàng từ giỏ hàng của user đang đăng nhập
  @Post('checkout')
  checkout(
    @Req() request: AuthenticatedRequest,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.ordersService.checkout(request.user.sub, checkoutDto);
  }

  // Lấy lịch sử đơn hàng của user hiện tại
  @Get()
  findMyOrders(@Req() request: AuthenticatedRequest) {
    return this.ordersService.findMyOrders(request.user.sub);
  }

  // User tự hủy đơn của mình khi đơn vẫn đang chờ cửa hàng xác nhận
  @Patch(':id/cancel')
  cancelMyOrder(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.cancelMyOrder(request.user.sub, id);
  }

  // ADMIN và STAFF xem toàn bộ đơn hàng
  @Roles('ADMIN', 'STAFF')
  @Get('management/all')
  findAll(@Query() query: SearchQueryDto) {
    return this.ordersService.findAll(query.q);
  }

  // Lấy chi tiết một đơn nhưng chỉ khi nó thuộc user hiện tại
  @Get(':id')
  findMyOrder(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findMyOrder(request.user.sub, id);
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
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}
