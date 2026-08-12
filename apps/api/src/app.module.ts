import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Load biến môi trường từ .env và cho phép dùng ở toàn bộ backend
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Kết nối và cung cấp PrismaService cho toàn hệ thống
    PrismaModule,

    // Module kiểm tra trạng thái API + Database
    HealthModule,

    UsersModule,

    // Module xử lý đăng ký, đăng nhập và JWT
    AuthModule,
  ],

  providers: [
    // Kiểm tra Access Token cho toàn bộ API
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Kiểm tra quyền truy cập với các API có @Roles(...)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}