import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreatePaymentDto } from './dto/create-payment.dto';
  import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
  
  @Injectable()
  export class PaymentsService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(
      userId: number,
      orderId: number,
      createPaymentDto: CreatePaymentDto,
    ) {
      // User chỉ được tạo Payment cho Order của chính mình
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          payment: true,
        },
      });
  
      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
  
      if (order.payment) {
        throw new ConflictException(
          'Đơn hàng đã có thông tin thanh toán',
        );
      }
  
      if (order.status === 'CANCELLED') {
        throw new BadRequestException(
          'Không thể thanh toán đơn hàng đã bị hủy',
        );
      }

      if (order.status === 'COMPLETED') {
        throw new BadRequestException(
          'Không thể tạo thanh toán cho đơn hàng đã hoàn tất',
        );
      }
  
      return this.prisma.payment.create({
        data: {
          orderId,
          method: createPaymentDto.method as
            | 'COD'
            | 'BANK_TRANSFER',
  
          // Luôn lấy số tiền trực tiếp từ Order
          amount: order.totalPrice,
        },
      });
    }
  
    async findMyPayment(userId: number, orderId: number) {
      // Đảm bảo user chỉ xem Payment thuộc Order của mình
      const payment = await this.prisma.payment.findFirst({
        where: {
          orderId,
          order: {
            userId,
          },
        },
        include: {
          order: true,
        },
      });
  
      if (!payment) {
        throw new NotFoundException(
          'Không tìm thấy thông tin thanh toán',
        );
      }
  
      return payment;
    }
  
    async findAll() {
      // ADMIN/STAFF xem toàn bộ Payment
      return this.prisma.payment.findMany({
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  
    async updateStatus(
        id: number,
        updatePaymentStatusDto: UpdatePaymentStatusDto,
      ) {
        const payment = await this.prisma.payment.findUnique({
          where: { id },
        });
      
        if (!payment) {
          throw new NotFoundException(
            'Không tìm thấy thông tin thanh toán',
          );
        }
      
        // Thanh toán đã hoàn tất thì không được thay đổi lại
        if (payment.status === 'PAID') {
          throw new BadRequestException(
            'Thanh toán đã hoàn tất và không thể thay đổi',
          );
        }
      
        // Kiểm soát luồng trạng thái hợp lệ
        const allowedTransitions: Record<string, string[]> = {
          PENDING: ['PAID', 'FAILED', 'CANCELLED'],
          FAILED: ['PENDING'],
          CANCELLED: [],
        };
      
        const allowedStatuses =
          allowedTransitions[payment.status] ?? [];
      
        if (!allowedStatuses.includes(updatePaymentStatusDto.status)) {
          throw new BadRequestException(
            `Không thể chuyển trạng thái thanh toán từ ${payment.status} sang ${updatePaymentStatusDto.status}`,
          );
        }
        
        // Chuyển khoản thành công phải có mã giao dịch để đối soát
        if (
            payment.method === 'BANK_TRANSFER' &&
            updatePaymentStatusDto.status === 'PAID' &&
            !updatePaymentStatusDto.transactionCode
        ) {
            throw new BadRequestException(
            'Thanh toán chuyển khoản thành công phải có mã giao dịch',
            );
        }

        return this.prisma.payment.update({
          where: { id },
          data: {
            status: updatePaymentStatusDto.status as
              | 'PENDING'
              | 'PAID'
              | 'FAILED'
              | 'CANCELLED',
      
            transactionCode:
              updatePaymentStatusDto.transactionCode,
      
            // Chỉ ghi thời gian thanh toán khi Payment chuyển sang PAID
            paidAt:
              updatePaymentStatusDto.status === 'PAID'
                ? new Date()
                : null,
          },
        });
      }
  }