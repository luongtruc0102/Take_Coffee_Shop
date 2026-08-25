"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import ToastMessage from "@/components/ui/toast-message";
import { login } from "@/services/auth.service";
import BrandLogo from "@/components/brand/brand-logo";

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login({
        email,
        password,
      });

      // Lưu JWT để gọi các API cần xác thực
      localStorage.setItem("accessToken", result.accessToken);

      localStorage.setItem("user", JSON.stringify(result.user));

      // Nếu có trang cần quay lại thì ưu tiên redirect
      if (redirect) {
        router.replace(redirect);
        return;
      }

      // Điều hướng theo vai trò sau khi đăng nhập
      if (result.user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      if (result.user.role === "STAFF") {
        router.replace("/staff/orders");
        return;
      }

      if (result.user.role === "USER") {
        router.replace("/");
        return;
      }

      router.replace("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#E9E1D8] bg-white p-8 shadow-sm">
        <div className="text-center">
          <BrandLogo
            variant="stackedFull"
            priority
            sizes="190px"
            className="mx-auto h-auto w-[190px]"
          />

          {/* <p className="mt-4 text-sm text-[#78866B]">
            Đăng nhập vào Kippora
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
              className="w-full rounded-xl border border-[#DDD4CA] px-4 py-3 outline-none transition focus:border-[#C9894B] focus:ring-2 focus:ring-[#C9894B]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Mật khẩu
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-[#DDD4CA] px-4 py-3 outline-none transition focus:border-[#C9894B] focus:ring-2 focus:ring-[#C9894B]/20"
            />
          </div>

          <ToastMessage message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4A2C20] px-4 py-3 font-semibold text-white transition hover:bg-[#3B2319] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#78866B]">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#C2763D] hover:text-[#9A5D2E]"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] text-sm text-[#78866B]">
          Đang tải trang đăng nhập...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
