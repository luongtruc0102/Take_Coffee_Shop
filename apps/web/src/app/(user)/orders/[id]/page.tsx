'use client';

import {
  Banknote,
  CheckCircle2,
  Landmark,
  MapPin,
  PackageCheck,
  Store,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyOrderById } from '@/services/order.service';
import type { Order } from '@/types/order';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value));
}

export default function UserOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    loadOrder();
  }, [params.id, router]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[#78866B]">Đang tải đơn hàng...</div>;
  }

  if (error || !order) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-red-600">{error || 'Không tìm thấy đơn hàng'}</div>;
  }

  const isCod = order.payment?.method === 'COD';
  const isPickup = order.fulfillmentMethod === 'PICKUP';

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-[#E9E1D8] bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
        <h1 className="mt-4 text-2xl font-bold text-[#2A211D]">Đặt hàng thành công</h1>
        <p className="mt-2 text-sm text-[#78866B]">Mã đơn #{order.id} đã được tiếp nhận.</p>
      </section>

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
        <p className="mt-3 text-sm text-[#5E5650]">{order.deliveryAddress}</p>
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
      </section>

      <section className="mt-6 rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-[#78866B]">Tiền món</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#78866B]">Giảm voucher</span><span className="text-emerald-700">-{formatCurrency(order.discountAmount)}</span></div>
          <div className="flex justify-between"><span className="text-[#78866B]">Giảm từ điểm</span><span className="text-emerald-700">-{formatCurrency(order.loyaltyDiscountAmount)}</span></div>
          <div className="flex justify-between"><span className="text-[#78866B]">{isPickup ? 'Phí nhận tại quán' : 'Phí giao hàng'}</span><span>{isPickup ? 'Miễn phí' : formatCurrency(order.deliveryFee)}</span></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#E9E1D8] pt-4">
          <span className="font-semibold text-[#2A211D]">Tổng thanh toán</span>
          <span className="text-xl font-bold text-[#4A2C20]">{formatCurrency(order.totalPrice)}</span>
        </div>
      </section>

      <div className="mt-6 flex justify-center">
        <Link href="/menu" className="rounded-xl bg-[#4A2C20] px-5 py-3 text-sm font-semibold text-white">Tiếp tục chọn món</Link>
      </div>
    </main>
  );
}