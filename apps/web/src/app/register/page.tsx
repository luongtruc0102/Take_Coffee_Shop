'use client';

import Link from 'next/link';
import {
  FormEvent,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import BrandLogo from '@/components/brand/brand-logo';
import ToastMessage from '@/components/ui/toast-message';
import { useAppToast } from '@/components/ui/app-toast-provider';
import { register } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useAppToast();

  const [fullName, setFullName] =
    useState('');
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [error, setError] =
    useState('');
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');

    const normalizedName =
      fullName.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedName) {
      setError('Vui lòng nhập họ và tên');
      return;
    }

    if (password.length < 6) {
      setError(
        'Mật khẩu phải có ít nhất 6 ký tự',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Mật khẩu nhập lại không khớp',
      );
      return;
    }

    try {
      setSubmitting(true);

      await register({
        fullName: normalizedName,
        email: normalizedEmail,
        password,
      });

      showToast(
        'Đăng ký thành công. Anh có thể đăng nhập ngay.',
        'success',
      );

      router.replace('/login');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Đăng ký tài khoản thất bại',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#E9E1D8] bg-white p-8 shadow-sm">
        <BrandLogo
          variant="stackedFull"
          priority
          sizes="190px"
          className="mx-auto h-auto w-[190px]"
        />

        <h1 className="mt-5 text-center text-2xl font-bold text-[#1F1B18]">
          Tạo tài khoản
        </h1>

        <p className="mt-2 text-center text-sm text-[#78866B]">
          Đăng ký để đặt món và theo dõi đơn hàng.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Họ và tên
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-[#DDD4CA] px-4 py-3 outline-none transition focus:border-[#C9894B] focus:ring-2 focus:ring-[#C9894B]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="email@example.com"
              autoComplete="email"
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
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              minLength={6}
              required
              className="w-full rounded-xl border border-[#DDD4CA] px-4 py-3 outline-none transition focus:border-[#C9894B] focus:ring-2 focus:ring-[#C9894B]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Nhập lại mật khẩu
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              minLength={6}
              required
              className="w-full rounded-xl border border-[#DDD4CA] px-4 py-3 outline-none transition focus:border-[#C9894B] focus:ring-2 focus:ring-[#C9894B]/20"
            />
          </div>

          <ToastMessage message={error} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#4A2C20] px-4 py-3 font-semibold text-white transition hover:bg-[#3B2319] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? 'Đang đăng ký...'
              : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#78866B]">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#C2763D] hover:text-[#9A5D2E]"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}