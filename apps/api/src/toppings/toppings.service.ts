import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Injectable()
export class ToppingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createToppingDto: CreateToppingDto) {
    // Kiểm tra tên topping đã tồn tại để tránh dữ liệu bị trùng
    const existingTopping = await this.prisma.topping.findUnique({
      where: {
        name: createToppingDto.name,
      },
    });

    if (existingTopping) {
      throw new ConflictException('Tên topping đã tồn tại');
    }

    // Tạo topping mới trong database
    return this.prisma.topping.create({
      data: createToppingDto,
    });
  }

  async findAll() {
    // API public chỉ trả các topping đang hoạt động
    return this.prisma.topping.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const topping = await this.prisma.topping.findUnique({
      where: { id },
      include: {
        // Trả thêm các sản phẩm đang sử dụng topping này
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!topping) {
      throw new NotFoundException('Không tìm thấy topping');
    }

    return topping;
  }

  async update(id: number, updateToppingDto: UpdateToppingDto) {
    // Đảm bảo topping cần sửa thực sự tồn tại
    await this.findOne(id);

    if (updateToppingDto.name) {
      // Kiểm tra tên mới có bị trùng với topping khác hay không
      const existingTopping = await this.prisma.topping.findFirst({
        where: {
          name: updateToppingDto.name,

          // Loại chính topping đang được cập nhật khỏi kết quả tìm kiếm
          NOT: {
            id,
          },
        },
      });

      if (existingTopping) {
        throw new ConflictException('Tên topping đã tồn tại');
      }
    }

    return this.prisma.topping.update({
      where: { id },
      data: updateToppingDto,
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    // Kiểm tra topping tồn tại trước khi thay đổi trạng thái
    await this.findOne(id);

    // Soft lock: chỉ thay đổi trạng thái, không xóa topping khỏi database
    return this.prisma.topping.update({
      where: { id },
      data: {
        isActive,
      },
    });
  }
}