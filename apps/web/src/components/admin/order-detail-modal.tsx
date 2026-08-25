'use client';

import {
  Check,
  ChevronRight,
  CircleX,
  MapPin,
  Package,
  Phone,
  User,
  X,
} from 'lucide-react';

import type {
  Order,
  OrderStatus,
} from '@/types/order';

type Props = {
  open: boolean;
  order: Order | null;
  updating: boolean;

  onClose: () => void;

  onUpdateStatus: (
    order: Order,
    status: OrderStatus,
  ) => Promise<void>;
};

const STATUS_LABELS: Record<
  OrderStatus,
  string
> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY_FOR_PICKUP: 'Sẵn sàng nhận',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

function formatCurrency(
  value: number | string,
) {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    },
  ).format(Number(value));
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value));
}

function getNextStatuses(
  status: OrderStatus,
  fulfillmentMethod: Order['fulfillmentMethod'],
): OrderStatus[] {
  switch (status) {
    case 'PENDING':
      return [
        'CONFIRMED',
        'CANCELLED',
      ];

    case 'CONFIRMED':
      return [
        'PREPARING',
        'CANCELLED',
      ];

    case 'PREPARING':
      return fulfillmentMethod === 'PICKUP'
        ? ['COMPLETED']
        : ['DELIVERING'];

    case 'READY_FOR_PICKUP':
      return ['COMPLETED'];

    case 'DELIVERING':
      return ['COMPLETED'];

    default:
      return [];
  }
}

