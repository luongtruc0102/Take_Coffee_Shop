'use client';

import {
  Coffee,
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

type CurrentUser = {
  id: number;
  email: string;
  fullName: string;
  role: string;
};

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
    useState<CurrentUser | null>(
      null,
    );

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        'user',
      );

    if (!storedUser) {
      return;
    }

    try {
      setUser(
        JSON.parse(
          storedUser,
        ),
      );
    } catch {
      localStorage.removeItem(
        'user',
      );

      localStorage.removeItem(
        'accessToken',
      );
    }
  }, []);

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

  return (
    <>
       <header className="sticky top-0 z-40 border-b border-[#E9E1D8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A2C20] text-white">
              <Coffee size={20} />
            </div>
  
            <div>
              <p className="text-lg font-bold text-[#4A2C20]">
                Take Coffee
              </p>
  
              <p className="hidden text-[11px] text-[#8A817B] sm:block">
                Coffee & More
              </p>
            </div>
          </Link>
  
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
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
            <Link
              href="/cart"
              title="Giỏ hàng"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#4A2C20] transition hover:bg-[#F3E9DE]"
            >
              <ShoppingCart size={20} />
  
              {/* Sau này nối số lượng thật từ Cart API */}
              <span className="absolute right-0 top-0 hidden h-4 min-w-4 items-center justify-center rounded-full bg-[#C9894B] px-1 text-[10px] font-bold text-white">
                0
              </span>
            </Link>
  
            {user ? (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-2 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E9DE] text-[#4A2C20]">
                  <UserRound size={17} />
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
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4A2C20] text-white shadow-sm">
                <Coffee size={20} />
              </div>

              <div>
                <p className="font-bold text-[#4A2C20]">
                  Take Coffee
                </p>

                <p className="mt-0.5 text-[11px] text-[#8A817B]">
                  Coffee & More
                </p>
              </div>
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
          {navItems.map((item) => {
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EADBCB] text-[#4A2C20]">
                <UserRound size={18} />
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
            Take Coffee · 2026
          </p>
        </div>
      </aside>
    </>
  );
}