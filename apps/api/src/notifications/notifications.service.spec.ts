jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  function createService(prisma: Record<string, unknown>) {
    return new NotificationsService(prisma as unknown as PrismaService);
  }

  it('chỉ tải thông báo của user hiện tại và đếm số chưa đọc', async () => {
    const items = [{ id: 3, userId: 7, isRead: false }];
    const prisma = {
      notification: {
        findMany: jest.fn().mockReturnValue('find-many-query'),
        count: jest.fn().mockReturnValue('count-query'),
      },
      $transaction: jest.fn().mockResolvedValue([items, 1]),
    };
    const service = createService(prisma);

    await expect(service.findMine(7)).resolves.toEqual({
      items,
      unreadCount: 1,
    });
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 7 },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 7, isRead: false },
    });
  });

  it('đánh dấu đúng thông báo thuộc user là đã đọc', async () => {
    const notification = { id: 5, userId: 7, isRead: true };
    const updateMany = jest.fn(
      (input: {
        where: { id: number; userId: number };
        data: { isRead: boolean; readAt: Date };
      }) => {
        void input;
        return Promise.resolve({ count: 1 });
      },
    );
    const prisma = {
      notification: {
        updateMany,
        findFirst: jest.fn().mockResolvedValue(notification),
      },
    };
    const service = createService(prisma);

    await expect(service.markRead(7, 5)).resolves.toEqual(notification);
    const updateInput = updateMany.mock.calls[0]?.[0] as
      | {
          where: { id: number; userId: number };
          data: { isRead: boolean; readAt: Date };
        }
      | undefined;
    expect(updateInput).toBeDefined();
    expect(updateInput?.where).toEqual({ id: 5, userId: 7 });
    expect(updateInput?.data.isRead).toBe(true);
    expect(updateInput?.data.readAt).toBeInstanceOf(Date);
    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 5, userId: 7 },
    });
  });

  it('không cho user đánh dấu thông báo của người khác', async () => {
    const prisma = {
      notification: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findFirst: jest.fn(),
      },
    };
    const service = createService(prisma);

    await expect(service.markRead(7, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.notification.findFirst).not.toHaveBeenCalled();
  });

  it('đánh dấu tất cả thông báo chưa đọc của riêng user', async () => {
    const updateMany = jest.fn(
      (input: {
        where: { userId: number; isRead: boolean };
        data: { isRead: boolean; readAt: Date };
      }) => {
        void input;
        return Promise.resolve({ count: 4 });
      },
    );
    const prisma = {
      notification: {
        updateMany,
      },
    };
    const service = createService(prisma);

    const result = await service.markAllRead(7);
    expect(result.updatedCount).toBe(4);
    expect(result.readAt).toBeInstanceOf(Date);
    const updateInput = updateMany.mock.calls[0]?.[0] as
      | {
          where: { userId: number; isRead: boolean };
          data: { isRead: boolean; readAt: Date };
        }
      | undefined;
    expect(updateInput).toBeDefined();
    expect(updateInput?.where).toEqual({ userId: 7, isRead: false });
    expect(updateInput?.data).toEqual({ isRead: true, readAt: result.readAt });
  });
});
