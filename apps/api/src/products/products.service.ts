import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Chỉ cho phép tạo sản phẩm trong danh mục đang hoạt động
    const category = await this.prisma.category.findFirst({
      where: {
        id: createProductDto.categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException(
        'Không tìm thấy danh mục hoặc danh mục đã bị khóa',
      );
    }

    // Tạo sản phẩm và trả kèm thông tin danh mục
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        imageUrl: createProductDto.imageUrl,
        categoryId: createProductDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll() {
    // API public chỉ trả sản phẩm thuộc danh mục đang hoạt động
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      include: {
        category: true,
  
        // Chỉ trả các topping đang hoạt động
        toppings: {
          where: {
            topping: {
              isActive: true,
            },
          },
          include: {
            topping: true,
          },
        },
  
        // Chỉ trả các size/variant đang hoạt động
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    // API public chỉ cho xem sản phẩm đang hoạt động
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        category: {
          isActive: true,
        },
      },
      include: {
        category: true,
  
        // Không hiển thị topping đã bị khóa
        toppings: {
          where: {
            topping: {
              isActive: true,
            },
          },
          include: {
            topping: true,
          },
        },
  
        // Không hiển thị variant đã bị khóa
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    });
  
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
  
    return product;
  }

  // Dùng cho chức năng ADMIN cần tìm sản phẩm kể cả khi đã bị khóa
  private async findProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // ADMIN vẫn có thể sửa sản phẩm kể cả khi sản phẩm đang bị khóa
    await this.findProductById(id);

    if (updateProductDto.categoryId !== undefined) {
      // Không cho chuyển sản phẩm sang danh mục đã bị khóa
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateProductDto.categoryId,
          isActive: true,
        },
      });

      if (!category) {
        throw new NotFoundException(
          'Không tìm thấy danh mục hoặc danh mục đã bị khóa',
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    // Tìm trực tiếp để ADMIN có thể mở lại sản phẩm đã bị khóa
    await this.findProductById(id);

    // Soft lock: chỉ đổi trạng thái, không xóa dữ liệu khỏi database
    return this.prisma.product.update({
      where: { id },
      data: {
        isActive,
      },
    });
  }

  async addTopping(productId: number, toppingId: number) {
    // Chỉ cho phép gắn topping vào sản phẩm đang hoạt động
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

    // Chỉ cho phép gắn topping đang hoạt động
    const topping = await this.prisma.topping.findFirst({
      where: {
        id: toppingId,
        isActive: true,
      },
    });

    if (!topping) {
      throw new NotFoundException(
        'Không tìm thấy topping hoặc topping đã bị khóa',
      );
    }

    // Ngăn một topping bị gắn trùng vào cùng một sản phẩm
    const existing = await this.prisma.productTopping.findUnique({
      where: {
        productId_toppingId: {
          productId,
          toppingId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Topping đã được gắn vào sản phẩm',
      );
    }

    // Tạo quan hệ nhiều-nhiều Product ↔ Topping
    return this.prisma.productTopping.create({
      data: {
        productId,
        toppingId,
      },
      include: {
        topping: true,
      },
    });
  }

  async removeTopping(productId: number, toppingId: number) {
    // Kiểm tra quan hệ Product ↔ Topping có tồn tại hay không
    const relation = await this.prisma.productTopping.findUnique({
      where: {
        productId_toppingId: {
          productId,
          toppingId,
        },
      },
    });

    if (!relation) {
      throw new NotFoundException(
        'Topping chưa được gắn vào sản phẩm',
      );
    }

    // Chỉ xóa quan hệ, không xóa Product hoặc Topping
    await this.prisma.productTopping.delete({
      where: {
        productId_toppingId: {
          productId,
          toppingId,
        },
      },
    });

    return {
      message: 'Đã xóa topping khỏi sản phẩm',
    };
  }
}