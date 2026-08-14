import {
    IsDateString,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MinLength,
  } from 'class-validator';
  
  // Kiểm tra dữ liệu khi cập nhật voucher
  export class UpdateVoucherDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    code?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsString()
    @IsIn(['PERCENT', 'FIXED'])
    discountType?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    discountValue?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxDiscount?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    usageLimit?: number;
  
    @IsOptional()
    @IsDateString()
    startAt?: string;
  
    @IsOptional()
    @IsDateString()
    endAt?: string;
  }