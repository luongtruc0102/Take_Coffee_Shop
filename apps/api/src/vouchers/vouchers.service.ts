import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateVoucherDto } from './dto/create-voucher.dto';
  import { UpdateVoucherDto } from './dto/update-voucher.dto';
  
  @Injectable()
  export class VouchersService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(createVoucherDto: CreateVoucherDto) {
      const code = createVoucherDto.code.trim().toUpperCase();
  
      // Không cho tạo trùng mã voucher
      const existingVoucher = await this.prisma.voucher.findUnique({
        where: { code },
      });
  
      if (existingVoucher) {
        throw new ConflictException('Mã voucher đã tồn tại');
      }
  
      this.validateVoucherData(createVoucherDto);
  
      return this.prisma.voucher.create({
        data: {
          code,
          description: createVoucherDto.description,
          discountType: createVoucherDto.discountType as
            | 'PERCENT'
            | 'FIXED',
          discountValue: createVoucherDto.discountValue,
          minOrderValue: createVoucherDto.minOrderValue,
          maxDiscount: createVoucherDto.maxDiscount,
          usageLimit: createVoucherDto.usageLimit,
          startAt: new Date(createVoucherDto.startAt),
          endAt: new Date(createVoucherDto.endAt),
        },
      });
    }
  
    async findAll() {
      // ADMIN xem toàn bộ voucher kể cả voucher đã khóa
      return this.prisma.voucher.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  
    async findOne(id: number) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { id },
      });
  
      if (!voucher) {
        throw new NotFoundException('Không tìm thấy voucher');
      }
  
      return voucher;
    }
  
    async update(id: number, updateVoucherDto: UpdateVoucherDto) {
      const voucher = await this.findOne(id);
  
      if (updateVoucherDto.code !== undefined) {
        const code = updateVoucherDto.code.trim().toUpperCase();
  
        // Kiểm tra mã mới có bị trùng với voucher khác hay không
        const existingVoucher = await this.prisma.voucher.findFirst({
          where: {
            code,
            NOT: {
              id,
            },
          },
        });
  
        if (existingVoucher) {
          throw new ConflictException('Mã voucher đã tồn tại');
        }
  
        updateVoucherDto.code = code;
      }
  
      // Ghép dữ liệu cũ + mới để validate đầy đủ trước khi update
      this.validateVoucherData({
        discountType:
          updateVoucherDto.discountType ?? voucher.discountType,
        discountValue:
          updateVoucherDto.discountValue ??
          Number(voucher.discountValue),
        minOrderValue:
          updateVoucherDto.minOrderValue ??
          (voucher.minOrderValue !== null
            ? Number(voucher.minOrderValue)
            : undefined),
        maxDiscount:
          updateVoucherDto.maxDiscount ??
          (voucher.maxDiscount !== null
            ? Number(voucher.maxDiscount)
            : undefined),
        usageLimit:
          updateVoucherDto.usageLimit ??
          voucher.usageLimit ??
          undefined,
        startAt:
          updateVoucherDto.startAt ?? voucher.startAt.toISOString(),
        endAt:
          updateVoucherDto.endAt ?? voucher.endAt.toISOString(),
      });
  
      return this.prisma.voucher.update({
        where: { id },
        data: {
          ...(updateVoucherDto.code !== undefined && {
            code: updateVoucherDto.code,
          }),
          ...(updateVoucherDto.description !== undefined && {
            description: updateVoucherDto.description,
          }),
          ...(updateVoucherDto.discountType !== undefined && {
            discountType: updateVoucherDto.discountType as
              | 'PERCENT'
              | 'FIXED',
          }),
          ...(updateVoucherDto.discountValue !== undefined && {
            discountValue: updateVoucherDto.discountValue,
          }),
          ...(updateVoucherDto.minOrderValue !== undefined && {
            minOrderValue: updateVoucherDto.minOrderValue,
          }),
          ...(updateVoucherDto.maxDiscount !== undefined && {
            maxDiscount: updateVoucherDto.maxDiscount,
          }),
          ...(updateVoucherDto.usageLimit !== undefined && {
            usageLimit: updateVoucherDto.usageLimit,
          }),
          ...(updateVoucherDto.startAt !== undefined && {
            startAt: new Date(updateVoucherDto.startAt),
          }),
          ...(updateVoucherDto.endAt !== undefined && {
            endAt: new Date(updateVoucherDto.endAt),
          }),
        },
      });
    }
  
    async updateStatus(id: number, isActive: boolean) {
      await this.findOne(id);
  
      // Soft lock: chỉ đổi trạng thái, không xóa voucher khỏi database
      return this.prisma.voucher.update({
        where: { id },
        data: {
          isActive,
        },
      });
    }
  
    async validateForCheckout(code: string, subtotal: number) {
      const normalizedCode = code.trim().toUpperCase();
  
      const voucher = await this.prisma.voucher.findUnique({
        where: {
          code: normalizedCode,
        },
      });
  
      if (!voucher || !voucher.isActive) {
        throw new BadRequestException(
          'Voucher không tồn tại hoặc đã bị khóa',
        );
      }
  
      const now = new Date();
  
      // Voucher chỉ sử dụng được trong thời gian hiệu lực
      if (now < voucher.startAt || now > voucher.endAt) {
        throw new BadRequestException(
          'Voucher chưa có hiệu lực hoặc đã hết hạn',
        );
      }
  
      if (
        voucher.usageLimit !== null &&
        voucher.usedCount >= voucher.usageLimit
      ) {
        throw new BadRequestException(
          'Voucher đã hết lượt sử dụng',
        );
      }
  
      if (
        voucher.minOrderValue !== null &&
        subtotal < Number(voucher.minOrderValue)
      ) {
        throw new BadRequestException(
          `Đơn hàng phải đạt tối thiểu ${Number(
            voucher.minOrderValue,
          )} để sử dụng voucher`,
        );
      }
  
      let discountAmount = 0;
  
      if (voucher.discountType === 'PERCENT') {
        discountAmount =
          (subtotal * Number(voucher.discountValue)) / 100;
  
        // Voucher phần trăm có thể giới hạn số tiền giảm tối đa
        if (voucher.maxDiscount !== null) {
          discountAmount = Math.min(
            discountAmount,
            Number(voucher.maxDiscount),
          );
        }
      } else {
        discountAmount = Number(voucher.discountValue);
      }
  
      // Không bao giờ cho số tiền giảm vượt quá giá trị đơn hàng
      discountAmount = Math.min(discountAmount, subtotal);
  
      return {
        voucher,
        discountAmount,
      };
    }
  
    private validateVoucherData(data: {
      discountType: string;
      discountValue: number;
      minOrderValue?: number;
      maxDiscount?: number;
      usageLimit?: number;
      startAt: string;
      endAt: string;
    }) {
      const startAt = new Date(data.startAt);
      const endAt = new Date(data.endAt);
  
      if (startAt >= endAt) {
        throw new BadRequestException(
          'Thời gian bắt đầu phải trước thời gian kết thúc',
        );
      }
  
      if (
        data.discountType === 'PERCENT' &&
        data.discountValue > 100
      ) {
        throw new BadRequestException(
          'Voucher phần trăm không được giảm quá 100%',
        );
      }
  
      if (data.discountValue <= 0) {
        throw new BadRequestException(
          'Giá trị giảm phải lớn hơn 0',
        );
      }
  
      if (
        data.usageLimit !== undefined &&
        data.usageLimit < 1
      ) {
        throw new BadRequestException(
          'Giới hạn sử dụng phải lớn hơn 0',
        );
      }
    }
  }