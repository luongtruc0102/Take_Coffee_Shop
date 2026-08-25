import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  //Đăng ký
  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      fullName,
    } = registerDto;

    // Kiểm tra email đã tồn tại hay chưa
    const existingUser =
      await this.usersService.findByEmail(
        email,
      );

    if (existingUser) {
      throw new ConflictException(
        'Email đã được sử dụng',
      );
    }

    // Tài khoản đầu tiên của hệ thống là ADMIN.
    // Những tài khoản tự đăng ký sau đó đều là USER.
    const userCount =
      await this.prisma.user.count();

    const roleName =
      userCount === 0
        ? 'ADMIN'
        : 'USER';

    const userRole =
      await this.prisma.role.findUnique({
        where: {
          name: roleName,
        },
      });

    if (!userRole) {
      throw new InternalServerErrorException(
        `Không tìm thấy Role ${roleName}`,
      );
    }

    // Hash mật khẩu trước khi lưu vào database
    const hashedPassword =
      await argon2.hash(password);

    const user =
      await this.usersService.create(
        email,
        hashedPassword,
        fullName,
        userRole.id,
      );

    // Không trả password về client
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  //Đăng nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm tài khoản theo email
    const user = await this.usersService.findByEmail(email);

    // Không tìm thấy email => đăng nhập thất bại
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Không cho tài khoản bị khóa đăng nhập
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // So sánh password người dùng nhập với password đã hash trong database
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Dữ liệu được lưu bên trong JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    // Tạo Access Token
    const accessToken = await this.jwtService.signAsync(payload);

    // Trả thông tin đăng nhập về client
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role.name,
      },
    };
  }

  // Lấy thông tin User hiện tại trực tiếp từ database
  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      address: user.address,
      loyaltyPoints: user.loyaltyPoints,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  // Cập nhật hồ sơ của user hiện tại.
  // Email và role không nhận từ client để tránh thay đổi trái phép.
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Tài khoản không tồn tại',
      );
    }

    const normalizedPhone =
      dto.phone?.trim();

    // Phone có unique constraint nên kiểm tra trước để trả thông báo dễ hiểu.
    if (normalizedPhone) {
      const existingPhone =
        await this.prisma.user.findFirst({
          where: {
            phone:
              normalizedPhone,

            id: {
              not: userId,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingPhone) {
        throw new ConflictException(
          'Số điện thoại đã được sử dụng',
        );
      }
    }

    const updated =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...(dto.fullName !==
          undefined
            ? {
                fullName:
                  dto.fullName.trim(),
              }
            : {}),

          ...(dto.phone !== undefined
            ? {
                phone:
                  normalizedPhone,
              }
            : {}),

          ...(dto.avatarUrl !==
          undefined
            ? {
                avatarUrl:
                  dto.avatarUrl.trim(),
              }
            : {}),
        },

        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

    // Chỉ trả dữ liệu an toàn, không bao giờ trả password.
    return {
      id: updated.id,
      email: updated.email,
      fullName:
        updated.fullName,
      phone: updated.phone,
      avatarUrl:
        updated.avatarUrl,
      address: updated.address,
      loyaltyPoints:
        updated.loyaltyPoints,
      role: updated.role.name,
      createdAt:
        updated.createdAt,
    };
  }
}
