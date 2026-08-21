'use client';

import {
  Check,
  Coffee,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  addCartItem,
} from '@/services/cart.service';

import type {
  Product,
  ProductVariant,
} from '@/types/menu';

import {
  notifyCartUpdated,
  rememberNewCartItem,
} from '@/utils/cart.util';

type Props = {
  open: boolean;
  product: Product | null;

  onClose: () => void;
};

export default function ProductOrderModal({
  open,
  product,
  onClose,
}: Props) {
  const [
    selectedVariant,
    setSelectedVariant,
  ] =
    useState<ProductVariant | null>(
      null,
    );

  const [
    selectedToppingIds,
    setSelectedToppingIds,
  ] = useState<number[]>([]);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const router =
    useRouter();

  const [
    adding,
    setAdding,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  // Mỗi lần mở món mới, đặt lại size mặc định, topping và quantity cũ.
  useEffect(() => {
    if (
      !open ||
      !product
    ) {
      return;
    }

    setSelectedVariant(
      product.variants[0] ??
        null,
    );

    setSelectedToppingIds(
      [],
    );

    setQuantity(1);
  }, [
    open,
    product,
  ]);

  // Tính giá xem trước từ size + các topping đã chọn rồi nhân quantity;
  // backend vẫn là nơi tính giá chính thức khi trả giỏ hàng.
  const totalPrice =
    useMemo(() => {
      if (
        !product ||
        !selectedVariant
      ) {
        return 0;
      }

      const toppingTotal =
        product.toppings.reduce(
          (
            total,
            relation,
          ) => {
            if (
              !selectedToppingIds.includes(
                relation.topping.id,
              )
            ) {
              return total;
            }

            return (
              total +
              Number(
                relation.topping.price,
              )
            );
          },
          0,
        );

      return (
        (Number(
          selectedVariant.price,
        ) +
          toppingTotal) *
        quantity
      );
    }, [
      product,
      selectedVariant,
      selectedToppingIds,
      quantity,
    ]);

  if (
    !open ||
    !product
  ) {
    return null;
  }

  // Hiển thị mọi giá tiền trong modal theo định dạng tiền Việt Nam.
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

  // Chuẩn hóa ảnh tương đối của backend thành URL có thể hiển thị.
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
      imageUrl.startsWith(
        '/',
      )
        ? imageUrl
        : `/${imageUrl}`
    }`;
  }

  // Bật hoặc bỏ một topping trong lựa chọn của món hiện tại.
  function toggleTopping(
    toppingId: number,
  ) {
    setSelectedToppingIds(
      (current) =>
        current.includes(
          toppingId,
        )
          ? current.filter(
              (id) =>
                id !==
                toppingId,
            )
          : [
              ...current,
              toppingId,
            ],
    );
  }

  const imageUrl =
    getImageUrl(
      product.imageUrl,
    );

    // Kiểm tra đăng nhập, thêm món qua backend rồi chuyển tới trang giỏ.
    async function handleAddToCart() {
      try {
        setError('');
    
        const accessToken =
          localStorage.getItem(
            'accessToken',
          );
    
        const storedUser =
          localStorage.getItem(
            'user',
          );
    
        if (
          !accessToken ||
          !storedUser
        ) {
          // router.push('/login');
          router.push('/login?redirect=/menu');
          return;
        }
    
        const user =
          JSON.parse(
            storedUser,
          );
    
        if (
          user.role !== 'USER'
        ) {
          throw new Error(
            'Chỉ tài khoản khách hàng mới có thể đặt món',
          );
        }
    
        if (
          !product ||
          !selectedVariant
        ) {
          throw new Error(
            'Thông tin sản phẩm không hợp lệ',
          );
        }
    
        setAdding(true);
    
        const updatedCart = await addCartItem(
          accessToken,
          {
            productId:
              product.id,
    
            variantId:
              selectedVariant.id,
    
            quantity,
    
            toppingIds:
              selectedToppingIds,
          },
        );

        // Backend trả đúng ID của dòng vừa tạo hoặc vừa tăng quantity.
        rememberNewCartItem(updatedCart.addedItemId);

        notifyCartUpdated(updatedCart);
    
        onClose();
    
        router.push('/cart');
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể thêm món vào giỏ hàng',
        );
      } finally {
        setAdding(false);
      }
    }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng"
        onClick={
          onClose
        }
        className="absolute inset-0"
      />

    <div className="no-scrollbar relative z-10 max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <div className="relative aspect-[16/9] overflow-hidden bg-[#F3E9DE] sm:aspect-[2/1]">
          {imageUrl ? (
            <img
              src={
                imageUrl
              }
              alt={
                product.name
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#C9894B]">
              <Coffee
                size={48}
              />
            </div>
          )}

          <button
            type="button"
            onClick={
              onClose
            }
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#4A2C20] shadow-sm backdrop-blur"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C9894B]">
            {
              product
                .category
                .name
            }
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#2A211D]">
            {
              product.name
            }
          </h2>

          {product.description && (
            <p className="mt-2 text-sm leading-6 text-[#6B625C]">
              {
                product.description
              }
            </p>
          )}

          <section className="mt-6">
            <h3 className="font-semibold text-[#2A211D]">
              Chọn size
            </h3>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.variants.map(
                (
                  variant,
                ) => {
                  const active =
                    selectedVariant
                      ?.id ===
                    variant.id;

                  return (
                    <button
                      key={
                        variant.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedVariant(
                          variant,
                        )
                      }
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        active
                          ? 'border-[#4A2C20] bg-[#F3E9DE]'
                          : 'border-[#E9E1D8] bg-white hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2A211D]">
                          {
                            variant.size
                          }
                        </span>

                        {active && (
                          <Check
                            size={
                              16
                            }
                            className="text-[#4A2C20]"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-xs font-medium text-[#78866B]">
                        {formatCurrency(
                          variant.price,
                        )}
                      </p>
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {product.toppings
            .length > 0 && (
            <section className="mt-6">
              <div>
                <h3 className="font-semibold text-[#2A211D]">
                  Topping
                </h3>

                <p className="mt-1 text-xs text-[#8A817B]">
                  Có thể chọn nhiều
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {product.toppings.map(
                  (
                    relation,
                  ) => {
                    const topping =
                      relation.topping;

                    const active =
                      selectedToppingIds.includes(
                        topping.id,
                      );

                    return (
                      <button
                        key={
                          topping.id
                        }
                        type="button"
                        onClick={() =>
                          toggleTopping(
                            topping.id,
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-[#C9894B] bg-[#FFF8F0]'
                            : 'border-[#E9E1D8] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                              active
                                ? 'border-[#C9894B] bg-[#C9894B] text-white'
                                : 'border-[#C9BBB0]'
                            }`}
                          >
                            {active && (
                              <Check
                                size={
                                  13
                                }
                              />
                            )}
                          </div>

                          <span className="text-sm font-medium text-[#2A211D]">
                            {
                              topping.name
                            }
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-[#C9894B]">
                          +{' '}
                          {formatCurrency(
                            topping.price,
                          )}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          )}

          <section className="mt-6 flex items-center justify-between rounded-2xl bg-[#FAF8F5] p-4">
            <div>
              <p className="text-sm font-semibold text-[#2A211D]">
                Số lượng
              </p>

              <p className="mt-1 text-xs text-[#8A817B]">
                Chọn số lượng món
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={
                  quantity <=
                  1
                }
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          1,
                      ),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E9E1D8] bg-white text-[#4A2C20] disabled:opacity-40"
              >
                <Minus
                  size={
                    17
                  }
                />
              </button>

              <span className="min-w-6 text-center font-bold text-[#2A211D]">
                {
                  quantity
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      current +
                      1,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A2C20] text-white"
              >
                <Plus
                  size={
                    17
                  }
                />
              </button>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-[#E9E1D8] bg-white/95 p-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs text-[#8A817B]">
              Tổng cộng
            </p>

            <p className="text-xl font-bold text-[#4A2C20]">
              {formatCurrency(
                totalPrice,
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={
              !selectedVariant ||
              adding
            }
            onClick={
              handleAddToCart
            }
            className="flex items-center gap-2 rounded-2xl bg-[#4A2C20] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#382118] disabled:cursor-wait disabled:opacity-50"
          >
            <ShoppingCart
              size={18}
            />

            {adding
              ? 'Đang thêm...'
              : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
}