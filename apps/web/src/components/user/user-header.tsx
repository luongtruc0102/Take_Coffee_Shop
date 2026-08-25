'use client';

import {
  LogIn,
  Menu,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

import BrandLogo from '@/components/brand/brand-logo';
import NotificationBell from '@/components/user/notification-bell';

import { getCart } from '@/services/cart.service';

import {
  CART_UPDATED_EVENT,
  getCartItemCount,
} from '@/utils/cart.util';

import {
  AUTH_USER_UPDATED_EVENT,
  type StoredAuthUser,
} from '@/utils/auth.util';

const navItems = [
  {
    label: 'Trang chủ',
    href: '/',
  },
  {
    label: 'Menu',
    href: '/menu',
  },
];

export default function UserHeader() {
  const pathname =
    usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    user,
    setUser,
  ] =
    useState<StoredAuthUser | null>(
      null,
    );

  const [
    cartItemCount,
    setCartItemCount,
  ] = useState(0);

  // Khôi phục user, tải badge ban đầu và lắng nghe mọi thay đổi của giỏ.
  useEffect(() => {
    let active = true;

    // Nhận số dòng món từ event nội bộ do modal hoặc trang giỏ phát ra.
    function handleCartUpdated(
      event: Event,
    ) {
      const cartEvent =
        event as CustomEvent<number>;
      const nextCount =
        Number(cartEvent.detail);

      if (Number.isFinite(nextCount)) {
        setCartItemCount(
          Math.max(0, nextCount),
        );
      }
    }

    // Nhận hồ sơ mới sau khi user cập nhật tên, phone hoặc avatar.
    function handleUserUpdated(
      event: Event,
    ) {
      const userEvent =
        event as CustomEvent<
          StoredAuthUser
        >;

      setUser(
        userEvent.detail,
      );
    }

    // Cập nhật badge ngay khi giỏ đổi mà không cần tải lại trang.
    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated,
    );

    window.addEventListener(
      AUTH_USER_UPDATED_EVENT,
      handleUserUpdated,
    );

    // Chạy sau khi component mount để chỉ đọc localStorage ở phía browser.
    const timeoutId = window.setTimeout(() => {
      const storedUser =
        localStorage.getItem(
          'user',
        );

      if (!storedUser) {
        return;
      }

      try {
        const parsedUser =
          JSON.parse(
            storedUser,
          ) as StoredAuthUser;

        setUser(parsedUser);

        const accessToken =
          localStorage.getItem(
            'accessToken',
          );

        if (accessToken) {
          void getCart(accessToken)
            .then((cart) => {
              if (active) {
                setCartItemCount(
                  getCartItemCount(cart),
                );
              }
            })
            .catch(() => {
              if (active) {
                setCartItemCount(0);
              }
            });
        }
      } catch {
        localStorage.removeItem(
          'user',
        );

        localStorage.removeItem(
          'accessToken',
        );
      }
    }, 0);

    // Hủy timer/listener để không cập nhật state sau khi header unmount.
    return () => {
      active = false;
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdated,
      );

      window.removeEventListener(
        AUTH_USER_UPDATED_EVENT,
        handleUserUpdated,
      );
    };
  }, []);

  // Xác định mục điều hướng đang active, xử lý riêng đường dẫn trang chủ.
  function isActive(
    href: string,
  ) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(
      href,
    );
  }

  // Chỉ hiện mục "Đơn hàng" sau khi xác định user đã đăng nhập.
  const visibleNavItems = user
    ? [
        ...navItems,
        { label: 'Đơn hàng', href: '/orders' },
      ]
    : navItems;

  return (
    <>
      {/* Cao hơn dropdown checkout/Leaflet nhưng vẫn thấp hơn overlay và modal. */}
      <header className="fixed inset-x-0 top-0 z-[1000] border-b border-[#E9E1D8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Kippora - Trang chủ"
            className="flex shrink-0 items-center"
          >
            <BrandLogo
              variant="wordmark"
              priority
              sizes="(max-width: 640px) 128px, 150px"
              className="h-auto w-32 sm:w-[150px]"
            />
          </Link>
  
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-[#F3E9DE] text-[#4A2C20]'
                    : 'text-[#5E5650] hover:bg-[#FAF8F5] hover:text-[#4A2C20]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
  
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}

            <Link
              href="/cart"
              title="Giỏ hàng"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#4A2C20] transition hover:bg-[#F3E9DE]"
            >
              <ShoppingCart size={20} />
  
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9894B] px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartItemCount > 99
                    ? '99+'
                    : cartItemCount}
                </span>
              )}
            </Link>
  
            {user ? (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-2 sm:flex"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E9DE] bg-cover bg-center text-[#4A2C20]"
                  style={
                    user.avatarUrl
                      ? {
                          backgroundImage:
                            `url("${user.avatarUrl}")`,
                        }
                      : undefined
                  }
                >
                  {!user.avatarUrl && (
                    <UserRound size={17} />
                  )}
                </div>
  
                <span className="max-w-[130px] truncate text-sm font-semibold text-[#1F1B18]">
                  {user.fullName ||
                    user.email}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-xl bg-[#4A2C20] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#382118] sm:flex"
              >
                <LogIn size={17} />
  
                Đăng nhập
              </Link>
            )}
  
            <button
              type="button"
              aria-label="Mở menu"
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#4A2C20] transition hover:bg-[#F3E9DE] md:hidden"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>
  
      {/* Overlay mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[9998] h-dvh w-screen bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed right-0 top-0 z-[9999] flex h-dvh w-[84vw] max-w-[350px] flex-col border-l border-[#E9E1D8] bg-[#FFFDFC] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen
            ? 'translate-x-0'
            : 'translate-x-full'
        }`}
      >
        <div className="border-b border-[#E9E1D8] bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() =>
                setMobileOpen(false)
              }
              aria-label="Kippora - Trang chủ"
              className="flex items-center"
            >
              <BrandLogo
                variant="wordmark"
                sizes="145px"
                className="h-auto w-[145px]"
              />
            </Link>

            <button
              type="button"
              aria-label="Đóng menu"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E9DE] text-[#4A2C20] transition hover:bg-[#EADBCB]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-5">
          {visibleNavItems.map((item) => {
            const active =
              isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#4A2C20] text-white shadow-sm'
                    : 'text-[#5E5650] hover:bg-[#F3E9DE] hover:text-[#4A2C20]'
                }`}
              >
                <span>
                  {item.label}
                </span>

                <span
                  className={`text-xs transition ${
                    active
                      ? 'text-white/70'
                      : 'text-[#B2A69E] group-hover:text-[#4A2C20]'
                  }`}
                >
                  →
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E9E1D8] bg-white p-5">
          {user ? (
            <Link
              href="/profile"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center gap-3 rounded-2xl bg-[#F7F2EC] p-3 transition hover:bg-[#F3E9DE]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EADBCB] bg-cover bg-center text-[#4A2C20]"
                style={
                  user.avatarUrl
                    ? {
                        backgroundImage:
                          `url("${user.avatarUrl}")`,
                      }
                    : undefined
                }
              >
                {!user.avatarUrl && (
                  <UserRound size={18} />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2A211D]">
                  {user.fullName ||
                    user.email}
                </p>

                <p className="text-xs text-[#8A817B]">
                  Tài khoản của tôi
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#4A2C20] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#382118]"
            >
              <LogIn size={17} />

              Đăng nhập
            </Link>
          )}

          <p className="mt-4 text-center text-[11px] text-[#A0968F]">
            Kippora · 2026
          </p>
        </div>
      </aside>
    </>
  );
}