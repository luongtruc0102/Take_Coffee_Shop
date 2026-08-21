'use client';

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Landmark,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingCart,
  UserRound,
  Store,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  cancelMyOrder,
  getMyOrderById,
} from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/order';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value));
}

function getStatusLabel(status: OrderStatus, isPickup: boolean) {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PREPARING':
      return 'Đang chuẩn bị';
    case 'DELIVERING':
      return isPickup ? 'Sẵn sàng nhận' : 'Đang giao';
    case 'COMPLETED':
      return 'Hoàn tất';
    case 'CANCELLED':
      return 'Đã hủy';
  }
}

function getStatusClass(status: OrderStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700';
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-700';
    case 'PREPARING':
      return 'bg-orange-50 text-orange-700';
    case 'DELIVERING':
      return 'bg-violet-50 text-violet-700';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700';
    case 'CANCELLED':
      return 'bg-red-50 text-red-600';
  }
}

export default function UserOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          router.replace(`/login?redirect=/orders/${params.id}`);
          return;
        }

        const orderId = Number(params.id);
        if (!Number.isInteger(orderId)) {
          throw new Error('Mã đơn hàng không hợp lệ');
        }

        setOrder(await getMyOrderById(accessToken, orderId));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [params.id, router]);

  async function handleCancelOrder() {
    if (!order) {
      return;
    }

    try {
      setCancelling(true);
      setActionError('');
      setActionMessage('');

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.replace(`/login?redirect=/orders/${order.id}`);
        return;
      }

      const cancelledOrder = await cancelMyOrder(accessToken, order.id);
      setOrder(cancelledOrder);
      setCancelConfirmOpen(false);
      setActionMessage(
        'Đã hủy đơn hàng. Điểm tích lũy và lượt voucher đã được hoàn lại.',
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể hủy đơn hàng',
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[#78866B]">Đang tải đơn hàng...</div>;
  }

  if (error || !order) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-red-600">{error || 'Không tìm thấy đơn hàng'}</div>;
  }

  const isCod = order.payment?.method === 'COD';
  const isPickup = order.fulfillmentMethod === 'PICKUP';
  const statusSteps: OrderStatus[] = isPickup
    ? ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED']
    : ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const voucherCodes =
    order.appliedVouchers?.map((voucher) => voucher.code).join(', ') ||
    order.voucherCode ||
    '';
  const paymentStatusLabel =
    order.payment?.status === 'PAID'
      ? 'Đã thanh toán'
      : order.payment?.status === 'FAILED'
        ? 'Thanh toán thất bại'
        : order.payment?.status === 'CANCELLED'
          ? 'Đã hủy thanh toán'
          : 'Chờ thanh toán';
  const deliveryBaseFee = Number(order.deliveryBaseFee);
  const deliveryDiscount = Number(order.deliveryDiscountAmount);
  const voucherDiscount = Number(order.discountAmount);
  const loyaltyDiscount = Number(order.loyaltyDiscountAmount);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-[#E9E1D8] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B625C] transition hover:text-[#4A2C20]"
          >
            <ArrowLeft size={17} />
            Đơn hàng của tôi
          </Link>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(order.status)}`}
          >
            {getStatusLabel(order.status, isPickup)}
          </span>
        </div>

        <div className="mt-6 text-center">
          {order.status === 'CANCELLED' ? (
            <XCircle className="mx-auto text-red-500" size={48} />
          ) : (
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          )}
          <h1 className="mt-4 text-2xl font-bold text-[#2A211D]">
            Chi tiết đơn hàng #{order.id}
          </h1>
          <p className="mt-2 text-sm text-[#78866B]">
            {order.status === 'CANCELLED'
              ? 'Đơn hàng này đã được hủy.'
              : 'Cửa hàng đang cập nhật tiến độ đơn hàng của bạn.'}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#2A211D]">Tiến độ đơn hàng</h2>
        {order.status === 'CANCELLED' ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Đơn đã hủy và sẽ không tiếp tục xử lý.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {statusSteps.map((step, index) => {
                const reached = index <= currentStepIndex;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                      reached
                        ? 'border-[#C9894B] bg-[#FFF8F0] text-[#9A5D2E]'
                        : 'border-[#E9E1D8] bg-[#FAF8F5] text-[#A0968F]'
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${reached ? 'bg-[#C9894B] text-white' : 'bg-[#E9E1D8]'}`}>
                      {index + 1}
                    </span>
                    {getStatusLabel(step, isPickup)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {actionMessage && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageCheck size={19} className="text-[#C9894B]" />
            <h2 className="font-bold text-[#2A211D]">Sản phẩm</h2>
          </div>
          <div className="mt-4 divide-y divide-[#F0E8E0]">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-[#5E5650]">{item.productName} · {item.size} × {item.quantity}</span>
                <strong className="shrink-0 text-[#4A2C20]">{formatCurrency(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            {isCod ? <Banknote size={19} className="text-[#C9894B]" /> : <Landmark size={19} className="text-[#C9894B]" />}
            <h2 className="font-bold text-[#2A211D]">Thanh toán</h2>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#4A2C20]">
            {isCod
              ? isPickup
                ? 'Thanh toán tiền mặt tại quán'
                : 'Thanh toán tiền mặt khi nhận hàng'
              : 'Chuyển khoản ngân hàng'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#78866B]">
            {isCod
              ? isPickup
                ? 'Anh/chị vui lòng chuẩn bị đúng số tiền khi đến nhận món tại quán.'
                : 'Anh/chị vui lòng chuẩn bị đúng số tiền khi đơn được giao tới.'
              : 'Đơn đang chờ xác nhận chuyển khoản. Thông tin tài khoản sẽ được cửa hàng cung cấp khi cấu hình ngân hàng.'}
          </p>
        </section>
          <p className="mt-3 text-xs font-semibold text-[#8A817B]">
            Trạng thái: {paymentStatusLabel}
          </p>
      </div>

      <section className="mt-6 rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          {isPickup ? (
            <Store size={19} className="text-[#C9894B]" />
          ) : (
            <MapPin size={19} className="text-[#C9894B]" />
          )}
          <h2 className="font-bold text-[#2A211D]">
            {isPickup ? 'Đến quán lấy' : 'Giao hàng'}
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#5E5650]">
            <UserRound size={16} className="text-[#C9894B]" />
            {order.receiverName}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#5E5650]">
            <Phone size={16} className="text-[#C9894B]" />
            {order.receiverPhone}
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-[#FAF8F5] px-3 py-3 text-sm leading-6 text-[#5E5650]">
          {order.deliveryAddress}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#78866B]">
          {isPickup ? (
            <span className="font-semibold text-emerald-700">Không tính phí giao hàng</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5"><Truck size={16} /> {Number(order.deliveryDistanceKm).toLocaleString('vi-VN')} km</span>
              <span>Phí giao hàng: {formatCurrency(order.deliveryFee)}</span>
            </>
          )}
        </div>
        {order.note && (
          <div className="mt-4 border-t border-[#F0E8E0] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A817B]">Ghi chú</p>
            <p className="mt-2 text-sm leading-6 text-[#5E5650]">{order.note}</p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <PackageCheck size={19} className="text-[#C9894B]" />
          <h2 className="font-bold text-[#2A211D]">Chi tiết thanh toán</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="mt-4 flex justify-between">
            <span className="text-[#78866B]">Tiền món</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-[#78866B]">Voucher{voucherCodes ? ` (${voucherCodes})` : ''}</span>
              <span className="shrink-0 text-emerald-700">-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-[#78866B]">Điểm tích lũy ({order.loyaltyPointsUsed.toLocaleString('vi-VN')} điểm)</span>
              <span className="shrink-0 text-emerald-700">-{formatCurrency(loyaltyDiscount)}</span>
            </div>
          )}
          {isPickup ? (
            <div className="flex justify-between">
              <span className="text-[#78866B]">Phí nhận tại quán</span>
              <span className="font-medium text-emerald-700">Miễn phí</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-[#78866B]">Phí giao hàng gốc</span>
                <span>{formatCurrency(deliveryBaseFee)}</span>
              </div>
              {deliveryDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#78866B]">Ưu đãi giao hàng</span>
                  <span className="text-emerald-700">-{formatCurrency(deliveryDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-[#2A211D]">
                <span>Phí giao hàng sau ưu đãi</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#E9E1D8] pt-4">
          <span className="font-semibold text-[#2A211D]">Tổng thanh toán</span>
          <span className="text-xl font-bold text-[#4A2C20]">{formatCurrency(order.totalPrice)}</span>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {order.status === 'PENDING' && (
          <button
            type="button"
            onClick={() => setCancelConfirmOpen(true)}
            className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Hủy đơn hàng
          </button>
        )}
        <Link
          href="/orders"
          className="rounded-xl border border-[#D9CABE] bg-white px-5 py-3 text-sm font-semibold text-[#4A2C20]"
        >
          Xem tất cả đơn hàng
        </Link>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 rounded-xl bg-[#4A2C20] px-5 py-3 text-sm font-semibold text-white"
        >
          <ShoppingCart size={17} />
          Mua lại từ giỏ hàng
        </Link>
      </div>

      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E9E1D8] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle size={24} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#2A211D]">
              Hủy đơn hàng #{order.id}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#78866B]">
              Đơn sẽ ngừng xử lý. Điểm tích lũy đã dùng và lượt voucher
              của đơn này sẽ được hoàn lại.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelConfirmOpen(false)}
                className="rounded-xl border border-[#D9CABE] px-4 py-2.5 text-sm font-semibold text-[#5E5650] disabled:opacity-60"
              >
                Giữ đơn
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void handleCancelOrder()}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}