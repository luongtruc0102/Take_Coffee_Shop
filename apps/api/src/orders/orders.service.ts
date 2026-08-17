import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
  ) {}

  // Checkout giỏ hàng và tạo Order
  async checkout(userId: number, checkoutDto: CheckoutDto) {
    // Lấy toàn bộ dữ liệu cần thiết để backend tự tính lại giá
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
            toppings: {
              include: {
                topping: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống');
    }

    // Kiểm tra lại trạng thái sản phẩm trước khi tạo Order
    for (const item of cart.items) {
      if (
        !item.product.isActive ||
        !item.product.category.isActive
      ) {
        throw new BadRequestException(
          `Sản phẩm "${item.product.name}" hiện không còn khả dụng`,
        );
      }

      if (!item.variant.isActive) {
        throw new BadRequestException(
          `Size "${item.variant.size}" của sản phẩm "${item.product.name}" hiện không còn khả dụng`,
        );
      }

      const invalidTopping = item.toppings.find(
        (itemTopping) => !itemTopping.topping.isActive,
      );

      if (invalidTopping) {
        throw new BadRequestException(
          `Topping "${invalidTopping.topping.name}" hiện không còn khả dụng`,
        );
      }
    }

    // Luôn tính giá từ database, không tin dữ liệu giá từ client
    const calculatedItems = cart.items.map((item) => {
      const variantPrice = Number(item.variant.price);

      const toppingTotal = item.toppings.reduce(
        (total, itemTopping) =>
          total + Number(itemTopping.topping.price),
        0,
      );

      const unitPrice = variantPrice + toppingTotal;
      const lineTotal = unitPrice * item.quantity;

      return {
        item,
        variantPrice,
        unitPrice,
        lineTotal,
      };
    });

    // Tổng tiền trước khi áp dụng voucher
    const subtotal = calculatedItems.reduce(
      (total, current) => total + current.lineTotal,
      0,
    );

    let discountAmount = 0;
    let voucherId: number | undefined;
    let voucherCode: string | undefined;

    if (checkoutDto.voucherCode) {
      // Backend tự kiểm tra thời hạn, min order và giới hạn sử dụng
      const voucherResult =
        await this.vouchersService.validateForCheckout(
          checkoutDto.voucherCode,
          subtotal,
          userId,
        );

        voucherId =
          voucherResult.voucher?.id;
      
        voucherCode =
          voucherResult.voucherCode;
        
        discountAmount =
          voucherResult.discountAmount;
    }

    let loyaltyPointsUsed = 0;
    let loyaltyDiscountAmount = 0;

    const requestedPoints =
      checkoutDto.loyaltyPointsToUse ?? 0;

    if (requestedPoints > 0) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            role: true,
          },
        });

      if (!user) {
        throw new NotFoundException(
          'Không tìm thấy người dùng',
        );
      }

      // Chỉ khách hàng USER được sử dụng điểm tích lũy
      if (user.role.name !== 'USER') {
        throw new BadRequestException(
          'Chỉ khách hàng mới được sử dụng điểm tích lũy',
        );
      }

      // Phải đạt mốc 5.000 điểm mới mở khóa chức năng đổi điểm
      if (user.loyaltyPoints < 5000) {
        throw new BadRequestException(
          'Bạn cần đạt ít nhất 5.000 điểm để sử dụng điểm tích lũy',
        );
      }

      if (
        requestedPoints % 1000 !==
        0
      ) {
        throw new BadRequestException(
          'Số điểm sử dụng phải là bội số của 1.000',
        );
      }

      if (
        requestedPoints >
        user.loyaltyPoints
      ) {
        throw new BadRequestException(
          'Số điểm sử dụng vượt quá số điểm hiện có',
        );
      }

      loyaltyPointsUsed =
        requestedPoints;

      // 1.000 điểm = 1.000đ
      loyaltyDiscountAmount =
        requestedPoints;
    }

    // Tổng tiền cuối cùng khách cần thanh toán
    const priceAfterVoucher =
      subtotal - discountAmount;

    if (
      loyaltyDiscountAmount >
      priceAfterVoucher
    ) {
      throw new BadRequestException(
        'Số điểm sử dụng vượt quá giá trị đơn hàng còn lại',
      );
    }

    // Tổng tiền cuối cùng sau voucher và điểm tích lũy
    const totalPrice =
      priceAfterVoucher -
      loyaltyDiscountAmount;

    // Order, snapshot, voucher và Cart được xử lý trong cùng transaction
    return this.prisma.$transaction(async (tx) => {

      if (loyaltyPointsUsed > 0) {
        // Điều kiện gte giúp chống trường hợp 2 checkout đồng thời dùng cùng số điểm
        const result =
          await tx.user.updateMany({
            where: {
              id: userId,
              loyaltyPoints: {
                gte: loyaltyPointsUsed,
              },
            },
            data: {
              loyaltyPoints: {
                decrement:
                  loyaltyPointsUsed,
              },
            },
          });
      
        if (result.count === 0) {
          throw new BadRequestException(
            'Số điểm hiện tại không đủ để thanh toán',
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,

          receiverName: checkoutDto.receiverName,
          receiverPhone: checkoutDto.receiverPhone,
          deliveryAddress: checkoutDto.deliveryAddress,
          note: checkoutDto.note,

          subtotal,
          discountAmount,
          loyaltyDiscountAmount,
          totalPrice,
          
          voucherId,
          voucherCode,
          
          loyaltyPointsUsed,

          items: {
            create: calculatedItems.map(
              ({
                item,
                variantPrice,
                unitPrice,
                lineTotal,
              }) => ({
                productId: item.productId,
                variantId: item.variantId,

                // Snapshot thông tin sản phẩm tại thời điểm đặt hàng
                productName: item.product.name,
                size: item.variant.size,
                variantPrice,
                quantity: item.quantity,
                unitPrice,
                lineTotal,

                toppings: {
                  create: item.toppings.map(
                    (itemTopping) => ({
                      toppingId:
                        itemTopping.toppingId,

                      // Snapshot topping để lịch sử đơn không thay đổi
                      toppingName:
                        itemTopping.topping.name,
                      toppingPrice:
                        itemTopping.topping.price,
                    }),
                  ),
                },
              }),
            ),
          },
        },

        include: {
          voucher: true,
          items: {
            include: {
              toppings: true,
            },
          },
        },
      });

      if (voucherId !== undefined) {
        // Chỉ tăng lượt dùng khi Order đã tạo thành công
        await tx.voucher.update({
          where: {
            id: voucherId,
          },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Checkout thành công thì xóa toàn bộ item khỏi Cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });
  }

  // =========================
  // USER ORDER
  // =========================

  // User chỉ xem lịch sử đơn hàng của chính mình
  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            toppings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // User chỉ xem chi tiết Order thuộc tài khoản của mình
  async findMyOrder(
    userId: number,
    orderId: number,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng',
      );
    }

    return order;
  }

  // =========================
  // ADMIN / STAFF ORDER
  // =========================

  // ADMIN/STAFF xem toàn bộ đơn hàng trong hệ thống
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
  
        voucher: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
  
        payment: true,
  
        items: {
          include: {
            toppings: true,
          },
        },
      },
  
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ADMIN/STAFF xem chi tiết một đơn hàng
  async findOne(id: number) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id,
        },
  
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
  
          voucher: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
  
          payment: true,
  
          items: {
            include: {
              toppings: true,
            },
          },
        },
      });
  
    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng',
      );
    }
  
    return order;
  }

  // ADMIN/STAFF cập nhật trạng thái đơn hàng
  async updateStatus(
    id: number,
    status: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng',
      );
    }

    // COMPLETED và CANCELLED là trạng thái cuối
    if (
      order.status === 'COMPLETED' ||
      order.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        'Không thể thay đổi trạng thái của đơn hàng đã hoàn tất hoặc đã hủy',
      );
    }

    // Kiểm soát thứ tự xử lý đơn hàng
    const allowedTransitions: Record<
      string,
      string[]
    > = {
      PENDING: [
        'CONFIRMED',
        'CANCELLED',
      ],
      CONFIRMED: [
        'PREPARING',
        'CANCELLED',
      ],
      PREPARING: ['DELIVERING'],
      DELIVERING: ['COMPLETED'],
    };

    const allowedStatuses =
      allowedTransitions[order.status] ?? [];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${order.status} sang ${status}`,
      );
    }

    // Khi đơn chưa hoàn tất thì chỉ cập nhật trạng thái
    if (status !== 'COMPLETED') {
      return this.prisma.order.update({
        where: {
          id,
        },
        data: {
          status: status as any,
        },
      });
    }

    // Hoàn tất đơn và cộng điểm trong cùng transaction
    return this.prisma.$transaction(
      async (tx) => {
        const currentOrder =
          await tx.order.findUnique({
            where: {
              id,
            },
            include: {
              user: {
                include: {
                  role: true,
                },
              },
            },
          });

        if (!currentOrder) {
          throw new NotFoundException(
            'Không tìm thấy đơn hàng',
          );
        }

        // Chỉ USER được tích điểm
        const canEarnPoints =
          currentOrder.user.role.name ===
          'USER';

        // Điểm tính trên số tiền thực trả cuối cùng
        const paidAmount =
          Number(
            currentOrder.totalPrice,
          );

        // Mỗi 1.000đ = 10 điểm
        const earnedPoints =
          canEarnPoints
            ? Math.floor(
                paidAmount / 1000,
              ) * 10
            : 0;

        const updatedOrder =
          await tx.order.update({
            where: {
              id,
            },
            data: {
              status: 'COMPLETED',

              loyaltyPointsEarned:
                earnedPoints,

              loyaltyPointsGrantedAt:
                canEarnPoints
                  ? new Date()
                  : null,
            },
          });

        if (
          canEarnPoints &&
          earnedPoints > 0
        ) {
          await tx.user.update({
            where: {
              id:
                currentOrder.userId,
            },
            data: {
              loyaltyPoints: {
                increment:
                  earnedPoints,
              },
            },
          });
        }

        return updatedOrder;
      },
    );
  }
}