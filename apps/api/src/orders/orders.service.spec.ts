jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { BadRequestException } from '@nestjs/common';
import { FuzzySearchService } from '../common/fuzzy-search/fuzzy-search.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { VouchersService } from '../vouchers/vouchers.service';
import { OrdersService } from './orders.service';

describe('OrdersService COD order flow', () => {
  function createService(prisma: Record<string, unknown>) {
    return new OrdersService(
      prisma as unknown as PrismaService,
      {} as VouchersService,
      new FuzzySearchService(),
    );
  }

  it('hủy đơn PENDING và hoàn lại điểm, voucher, thanh toán', async () => {
    const pendingOrder = {
      id: 12,
      userId: 3,
      status: 'PENDING',
      loyaltyPointsUsed: 3000,
      voucherId: 7,
      appliedVouchers: [{ voucherId: 7 }, { voucherId: 9 }],
      payment: { status: 'PENDING' },
    };
    const cancelledOrder = {
      ...pendingOrder,
      status: 'CANCELLED',
      payment: { status: 'CANCELLED' },
    };
    const transaction = {
      order: {
        findFirst: jest.fn().mockResolvedValue(pendingOrder),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue(cancelledOrder),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
      voucher: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      payment: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    };
    const service = createService(prisma);

    await expect(service.cancelMyOrder(3, 12)).resolves.toEqual(
      cancelledOrder,
    );
    expect(transaction.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 12,
          userId: 3,
          status: 'PENDING',
        }),
      }),
    );
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { loyaltyPoints: { increment: 3000 } },
    });
    expect(transaction.voucher.updateMany).toHaveBeenCalledTimes(2);
    expect(transaction.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: 12, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
  });

  it('không cho user hủy đơn đã được xác nhận', async () => {
    const transaction = {
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: 12,
          userId: 3,
          status: 'CONFIRMED',
          loyaltyPointsUsed: 0,
          voucherId: null,
          appliedVouchers: [],
          payment: { status: 'PENDING' },
        }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    };
    const service = createService(prisma);

    await expect(service.cancelMyOrder(3, 12)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('đánh dấu thanh toán COD là PAID khi hoàn tất đơn', async () => {
    const completedOrder = {
      id: 12,
      status: 'COMPLETED',
      payment: { method: 'COD', status: 'PAID' },
    };
    const transaction = {
      order: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: 12,
            userId: 3,
            totalPrice: 120000,
            user: { role: { name: 'USER' } },
          })
          .mockResolvedValueOnce(completedOrder),
        update: jest.fn().mockResolvedValue({ id: 12 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
      payment: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 12,
          status: 'DELIVERING',
          fulfillmentMethod: 'DELIVERY',
        }),
      },
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    };
    const service = createService(prisma);

    await expect(service.updateStatus(12, 'COMPLETED')).resolves.toEqual(
      completedOrder,
    );
    expect(transaction.payment.updateMany).toHaveBeenCalledWith({
      where: {
        orderId: 12,
        method: 'COD',
        status: 'PENDING',
      },
      data: {
        status: 'PAID',
        paidAt: expect.any(Date),
      },
    });
  });
});
