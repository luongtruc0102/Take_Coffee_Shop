import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import * as argon2 from 'argon2';
import { CreateStaffDto } from './dto/create-staff.dto';
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

  // ADMIN tạo tài khoản nhân viên
async createStaff(
  createStaffDto: CreateStaffDto,
) {
  const email =
    createStaffDto.email
      .trim()
      .toLowerCase();

  const phone =
    createStaffDto.phone.trim();

  // Không cho trùng email
  const existingEmail =
    await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingEmail) {
    throw new ConflictException(
      'Email đã được sử dụng',
    );
  }

  // Không cho trùng số điện thoại
  const existingPhone =
    await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });

  if (existingPhone) {
    throw new ConflictException(
      'Số điện thoại đã được sử dụng',
    );
  }

  // Staff chỉ được tạo với role STAFF
  const staffRole =
    await this.prisma.role.findUnique({
      where: {
        name: 'STAFF',
      },
    });

  if (!staffRole) {
    throw new InternalServerErrorException(
      'Không tìm thấy Role STAFF',
    );
  }

  // Không bao giờ lưu mật khẩu dạng plain text
  const hashedPassword =
    await argon2.hash(
      createStaffDto.password,
    );

  return this.prisma.user.create({
    data: {
      email,
      password:
        hashedPassword,

      fullName:
        createStaffDto.fullName
          .trim(),

      phone,

      roleId:
        staffRole.id,
    },

    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      phone: true,

      loyaltyPoints: true,
      isActive: true,

      role: {
        select: {
          name: true,
        },
      },

      createdAt: true,
      updatedAt: true,
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
        phone: true,
        avatarUrl: true,
        address: true,
        loyaltyPoints: true,
        isActive: true,
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
    const user =
      await this.prisma.user.findUnique({
        where: { id },
  
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          address: true,
          loyaltyPoints: true,
          isActive: true,
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
      throw new NotFoundException(
        'Không tìm thấy người dùng',
      );
    }
  
    const completedOrders =
      await this.prisma.order.findMany({
        where: {
          userId: id,
          status: 'COMPLETED',
        },
  
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
  
          payment: {
            select: {
              method: true,
              status: true,
            },
          },
        },
  
        orderBy: {
          createdAt: 'desc',
        },
      });
  
    const totalSpent =
      completedOrders.reduce(
        (total, order) =>
          total +
          Number(order.totalPrice),
        0,
      );
  
    const recentOrders =
      await this.prisma.order.findMany({
        where: {
          userId: id,
        },
  
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
  
        orderBy: {
          createdAt: 'desc',
        },
  
        take: 5,
      });
  
    return {
      ...user,
  
      purchaseSummary: {
        totalOrders:
          completedOrders.length,
  
        totalSpent,
  
        lastPurchaseAt:
          completedOrders[0]
            ?.createdAt ?? null,
      },
  
      recentOrders,
    };
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