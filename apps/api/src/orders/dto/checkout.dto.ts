import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Kiểm tra thông tin giao hàng khi user checkout
export class CheckoutDto {
  @IsString()
  @MinLength(2)
  receiverName!: string;

  @IsString()
  @MinLength(8)
  receiverPhone!: string;

  @IsString()
  @MinLength(5)
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  note?: string;

  // Mã giảm giá không bắt buộc
  @IsOptional()
  @IsString()
  voucherCode?: string;
}