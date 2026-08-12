import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Lấy chuỗi kết nối PostgreSQL từ file .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL không được định nghĩa');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Tạo 3 Role mặc định; nếu đã tồn tại thì không tạo trùng
  const roles = ['ADMIN', 'STAFF', 'USER'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Seed roles thành công: ADMIN, STAFF, USER');
}

main()
  .catch((error) => {
    console.error('❌ Seed database thất bại:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });