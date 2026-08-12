import {
    ArrayUnique,
    IsArray,
    IsInt,
    IsOptional,
    Min,
  } from 'class-validator';
  
  // Kiểm tra dữ liệu khi người dùng thêm món vào giỏ hàng
  export class AddCartItemDto {
    @IsInt()
    productId!: number;
  
    // Size mà khách chọn
    @IsInt()
    variantId!: number;
  
    @IsInt()
    @Min(1)
    quantity!: number;
  
    // Danh sách topping là tùy chọn và không được trùng id
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    toppingIds?: number[];
  }