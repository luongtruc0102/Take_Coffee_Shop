import type { Cart } from '@/types/cart';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

// Lấy URL backend dùng chung và báo lỗi cấu hình sớm cho mọi Cart API.
function getApiUrl() {
  if (!API_URL) {
    throw new Error(
      'Thiếu NEXT_PUBLIC_API_URL',
    );
  }

  return API_URL;
}

// Tạo bộ header JSON + JWT dùng chung cho các request giỏ hàng.
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

export type AddCartItemResult = Cart & {
  // ID do backend trả về để frontend chọn đúng CartItem vừa thêm hoặc tăng.
  addedItemId: number;
};

// Thêm món vào giỏ và nhận lại toàn bộ giỏ cùng ID dòng món vừa xử lý.
export async function addCartItem(
  accessToken: string,
  input: AddCartItemInput,
): Promise<AddCartItemResult> {
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

// Lấy giỏ hàng hiện tại của user đang đăng nhập.
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

// Đặt lại quantity của một CartItem và nhận giỏ đã được backend tính lại.
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

// Xóa một CartItem thuộc giỏ của user và nhận giỏ mới nhất.
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

// Xóa toàn bộ CartItem nhưng vẫn giữ bản ghi Cart của user.
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
