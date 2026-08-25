"use client";

import {
  LogOut,
  PackageCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import BrandLogo from "@/components/brand/brand-logo";

type StoredUser = {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
};

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  const [user, setUser] =
    useState<StoredUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const accessToken =
        localStorage.getItem("accessToken");

      const storedUser =
        localStorage.getItem("user");

      if (!accessToken || !storedUser) {
        router.replace(
          "/login?redirect=/staff/orders",
        );
        return;
      }

      try {
        const parsedUser =
          JSON.parse(storedUser) as StoredUser;

        if (parsedUser.role !== "STAFF") {
          if (parsedUser.role === "ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/");
          }

          return;
        }

        setUser(parsedUser);
        setAuthorized(true);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.replace("/login");
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
        <p className="text-sm text-[#78866B]">
          Đang kiểm tra tài khoản nhân viên...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <header className="sticky top-0 z-40 border-b border-[#E9E1D8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/staff/orders">
              <BrandLogo
                variant="wordmark"
                priority
                sizes="140px"
                className="h-auto w-[135px]"
              />
            </Link>

            <Link
              href="/staff/orders"
              className="hidden items-center gap-2 rounded-xl bg-[#F3E9DE] px-4 py-2 text-sm font-semibold text-[#4A2C20] sm:flex"
            >
              <PackageCheck size={17} />
              Xử lý đơn hàng
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E9DE] text-[#4A2C20]">
                <UserRound size={17} />
              </span>

              <div className="max-w-40">
                <p className="truncate text-sm font-semibold text-[#2A211D]">
                  {user?.fullName || user?.email}
                </p>

                <p className="text-[11px] text-[#8A817B]">
                  Nhân viên
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6B625C] transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}