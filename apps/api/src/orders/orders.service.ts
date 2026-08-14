import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CheckoutDto } from './dto/checkout.dto';
  
  @Injectable()
  export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}
  
    async checkout(userId: number, checkoutDto: CheckoutDto) {
      // Lấy giỏ hàng hiện tại cùng toàn bộ dữ liệu cần để tính giá
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
  
      // Kiểm tra lại dữ liệu trước khi tạo đơn
      for (const item of cart.items) {
        if (!item.product.isActive || !item.product.category.isActive) {
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
  
      // Tính lại toàn bộ giá từ database tại thời điểm checkout
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
  
      const totalPrice = calculatedItems.reduce(
        (total, current) => total + current.lineTotal,
        0,
      );
  
      // Transaction đảm bảo tạo Order và xóa Cart cùng thành công hoặc cùng rollback
      return this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            receiverName: checkoutDto.receiverName,
            receiverPhone: checkoutDto.receiverPhone,
            deliveryAddress: checkoutDto.deliveryAddress,
            note: checkoutDto.note,
            totalPrice,
  
            items: {
              create: calculatedItems.map(
                ({ item, variantPrice, unitPrice, lineTotal }) => ({
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
                    create: item.toppings.map((itemTopping) => ({
                      toppingId: itemTopping.toppingId,
  
                      // Snapshot topping để lịch sử đơn không bị đổi theo dữ liệu hiện tại
                      toppingName: itemTopping.topping.name,
                      toppingPrice: itemTopping.topping.price,
                    })),
                  },
                }),
              ),
            },
          },
          include: {
            items: {
              include: {
                toppings: true,
              },
            },
          },
        });
  
        // Checkout thành công thì làm trống giỏ hàng
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        });
  
        return order;
      });
    }
  
    async findMyOrders(userId: number) {
      // User chỉ xem lịch sử đơn hàng của chính mình
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
  
    async findMyOrder(userId: number, orderId: number) {
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
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
  
      return order;
    }

    async findAll() {
        // ADMIN/STAFF xem toàn bộ đơn hàng của hệ thống
        return this.prisma.order.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
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
      
      async findOne(id: number) {
        const order = await this.prisma.order.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
            items: {
              include: {
                toppings: true,
              },
            },
          },
        });
      
        if (!order) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }
      
        return order;
      }
      
      async updateStatus(id: number, status: string) {
        const order = await this.prisma.order.findUnique({
          where: { id },
        });
      
        if (!order) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }
      
        // Không cho thay đổi đơn đã hoàn tất hoặc đã hủy
        if (
          order.status === 'COMPLETED' ||
          order.status === 'CANCELLED'
        ) {
          throw new BadRequestException(
            'Không thể thay đổi trạng thái của đơn hàng đã hoàn tất hoặc đã hủy',
          );
        }
      
        // Kiểm soát luồng trạng thái hợp lệ của đơn hàng
        const allowedTransitions: Record<string, string[]> = {
          PENDING: ['CONFIRMED', 'CANCELLED'],
          CONFIRMED: ['PREPARING', 'CANCELLED'],
          PREPARING: ['DELIVERING'],
          DELIVERING: ['COMPLETED'],
        };
      
        const allowedStatuses = allowedTransitions[order.status] ?? [];
      
        if (!allowedStatuses.includes(status)) {
          throw new BadRequestException(
            `Không thể chuyển trạng thái từ ${order.status} sang ${status}`,
          );
        }
      
        return this.prisma.order.update({
          where: { id },
          data: {
            status: status as any,
          },
        });
      }
  }