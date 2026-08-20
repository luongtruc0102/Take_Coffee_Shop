import type {
  FulfillmentMethod,
  Order,
  OrderStatus,
  PaymentMethod,
} from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("Thiếu NEXT_PUBLIC_API_URL");
  }

  return API_URL;
}

function getHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",

    Authorization: `Bearer ${accessToken}`,
  };
}

// ADMIN/STAFF lấy toàn bộ đơn hàng
export async function getAdminOrders(accessToken: string): Promise<Order[]> {
  const response = await fetch(`${getApiUrl()}/orders/management/all`, {
    headers: getHeaders(accessToken),

    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải đơn hàng");
  }

  return data;
}

// ADMIN/STAFF xem chi tiết đơn hàng
export async function getAdminOrderById(
  accessToken: string,
  orderId: number,
): Promise<Order> {
  const response = await fetch(`${getApiUrl()}/orders/management/${orderId}`, {
    headers: getHeaders(accessToken),

    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải chi tiết đơn hàng");
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
      method: "PATCH",

      headers: getHeaders(accessToken),

      body: JSON.stringify({
        status,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;

    throw new Error(message || "Không thể cập nhật trạng thái đơn hàng");
  }

  return data;
}

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type DeliveryQuote = {
  latitude: number;
  longitude: number;
  normalizedAddress: string;
  distanceKm: number;
  routeCoordinates: RouteCoordinate[];
  deliveryBaseFee: number;
  deliveryDiscountAmount: number;
  deliveryFee: number;
};

export type AddressSuggestion = {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

export async function getDeliveryQuote(
  accessToken: string,
  deliveryAddress: string,
  subtotal: number,
  fulfillmentMethod: FulfillmentMethod,
): Promise<DeliveryQuote> {
  const response = await fetch(`${getApiUrl()}/orders/delivery-quote`, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify({ deliveryAddress, subtotal, fulfillmentMethod }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
    throw new Error(message || "Không thể tính phí giao hàng");
  }

  return data;
}

export async function getAddressSuggestions(
  accessToken: string,
  query: string,
): Promise<AddressSuggestion[]> {
  const response = await fetch(
    `${getApiUrl()}/orders/address-suggestions?query=${encodeURIComponent(query.trim())}`,
    {
      headers: getHeaders(accessToken),
      cache: "no-store",
    },
  );
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
    throw new Error(message || "Không thể tải gợi ý địa chỉ");
  }

  return data;
}

export async function getDeliveryLocationQuote(
  accessToken: string,
  input: {
    latitude: number;
    longitude: number;
    subtotal: number;
    fulfillmentMethod: FulfillmentMethod;
    deliveryAddress?: string;
  },
): Promise<DeliveryQuote> {
  const response = await fetch(
    `${getApiUrl()}/orders/delivery-location-quote`,
    {
      method: "POST",
      headers: getHeaders(accessToken),
      body: JSON.stringify(input),
    },
  );
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
    throw new Error(message || "Không thể tính khoảng cách tại vị trí này");
  }

  return data;
}

export type CheckoutInput = {
  cartItemIds: number[];

  receiverName: string;
  receiverPhone: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddress: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  paymentMethod: PaymentMethod;

  note?: string;
  voucherCodes?: string[];

  loyaltyPointsToUse?: number;
};

export async function checkoutOrder(
  accessToken: string,
  input: CheckoutInput,
): Promise<Order> {
  const response = await fetch(`${getApiUrl()}/orders/checkout`, {
    method: "POST",

    headers: getHeaders(accessToken),

    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;

    throw new Error(message || "Không thể tạo đơn hàng");
  }

  return data;
}
export async function getMyOrderById(
  accessToken: string,
  orderId: number,
): Promise<Order> {
  const response = await fetch(`${getApiUrl()}/orders/${orderId}`, {
    headers: getHeaders(accessToken),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải chi tiết đơn hàng");
  }

  return data;
}
