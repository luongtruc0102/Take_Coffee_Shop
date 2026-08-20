import type { Cart } from '@/types/cart';

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

export type AddCartItemInput = {
  productId: number;
  variantId: number;
  quantity: number;
  toppingIds?: number[];
};

export async function addCartItem(
  accessToken: string,
  input: AddCartItemInput,
): Promise<Cart> {
  const response = await fetch(
    `${getApiUrl()}/cart/items`,
    {
      method: 'POST',

      headers:
        getHeaders(accessToken),

      body:
        JSON.stringify(input),
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
        'Không thể thêm món vào giỏ hàng',
    );
  }

  return data;
}

export type UpdateCartItemInput = {
  quantity: number;
};

// USER lấy giỏ hàng hiện tại
export async function getCart(
  accessToken: string,
): Promise<Cart> {
  const response = await fetch(
    `${getApiUrl()}/cart`,
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
        'Không thể tải giỏ hàng',
    );
  }

  return data;
}

// USER cập nhật số lượng món
export async function updateCartItem(
  accessToken: string,
  itemId: number,
  input: UpdateCartItemInput,
): Promise<Cart> {
  const response = await fetch(
    `${getApiUrl()}/cart/items/${itemId}`,
    {
      method: 'PATCH',

      headers:
        getHeaders(accessToken),

      body:
        JSON.stringify(input),
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
        'Không thể cập nhật giỏ hàng',
    );
  }

  return data;
}

// USER xóa một món khỏi giỏ hàng
export async function removeCartItem(
  accessToken: string,
  itemId: number,
): Promise<Cart> {
  const response = await fetch(
    `${getApiUrl()}/cart/items/${itemId}`,
    {
      method: 'DELETE',

      headers:
        getHeaders(accessToken),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Không thể xóa món khỏi giỏ hàng',
    );
  }

  return data;
}

// USER xóa toàn bộ giỏ hàng
export async function clearCart(
  accessToken: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${getApiUrl()}/cart`,
    {
      method: 'DELETE',

      headers:
        getHeaders(accessToken),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Không thể xóa giỏ hàng',
    );
  }

  return data;
}
