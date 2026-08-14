import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ToppingsModule } from './toppings/toppings.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Load biến môi trường từ .env và cho phép dùng ở toàn bộ backend
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Kết nối database và cung cấp PrismaService cho toàn hệ thống
    PrismaModule,

    // Module kiểm tra trạng thái API và kết nối database
    HealthModule,

    // Module quản lý tài khoản người dùng
    UsersModule,

    // Module xử lý đăng ký, đăng nhập và JWT
    AuthModule,

    // Các module quản lý menu của cửa hàng
    CategoriesModule,
    ProductsModule,
    ToppingsModule,

    ProductVariantsModule,

    // Module xử lý giỏ hàng của người dùng
    CartModule,

    // Module xử lý checkout và đơn hàng
    OrdersModule,

    // Module quản lý mã giảm giá
    VouchersModule,

    // Module xử lý thanh toán đơn hàng
    PaymentsModule,

    // Module thống kê cho ADMIN và STAFF
    DashboardModule,
  ],

  providers: [
    // Global Guard: mọi API mặc định phải có Access Token,
    // trừ các API được đánh dấu bằng @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global Guard: kiểm tra quyền truy cập với các API có @Roles(...)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}