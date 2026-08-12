import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { CartService } from './cart.service';
  import { AddCartItemDto } from './dto/add-cart-item.dto';
  import { UpdateCartItemDto } from './dto/update-cart-item.dto';
  
  interface JwtUser {
    sub: number;
    email: string;
    role: string;
  }
  
  // JwtAuthGuard đã gắn thông tin user vào request
  interface AuthenticatedRequest extends Request {
    user: JwtUser;
  }
  
  @Controller('cart')
  export class CartController {
    constructor(private readonly cartService: CartService) {}
  
    // Lấy giỏ hàng của user đang đăng nhập
    @Get()
    getCart(@Req() request: AuthenticatedRequest) {
      return this.cartService.getCart(request.user.sub);
    }
  
    // Thêm sản phẩm + size + topping vào giỏ hàng
    @Post('items')
    addItem(
      @Req() request: AuthenticatedRequest,
      @Body() addCartItemDto: AddCartItemDto,
    ) {
      return this.cartService.addItem(
        request.user.sub,
        addCartItemDto,
      );
    }
  
    // Cập nhật số lượng món
    @Patch('items/:id')
    updateItem(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
      return this.cartService.updateItem(
        request.user.sub,
        id,
        updateCartItemDto,
      );
    }
  
    // Xóa một món khỏi giỏ hàng
    @Delete('items/:id')
    removeItem(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.cartService.removeItem(
        request.user.sub,
        id,
      );
    }
  
    // Xóa toàn bộ món trong giỏ hàng
    @Delete()
    clearCart(@Req() request: AuthenticatedRequest) {
      return this.cartService.clearCart(request.user.sub);
    }
  }