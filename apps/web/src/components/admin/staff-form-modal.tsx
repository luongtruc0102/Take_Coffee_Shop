'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

import {
  createStaff,
} from '@/services/user.service';

import type {
  AdminUser,
} from '@/types/user';

type Props = {
  open: boolean;

  onClose: () => void;

  onSaved: (
    user: AdminUser,
  ) => void;
};

export default function StaffFormModal({
  open,
  onClose,
  onSaved,
}: Props) {
  const [fullName, setFullName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  function resetForm() {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
  }

  function handleClose() {
    if (saving) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const accessToken =
        localStorage.getItem(
          'accessToken',
        );

      if (!accessToken) {
        throw new Error(
          'Không tìm thấy phiên đăng nhập.',
        );
      }

      if (
        fullName.trim().length < 2
      ) {
        throw new Error(
          'Họ tên phải có ít nhất 2 ký tự.',
        );
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        throw new Error(
          'Vui lòng nhập email.',
        );
      }

      const normalizedPhone =
        phone.trim();

      if (
        !/^[0-9]{9,11}$/.test(
          normalizedPhone,
        )
      ) {
        throw new Error(
          'Số điện thoại không hợp lệ.',
        );
      }

      if (password.length < 6) {
        throw new Error(
          'Mật khẩu phải có ít nhất 6 ký tự.',
        );
      }

      if (
        password !==
        confirmPassword
      ) {
        throw new Error(
          'Mật khẩu xác nhận không khớp.',
        );
      }

      const created =
        await createStaff(
          accessToken,
          {
            fullName:
              fullName.trim(),

            email:
              normalizedEmail,

            phone:
              normalizedPhone,

            password,
          },
        );

      onSaved(created);

      resetForm();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể tạo nhân viên',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#E9E1D8] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E9E1D8] px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-[#1F1B18]">
              Thêm nhân viên
            </h3>

            <p className="mt-1 text-sm text-[#78866B]">
              Tạo tài khoản nhân viên
              mới cho Take Coffee.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#78866B] transition hover:bg-[#FAF8F5]"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Họ và tên
            </label>

            <input
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              placeholder="Nhập họ tên nhân viên"
              className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none transition focus:border-[#C9894B]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="staff@gmail.com"
                className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none transition focus:border-[#C9894B]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
                Số điện thoại
              </label>

              <input
                inputMode="numeric"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value.replace(
                      /\D/g,
                      '',
                    ),
                  )
                }
                maxLength={11}
                placeholder="0901234567"
                className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none transition focus:border-[#C9894B]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Mật khẩu ban đầu
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Nhập mật khẩu"
                className="h-11 w-full rounded-xl border border-[#E9E1D8] pl-4 pr-11 text-sm outline-none transition focus:border-[#C9894B]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A817B]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
              Xác nhận mật khẩu
            </label>

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Nhập lại mật khẩu"
              className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none transition focus:border-[#C9894B]"
            />
          </div>

          <div className="rounded-xl bg-[#FAF8F5] px-4 py-3 text-sm text-[#78866B]">
            Tài khoản được tạo tại đây
            sẽ tự động có vai trò{' '}
            <span className="font-semibold text-[#4A2C20]">
              Nhân viên
            </span>
            .
          </div>

          <div className="flex justify-end gap-3 border-t border-[#F0E8E0] pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-[#E9E1D8] px-4 py-2.5 text-sm font-medium text-[#5E5650] transition hover:bg-[#FAF8F5]"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#4A2C20] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#382118] disabled:cursor-wait disabled:opacity-60"
            >
              {saving
                ? 'Đang tạo...'
                : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}