import type { Cart } from '@/types/cart';

// Tên event nội bộ giúp header cập nhật badge ngay trong cùng tab.
export const CART_UPDATED_EVENT =
  'kippora:cart-updated';

// Khóa session chỉ tồn tại đến khi tab trình duyệt được đóng.
const NEW_CART_ITEM_STORAGE_KEY =
  'kippora:new-cart-item-id';

// Đếm số dòng món trong giỏ; quantity không làm tăng badge header.
export function getCartItemCount(
  cart: Cart,
) {
  return cart.items.length;
}

// Phát số món mới để các component đang mở đồng bộ badge tức thì.
export function notifyCartUpdated(
  cart: Cart,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<number>(
      CART_UPDATED_EVENT,
      {
        detail:
          getCartItemCount(cart),
      },
    ),
  );
}

// Ghi nhớ ID món vừa thêm để trang giỏ chọn đúng một lần sau điều hướng.
export function rememberNewCartItem(
  itemId: number,
) {
  sessionStorage.setItem(
    NEW_CART_ITEM_STORAGE_KEY,
    String(itemId),
  );
}

// Đọc rồi xóa ID đã ghi nhớ, tránh tự chọn lại khi user refresh trang giỏ.
export function consumeNewCartItemId() {
  const stored = sessionStorage.getItem(
    NEW_CART_ITEM_STORAGE_KEY,
  );

  sessionStorage.removeItem(
    NEW_CART_ITEM_STORAGE_KEY,
  );

  const itemId = Number(stored);

  return Number.isInteger(itemId) &&
    itemId > 0
    ? itemId
    : null;
}
