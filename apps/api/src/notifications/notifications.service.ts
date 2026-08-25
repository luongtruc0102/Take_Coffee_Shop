import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Trả tối đa 30 thông báo gần nhất kèm tổng số chưa đọc cho badge header.
  async findMine(userId: number) {
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  // Chỉ chủ sở hữu mới được đánh dấu thông báo của mình là đã đọc.
  async markRead(userId: number, notificationId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
  }

  async markAllRead(userId: number) {
    const readAt = new Date();
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt },
    });

    return { updatedCount: result.count, readAt };
  }
}
