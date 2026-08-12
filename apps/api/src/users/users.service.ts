import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  // Dùng PrismaService để thao tác với bảng User trong PostgreSQL
  constructor(private readonly prisma: PrismaService) {}

  // Tìm tài khoản theo email, dùng khi đăng ký và đăng nhập
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  // Tạo User mới và liên kết với Role tương ứng
  async create(
    email: string,
    password: string,
    fullName: string | undefined,
    roleId: number,
  ) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        fullName,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  // Tìm User theo ID và lấy thông tin Role
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  // Lấy danh sách tất cả User trong hệ thống
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,

        // Chỉ lấy tên Role của User
        role: {
          select: {
            name: true,
          },
        },
      },

      // User mới nhất hiển thị trước
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ADMIN xem chi tiết một tài khoản
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },

      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,

        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  // ADMIN thay đổi Role của một User
  async updateRole(id: number, roleName: string) {
    // Kiểm tra User có tồn tại hay không
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Tìm Role tương ứng trong database
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Không tìm thấy Role');
    }

    // Cập nhật roleId của User
    return this.prisma.user.update({
      where: { id },
      data: {
        roleId: role.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
    });
  }

  // ADMIN khóa hoặc mở khóa tài khoản User
  async updateStatus(id: number, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        role: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
    });
  }
}