import { IsIn, IsString } from 'class-validator';

// Các trạng thái hợp lệ của đơn hàng
export class UpdateOrderStatusDto {
  @IsString()
  @IsIn([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
  ])
  status!: string;
}