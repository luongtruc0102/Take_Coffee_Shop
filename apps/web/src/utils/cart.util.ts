import type { Cart } from "@/types/cart";
import type { ReorderOrderResult } from "@/types/order";

// Tên event nội bộ giúp header cập nhật badge ngay trong cùng tab.
export const CART_UPDATED_EVENT = "kippora:cart-updated";

// Khóa session chỉ tồn tại đến khi tab trình duyệt được đóng.
const NEW_CART_ITEM_STORAGE_KEY = "kippora:new-cart-item-id";

// Thông báo một lần được chuyển từ trang đơn hàng sang trang giỏ.
const CART_MESSAGE_STORAGE_KEY = "kippora:cart-message";

// Thông báo mua lại được checkout đọc một lần sau khi điều hướng trực tiếp.
const REORDER_CHECKOUT_MESSAGE_STORAGE_KEY = "kippora:reorder-checkout-message";

// Đếm số dòng món trong giỏ; quantity không làm tăng badge header.
export function getCartItemCount(cart: Cart) {
  return cart.items.length;
}

// Phát số món mới để các component đang mở đồng bộ badge tức thì.
export function notifyCartUpdated(cart: Cart) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<number>(CART_UPDATED_EVENT, {
      detail: getCartItemCount(cart),
    }),
  );
}

// Ghi nhớ nhiều ID để luồng mua lại chọn đúng toàn bộ món vừa thêm hoặc gộp.
export function rememberNewCartItems(itemIds: number[]) {
  const validIds = [...new Set(itemIds)].filter(
    (itemId) => Number.isInteger(itemId) && itemId > 0,
  );

  if (validIds.length === 0) {
    sessionStorage.removeItem(NEW_CART_ITEM_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(NEW_CART_ITEM_STORAGE_KEY, JSON.stringify(validIds));
}

// Thêm một món từ menu dùng chung cơ chế với mua lại nhiều món.
export function rememberNewCartItem(itemId: number) {
  rememberNewCartItems([itemId]);
}

// Đọc rồi xóa danh sách ID để refresh trang không tự chọn lại lần nữa.
export function consumeNewCartItemIds() {
  const stored = sessionStorage.getItem(NEW_CART_ITEM_STORAGE_KEY);

  sessionStorage.removeItem(NEW_CART_ITEM_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    const values = Array.isArray(parsed) ? parsed : [parsed];

    return [...new Set(values)].filter(
      (itemId): itemId is number =>
        typeof itemId === "number" && Number.isInteger(itemId) && itemId > 0,
    );
  } catch {
    // Tương thích session cũ từng lưu một ID dưới dạng chuỗi thường.
    const legacyItemId = Number(stored);
    return Number.isInteger(legacyItemId) && legacyItemId > 0
      ? [legacyItemId]
      : [];
  }
}

export function rememberCartMessage(message: string) {
  sessionStorage.setItem(CART_MESSAGE_STORAGE_KEY, message);
}

export function consumeCartMessage() {
  const message = sessionStorage.getItem(CART_MESSAGE_STORAGE_KEY);
  sessionStorage.removeItem(CART_MESSAGE_STORAGE_KEY);
  return message;
}

/**
 * Chuẩn bị thông báo cho checkout. Mã đơn nguồn được truyền trên URL để tải
 * lại trang vẫn giữ đúng đơn; thao tác này không cập nhật Cart hoặc badge.
 */
export function prepareReorderedCheckout(result: ReorderOrderResult) {
  if (result.addedItemCount === 0 || result.selectedCartItemIds.length === 0) {
    return null;
  }

  sessionStorage.removeItem("checkoutItemIds");
  sessionStorage.removeItem("checkoutReorderOrderId");
  sessionStorage.removeItem("checkoutReorderOrderItemIds");

  const skippedMessage =
    result.skippedItems.length > 0
      ? ` ${result.skippedItems.length} món không còn phù hợp đã được bỏ qua.`
      : "";
  const message =
    `Đã chuẩn bị ${result.addedItemCount} sản phẩm từ đơn cũ.` + skippedMessage;

  sessionStorage.setItem(REORDER_CHECKOUT_MESSAGE_STORAGE_KEY, message);
  return message;
}

// Checkout đọc rồi xóa để thông báo không xuất hiện lại khi tải trang lần sau.
export function consumeReorderCheckoutMessage() {
  const message = sessionStorage.getItem(REORDER_CHECKOUT_MESSAGE_STORAGE_KEY);
  sessionStorage.removeItem(REORDER_CHECKOUT_MESSAGE_STORAGE_KEY);
  return message;
}
