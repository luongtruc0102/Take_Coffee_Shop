'use client';

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/services/cart.service';

import type {
  Cart,
  CartItem,
} from '@/types/cart';

export default function CartPage() {
  const router =
    useRouter();

  const [
    cart,
    setCart,
  ] = useState<Cart | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<number | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState('');

  const [
    selectedItemIds,
    setSelectedItemIds,
  ] = useState<number[]>([]);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError('');

        const accessToken =
          localStorage.getItem(
            'accessToken',
          );

        if (!accessToken) {
          router.replace(
            '/login?redirect=/cart',
          );

          return;
        }

        const data =
            await getCart(
                accessToken,
            );

                setCart(data);

                // Mặc định chọn toàn bộ món trong giỏ
                setSelectedItemIds(
                data.items.map(
                    (item: CartItem) =>
                    item.id,
                ),
            );

      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải giỏ hàng',
        );
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [router]);

  function formatCurrency(
    value:
      | number
      | string,
  ) {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style:
          'currency',
        currency:
          'VND',
      },
    ).format(
      Number(value),
    );
  }

  function getImageUrl(
    imageUrl:
      | string
      | null,
  ) {
    if (!imageUrl) {
      return null;
    }

    if (
      imageUrl.startsWith(
        'http://',
      ) ||
      imageUrl.startsWith(
        'https://',
      )
    ) {
      return imageUrl;
    }

    const apiUrl =
      process.env
        .NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return null;
    }

    return `${apiUrl}${
      imageUrl.startsWith('/')
        ? imageUrl
        : `/${imageUrl}`
    }`;
  }

  function toggleItem(
    itemId: number,
  ) {
    setSelectedItemIds(
      (current) =>
        current.includes(
          itemId,
        )
          ? current.filter(
              (id) =>
                id !== itemId,
            )
          : [
              ...current,
              itemId,
            ],
    );
  }

  function toggleAllItems() {
    if (!cart) {
      return;
    }
  
    const allSelected =
      cart.items.length > 0 &&
      cart.items.every(
        (item) =>
          selectedItemIds.includes(
            item.id,
          ),
      );
  
    setSelectedItemIds(
      allSelected
        ? []
        : cart.items.map(
            (item) =>
              item.id,
          ),
    );
  }

  async function handleQuantity(
    item: CartItem,
    quantity: number,
  ) {
    if (quantity < 1) {
      return;
    }

    try {
      setError('');
      setUpdatingId(item.id);

      const accessToken =
        localStorage.getItem(
          'accessToken',
        );

      if (!accessToken) {
        router.replace(
          '/login?redirect=/cart',
        );

        return;
      }

      const updated =
        await updateCartItem(
          accessToken,
          item.id,
          {
            quantity,
          },
        );

      setCart(updated);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật số lượng',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(
    itemId: number,
  ) {
    try {
      setError('');
      setUpdatingId(itemId);

      const accessToken =
        localStorage.getItem(
          'accessToken',
        );

      if (!accessToken) {
        return;
      }

      const updated =
        await removeCartItem(
            accessToken,
            itemId,
        );

        setCart(updated);

        setSelectedItemIds(
        (current) =>
            current.filter(
            (id) =>
                id !== itemId,
            ),
        );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa món',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClear() {
    try {
      setError('');

      const accessToken =
        localStorage.getItem(
          'accessToken',
        );

      if (!accessToken) {
        return;
      }

      await clearCart(
        accessToken,
      );

      setCart(
        (current) =>
          current
            ? {
                ...current,
                items: [],
                totalPrice: 0,
              }
            : current,
      );
      setSelectedItemIds([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa giỏ hàng',
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-sm text-[#78866B]">
        Đang tải giỏ hàng...
      </div>
    );
  }

  const selectedItems =
  cart?.items.filter(
    (item) =>
      selectedItemIds.includes(
        item.id,
      ),
  ) ?? [];

const selectedQuantity =
  selectedItems.reduce(
    (total, item) =>
      total +
      item.quantity,
    0,
  );

const selectedTotal =
  selectedItems.reduce(
    (total, item) =>
      total +
      Number(
        item.lineTotal,
      ),
    0,
  );

const allSelected =
  !!cart &&
  cart.items.length > 0 &&
  cart.items.every(
    (item) =>
      selectedItemIds.includes(
        item.id,
      ),
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1B18]">
            Giỏ hàng
          </h1>

          <p className="mt-1 text-sm text-[#78866B]">
            Kiểm tra món trước khi thanh toán.
          </p>
        </div>

        <Link
          href="/menu"
          className="flex items-center gap-2 text-sm font-medium text-[#4A2C20]"
        >
          <ArrowLeft
            size={17}
          />

          Tiếp tục chọn món
        </Link>
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!cart ||
      cart.items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#E9E1D8] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E9DE] text-[#4A2C20]">
            <ShoppingBag
              size={25}
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-[#2A211D]">
            Giỏ hàng đang trống
          </h2>

          <p className="mt-2 text-sm text-[#78866B]">
            Chọn một món ngon rồi quay lại đây nhé.
          </p>

          <Link
            href="/menu"
            className="mt-5 inline-flex rounded-xl bg-[#4A2C20] px-5 py-3 text-sm font-semibold text-white"
          >
            Xem menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#E9E1D8] bg-white px-4 py-3 shadow-sm">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                    type="checkbox"
                    checked={
                        allSelected
                    }
                    onChange={
                        toggleAllItems
                    }
                    className="h-4 w-4 accent-[#4A2C20]"
                    />

                    <span className="text-sm font-semibold text-[#2A211D]">
                    Chọn tất cả
                    </span>

                    <span className="text-xs text-[#8A817B]">
                    ({cart.items.length}{' '}
                    món)
                    </span>
                </label>

                <span className="text-sm text-[#78866B]">
                    Đã chọn{' '}
                    <strong className="text-[#4A2C20]">
                    {selectedQuantity}
                    </strong>{' '}
                    sản phẩm
                </span>
            </div>
            {cart.items.map(
              (item) => {
                const imageUrl =
                  getImageUrl(
                    item.product
                      .imageUrl,
                  );

                return (
                <article
                key={item.id}
                className={`flex gap-3 rounded-2xl border bg-white p-4 shadow-sm transition ${
                    selectedItemIds.includes(
                    item.id,
                    )
                    ? 'border-[#D8C6B7]'
                    : 'border-[#E9E1D8] opacity-70'
                }`}
                >
                    <div className="flex shrink-0 items-start pt-1">
                        <input
                            type="checkbox"
                            checked={selectedItemIds.includes(
                            item.id,
                            )}
                            onChange={() =>
                            toggleItem(
                                item.id,
                            )
                            }
                            className="h-4 w-4 cursor-pointer accent-[#4A2C20]"
                        />
                    </div>
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F3E9DE] sm:h-28 sm:w-28">
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            item.product
                              .name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#C9894B]">
                          <ShoppingBag
                            size={24}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-bold text-[#2A211D]">
                            {
                              item.product
                                .name
                            }
                          </h2>

                          <p className="mt-1 text-sm text-[#78866B]">
                            Size{' '}
                            {
                              item.variant
                                .size
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            item.id
                          }
                          onClick={() =>
                            handleRemove(
                              item.id,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>

                      {item.toppings
                        .length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.toppings.map(
                            (
                              relation,
                            ) => (
                              <span
                                key={
                                  relation
                                    .toppingId
                                }
                                className="rounded-lg bg-[#F7F2EC] px-2 py-1 text-xs text-[#6B625C]"
                              >
                                {
                                  relation
                                    .topping
                                    .name
                                }{' '}
                                +{' '}
                                {formatCurrency(
                                  relation
                                    .topping
                                    .price,
                                )}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                                item.id ||
                              item.quantity <=
                                1
                            }
                            onClick={() =>
                              handleQuantity(
                                item,
                                item.quantity -
                                  1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E9E1D8] text-[#4A2C20] disabled:opacity-40"
                          >
                            <Minus
                              size={15}
                            />
                          </button>

                          <span className="min-w-6 text-center text-sm font-bold">
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              item.id
                            }
                            onClick={() =>
                              handleQuantity(
                                item,
                                item.quantity +
                                  1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A2C20] text-white disabled:opacity-50"
                          >
                            <Plus
                              size={15}
                            />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-[#8A817B]">
                            {
                              formatCurrency(
                                item.unitPrice,
                              )
                            }{' '}
                            / món
                          </p>

                          <p className="mt-1 font-bold text-[#4A2C20]">
                            {formatCurrency(
                              item.lineTotal,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}

            <button
              type="button"
              onClick={
                handleClear
              }
              className="text-sm font-medium text-red-500 transition hover:text-red-600"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>

          <aside className="h-fit self-start rounded-2xl border border-[#E9E1D8] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#2A211D]">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[#78866B]">
                Số món
              </span>

              <span className="font-semibold text-[#2A211D]">
                {selectedQuantity}
              </span>
            </div>

            <div className="mt-4 border-t border-[#E9E1D8] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#2A211D]">
                  Tổng cộng
                </span>

                <span className="text-xl font-bold text-[#4A2C20]">
                {formatCurrency(
                    selectedTotal,
                )}
                </span>
              </div>
            </div>

            <button
                type="button"
                disabled={
                    selectedItemIds.length ===
                    0
                }
                onClick={() => {
                    sessionStorage.setItem(
                    'checkoutItemIds',
                    JSON.stringify(
                        selectedItemIds,
                    ),
                    );

                    router.push(
                    '/checkout',
                    );
                }}
                className="mt-5 w-full rounded-2xl bg-[#4A2C20] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#382118] disabled:cursor-not-allowed disabled:opacity-50"
            >
                Tiến hành thanh toán
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}