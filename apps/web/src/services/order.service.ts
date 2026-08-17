import type {
    Order,
    OrderStatus,
  } from '@/types/order';
  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        'Thiếu NEXT_PUBLIC_API_URL',
      );
    }
  
    return API_URL;
  }
  
  function getHeaders(
    accessToken: string,
  ) {
    return {
      'Content-Type':
        'application/json',
  
      Authorization:
        `Bearer ${accessToken}`,
    };
  }
  
  // ADMIN/STAFF lấy toàn bộ đơn hàng
  export async function getAdminOrders(
    accessToken: string,
  ): Promise<Order[]> {
    const response = await fetch(
      `${getApiUrl()}/orders/management/all`,
      {
        headers:
          getHeaders(accessToken),
  
        cache: 'no-store',
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải đơn hàng',
      );
    }
  
    return data;
  }
  
  // ADMIN/STAFF xem chi tiết đơn hàng
  export async function getAdminOrderById(
    accessToken: string,
    orderId: number,
  ): Promise<Order> {
    const response = await fetch(
      `${getApiUrl()}/orders/management/${orderId}`,
      {
        headers:
          getHeaders(accessToken),
  
        cache: 'no-store',
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải chi tiết đơn hàng',
      );
    }
  
    return data;
  }
  
  // ADMIN/STAFF cập nhật trạng thái đơn
  export async function updateOrderStatus(
    accessToken: string,
    orderId: number,
    status: OrderStatus,
  ): Promise<Order> {
    const response = await fetch(
      `${getApiUrl()}/orders/management/${orderId}/status`,
      {
        method: 'PATCH',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify({
          status,
        }),
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      const message =
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
  
      throw new Error(
        message ||
          'Không thể cập nhật trạng thái đơn hàng',
      );
    }
  
    return data;
  }