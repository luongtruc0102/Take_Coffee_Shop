import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo toàn bộ ứng dụng NestJS từ AppModule
  const app = await NestFactory.create(AppModule);

  // Tự động kiểm tra dữ liệu request dựa trên các DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các properties không được quy định trong DTO
      forbidNonWhitelisted: true, // Từ chối request nếu có properties không được quy định trong DTO  
      transform: true, //chuyển request thành đúng kiểu DTO
    }),
  );

  // Chạy API ở PORT trong .env, nếu không có thì mặc định dùng port 4000
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();