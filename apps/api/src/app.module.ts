import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

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
  ],
})
export class AppModule {}