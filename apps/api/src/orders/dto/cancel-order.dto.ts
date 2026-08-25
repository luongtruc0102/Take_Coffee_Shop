import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

// Bắt buộc nhập lý do để hạn chế hủy nhầm và giúp cửa hàng dễ đối soát.
export class CancelOrderDto {
  // Cắt khoảng trắng trước khi validate để chuỗi chỉ có dấu cách không hợp lệ.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3, { message: 'Lý do hủy phải có ít nhất 3 ký tự' })
  @MaxLength(300, { message: 'Lý do hủy không được vượt quá 300 ký tự' })
  reason!: string;
}