export default function OrderDetailModal({
  open,
  order,
  updating,
  onClose,
  onUpdateStatus,
}: Props) {
  if (!open || !order) {
    return null;
  }

  const nextStatuses =
    getNextStatuses(order.status, order.fulfillmentMethod);

  const paymentMethod =
    order.payment?.method ===
    'BANK_TRANSFER'
      ? 'Chuyển khoản'
      : order.payment?.method ===
          'COD'
        ? 'Thanh toán khi nhận hàng'
        : 'Chưa có';

  const paymentStatus =
    !order.payment
      ? 'Chưa thanh toán'
      : order.payment.status ===
          'PAID'
        ? 'Đã thanh toán'
        : order.payment.status ===
            'PENDING'
          ? 'Chờ thanh toán'
          : order.payment.status ===
              'FAILED'
            ? 'Thất bại'
            : 'Đã hủy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E9E1D8] bg-white shadow-xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E9E1D8] bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-[#1F1B18]">
                Đơn hàng #{order.id}
              </h3>

              <span className="rounded-full bg-[#F7F2EC] px-3 py-1 text-xs font-semibold text-[#4A2C20]">
                {
                  STATUS_LABELS[
                    order.status
                  ]
                }
              </span>
            </div>

            <p className="mt-1 text-sm text-[#78866B]">
              {formatDate(
                order.createdAt,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#78866B] transition hover:bg-[#FAF8F5]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E9E1D8] bg-[#FAF8F5] p-5">
              <h4 className="font-semibold text-[#1F1B18]">
                {order.fulfillmentMethod === 'PICKUP'
                  ? 'Thông tin nhận tại quán'
                  : 'Thông tin giao hàng'}
              </h4>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User
                    size={17}
                    className="mt-0.5 text-[#C9894B]"
                  />

                  <div>
                    <p className="text-xs text-[#8A817B]">
                      Người nhận
                    </p>

                    <p className="font-medium text-[#1F1B18]">
                      {
                        order.receiverName
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    size={17}
                    className="mt-0.5 text-[#C9894B]"
                  />

                  <div>
                    <p className="text-xs text-[#8A817B]">
                      Số điện thoại
                    </p>

                    <p className="font-medium text-[#1F1B18]">
                      {
                        order.receiverPhone
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={17}
                    className="mt-0.5 text-[#C9894B]"
                  />

                  <div>
                    <p className="text-xs text-[#8A817B]">
                      {order.fulfillmentMethod === 'PICKUP'
                        ? 'Địa chỉ quán'
                        : 'Địa chỉ giao hàng'}
                    </p>

                    <p className="font-medium leading-6 text-[#1F1B18]">
                      {
                        order.deliveryAddress
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E9E1D8] p-5">
              <h4 className="font-semibold text-[#1F1B18]">
                Thanh toán
              </h4>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#78866B]">
                    Phương thức
                  </span>

                  <span className="text-right font-medium text-[#1F1B18]">
                    {paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#78866B]">
                    Trạng thái
                  </span>

                  <span className="font-medium text-[#1F1B18]">
                    {paymentStatus}
                  </span>
                </div>

                {order.payment
                  ?.transactionCode && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#78866B]">
                      Mã giao dịch
                    </span>

                    <span className="font-medium text-[#1F1B18]">
                      {
                        order.payment
                          .transactionCode
                      }
                    </span>
                  </div>
                )}

                {order.voucherCode && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#78866B]">
                      Voucher
                    </span>

                    <span className="font-semibold text-[#C9894B]">
                      {
                        order.voucherCode
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E9E1D8]">
            <div className="flex items-center gap-2 border-b border-[#E9E1D8] bg-[#FAF8F5] px-5 py-4">
              <Package
                size={18}
                className="text-[#C9894B]"
              />

              <h4 className="font-semibold text-[#1F1B18]">
                Sản phẩm
              </h4>
            </div>

            <div className="divide-y divide-[#F0E8E0]">
              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F1B18]">
                          {
                            item.productName
                          }
                        </p>

                        <p className="mt-1 text-sm text-[#78866B]">
                          Size {item.size} ·{' '}
                          {formatCurrency(
                            item.variantPrice,
                          )}
                        </p>

                        {item.toppings
                          .length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.toppings.map(
                              (
                                topping,
                              ) => (
                                <span
                                  key={
                                    topping.id
                                  }
                                  className="rounded-lg bg-[#F7F2EC] px-2.5 py-1 text-xs text-[#5E5650]"
                                >
                                  {
                                    topping.toppingName
                                  }{' '}
                                  +{' '}
                                  {formatCurrency(
                                    topping.toppingPrice,
                                  )}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm text-[#78866B]">
                          x{item.quantity}
                        </p>

                        <p className="mt-1 font-semibold text-[#4A2C20]">
                          {formatCurrency(
                            item.lineTotal,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {order.note && (
            <div className="rounded-2xl border border-[#E9E1D8] bg-[#FFFDF9] p-5">
              <p className="text-sm font-semibold text-[#1F1B18]">
                Ghi chú của khách
              </p>

              <p className="mt-2 text-sm leading-6 text-[#5E5650]">
                {order.note}
              </p>
            </div>
          )}

          <div className="ml-auto max-w-md space-y-3 rounded-2xl border border-[#E9E1D8] p-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#78866B]">
                Tạm tính
              </span>

              <span className="font-medium text-[#1F1B18]">
                {formatCurrency(
                  order.subtotal,
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#78866B]">
                Giảm giá
              </span>

              <span className="font-medium text-emerald-700">
                -{' '}
                {formatCurrency(
                  order.discountAmount,
                )}
              </span>
            </div>

            {Number(
                order.loyaltyPointsUsed,
              ) > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78866B]">
                      Điểm đã dùng
                    </span>

                    <span className="font-medium text-[#4A2C20]">
                      {Number(
                        order.loyaltyPointsUsed,
                      ).toLocaleString(
                        'vi-VN',
                      )}{' '}
                      điểm
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#78866B]">
                      Giảm từ điểm
                    </span>

                    <span className="font-medium text-emerald-700">
                      -{' '}
                      {formatCurrency(
                        order.loyaltyDiscountAmount,
                      )}
                    </span>
                  </div>
                </>
              )}

            <div className="border-t border-[#E9E1D8] pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1F1B18]">
                  Tổng thanh toán
                </span>

                <span className="text-xl font-bold text-[#4A2C20]">
                  {formatCurrency(
                    order.totalPrice,
                  )}
                </span>
              </div>
            </div>

            {order.status ===
              'COMPLETED' &&
              Number(
                order.loyaltyPointsEarned,
              ) > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-[#F4F8F1] px-3 py-2.5">
                  <span className="text-sm font-medium text-[#5F7254]">
                    Điểm khách nhận
                  </span>

                  <span className="font-bold text-[#5F7254]">
                    +
                    {Number(
                      order.loyaltyPointsEarned,
                    ).toLocaleString(
                      'vi-VN',
                    )}{' '}
                    điểm
                  </span>
                </div>
              )}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E1D8] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-xl border border-[#E9E1D8] px-4 py-2.5 text-sm font-medium text-[#5E5650] transition hover:bg-[#FAF8F5]"
          >
            Đóng
          </button>

          {nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map(
                (status) => {
                  const isCancel =
                    status ===
                    'CANCELLED';

                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={
                        updating
                      }
                      onClick={() =>
                        onUpdateStatus(
                          order,
                          status,
                        )
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                        isCancel
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-[#4A2C20] text-white hover:bg-[#382118]'
                      }`}
                    >
                      {isCancel ? (
                        <CircleX
                          size={17}
                        />
                      ) : status ===
                        'COMPLETED' ? (
                        <Check
                          size={17}
                        />
                      ) : (
                        <ChevronRight
                          size={17}
                        />
                      )}

                      {
                        STATUS_LABELS[
                          status
                        ]
                      }
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}