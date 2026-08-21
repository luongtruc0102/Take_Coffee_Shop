import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { SearchQueryDto } from '../common/dto/search-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ADMIN xem toàn bộ sản phẩm kể cả sản phẩm đã khóa
  @Roles('ADMIN')
  @Get('admin/all')
  findAllForAdmin(@Query() query: SearchQueryDto) {
    return this.productsService.findAllForAdmin(query.q);
  }

  // Chỉ ADMIN được phép tạo sản phẩm mới
  @Roles('ADMIN')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // API public để khách chưa đăng nhập vẫn xem được menu
  @Public()
  @Get()
  findAll(@Query() query: SearchQueryDto) {
    return this.productsService.findAll(query.q);
  }

  // ParseIntPipe đảm bảo id trên URL là số hợp lệ
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // Chỉ ADMIN được cập nhật thông tin sản phẩm
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // Khóa hoặc mở lại sản phẩm thay vì xóa trực tiếp
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductStatusDto: UpdateProductStatusDto,
  ) {
    return this.productsService.updateStatus(
      id,
      updateProductStatusDto.isActive,
    );
  }

  // ADMIN gắn topping được phép sử dụng cho sản phẩm
  @Roles('ADMIN')
  @Post(':productId/toppings/:toppingId')
  addTopping(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('toppingId', ParseIntPipe) toppingId: number,
  ) {
    return this.productsService.addTopping(productId, toppingId);
  }

  // ADMIN gỡ topping khỏi sản phẩm
  @Roles('ADMIN')
  @Delete(':productId/toppings/:toppingId')
  removeTopping(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('toppingId', ParseIntPipe) toppingId: number,
  ) {
    return this.productsService.removeTopping(productId, toppingId);
  }
}
