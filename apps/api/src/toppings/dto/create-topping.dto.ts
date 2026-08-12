// src/toppings/dto/create-topping.dto.ts
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

// Kiểm tra dữ liệu client gửi lên khi tạo topping mới
export class CreateToppingDto {
  @IsString()
  @MinLength(2)
  name!: string;

  // Giá topping phải là số và không được nhỏ hơn 0
  @IsNumber()
  @Min(0)
  price!: number;
}