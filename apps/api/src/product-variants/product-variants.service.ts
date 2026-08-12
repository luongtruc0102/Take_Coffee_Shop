import {
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateProductVariantDto } from './dto/create-product-variant.dto';
  import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
  
  @Injectable()
  export class ProductVariantsService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(productId: number, createDto: CreateProductVariantDto) {
      // Chỉ cho tạo variant cho sản phẩm đang hoạt động
      const product = await this.prisma.product.findFirst({
        where: {
          id: productId,
          isActive: true,
        },
      });
  
      if (!product) {
        throw new NotFoundException(
          'Không tìm thấy sản phẩm hoặc sản phẩm đã bị khóa',
        );
      }
  
      // Ngăn một sản phẩm có 2 variant cùng size
      const existingVariant = await this.prisma.productVariant.findUnique({
        where: {
          productId_size: {
            productId,
            size: createDto.size,
          },
        },
      });
  
      if (existingVariant) {
        throw new ConflictException(
          'Size này đã tồn tại trong sản phẩm',
        );
      }
  
      // Tạo variant theo size cho sản phẩm
      return this.prisma.productVariant.create({
        data: {
          productId,
          size: createDto.size,
          price: createDto.price,
        },
        include: {
          product: true,
        },
      });
    }
  
    async findByProduct(productId: number) {
      // API public chỉ trả variant đang hoạt động
      return this.prisma.productVariant.findMany({
        where: {
          productId,
          isActive: true,
          product: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
        },
        orderBy: {
          price: 'asc',
        },
      });
    }
  
    async findOne(id: number) {
      // API public chỉ cho xem variant đang hoạt động
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          id,
          isActive: true,
          product: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
  
      if (!variant) {
        throw new NotFoundException('Không tìm thấy variant');
      }
  
      return variant;
    }
  
    // Dùng cho ADMIN để vẫn tìm được variant đã bị khóa
    private async findVariantById(id: number) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id },
      });
  
      if (!variant) {
        throw new NotFoundException('Không tìm thấy variant');
      }
  
      return variant;
    }
  
    async update(id: number, updateDto: UpdateProductVariantDto) {
      const variant = await this.findVariantById(id);
  
      if (updateDto.size !== undefined) {
        // Không cho đổi sang size đã tồn tại trong cùng sản phẩm
        const existingVariant = await this.prisma.productVariant.findFirst({
          where: {
            productId: variant.productId,
            size: updateDto.size,
            NOT: {
              id,
            },
          },
        });
  
        if (existingVariant) {
          throw new ConflictException(
            'Size này đã tồn tại trong sản phẩm',
          );
        }
      }
  
      return this.prisma.productVariant.update({
        where: { id },
        data: updateDto,
      });
    }
  
    async updateStatus(id: number, isActive: boolean) {
      // ADMIN vẫn có thể mở lại variant đã bị khóa
      await this.findVariantById(id);
  
      // Soft lock: chỉ đổi trạng thái, không xóa variant khỏi database
      return this.prisma.productVariant.update({
        where: { id },
        data: {
          isActive,
        },
      });
    }
  }