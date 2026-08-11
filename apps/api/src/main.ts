import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo toàn bộ ứng dụng NestJS từ AppModule
  const app = await NestFactory.create(AppModule);

  // Chạy API ở PORT trong .env, nếu không có thì mặc định dùng port 4000
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();