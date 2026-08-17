'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  UnlockKeyhole,
  X,
  ChevronDown
} from 'lucide-react';

import {
  createTopping,
  getAdminToppings,
  updateTopping,
  updateToppingStatus,
} from '@/services/topping.service';

import type { Topping } from '@/types/product';
import { matchesSearch } from '@/utils/text.util';


export default function AdminToppingsPage() {
  const [toppings, setToppings] =
    useState<Topping[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingTopping,
    setEditingTopping,
  ] = useState<Topping | null>(
    null,
  );

  const [name, setName] =
    useState('');

  const [price, setPrice] =
    useState('');

    const [
    selectedStatus,
    setSelectedStatus,
    ] = useState('ALL');

  useEffect(() => {
    loadToppings();
  }, []);

  async function loadToppings() {
    try {
      setLoading(true);
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

      const data =
        await getAdminToppings(
          accessToken,
        );

      setToppings(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể tải topping',
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredToppings =
  useMemo(() => {
    return toppings.filter(
      (topping) => {
        const matchesKeyword =
          matchesSearch(
            topping.name,
            search,
          );

        const matchesStatus =
          selectedStatus === 'ALL' ||
          (selectedStatus ===
            'ACTIVE' &&
            topping.isActive) ||
          (selectedStatus ===
            'INACTIVE' &&
            !topping.isActive);

        return (
          matchesKeyword &&
          matchesStatus
        );
      },
    );
  }, [
    toppings,
    search,
    selectedStatus,
  ]);

  function formatCurrency(
    value: number | string,
  ) {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
      },
    ).format(Number(value));
  }

  function openCreate() {
    setEditingTopping(null);
    setName('');
    setPrice('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(
    topping: Topping,
  ) {
    setEditingTopping(topping);
    setName(topping.name);
    setPrice(
      String(topping.price),
    );
    setError('');
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingTopping(null);
    setName('');
    setPrice('');
  }

  async function handleSubmit(
    event: React.FormEvent,
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
        name.trim().length < 2
      ) {
        throw new Error(
          'Tên topping phải có ít nhất 2 ký tự.',
        );
      }

      const numericPrice =
        Number(price);

      if (
        Number.isNaN(
          numericPrice,
        ) ||
        numericPrice < 0
      ) {
        throw new Error(
          'Giá topping không hợp lệ.',
        );
      }

      if (editingTopping) {
        const updated =
          await updateTopping(
            accessToken,
            editingTopping.id,
            {
              name:
                name.trim(),
              price:
                numericPrice,
            },
          );

        setToppings((current) =>
          current.map((item) =>
            item.id ===
            editingTopping.id
              ? {
                  ...item,
                  ...updated,
                }
              : item,
          ),
        );
      } else {
        const created =
          await createTopping(
            accessToken,
            {
              name:
                name.trim(),
              price:
                numericPrice,
            },
          );

        setToppings((current) => [
          created,
          ...current,
        ]);
      }

      closeForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể lưu topping',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(
    topping: Topping,
  ) {
    try {
      setUpdatingId(topping.id);
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

      const updated =
        await updateToppingStatus(
          accessToken,
          topping.id,
          !topping.isActive,
        );

      // Chỉ cập nhật đúng topping vừa đổi trạng thái
      setToppings((current) =>
        current.map((item) =>
          item.id === topping.id
            ? {
                ...item,
                isActive:
                  updated.isActive,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật trạng thái topping',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#1F1B18]">
            Quản lý topping
          </h2>

          <p className="mt-1 text-[#78866B]">
            Quản lý topping và giá
            cộng thêm cho sản phẩm.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#4A2C20] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#382118]"
        >
          <Plus size={18} />
          Thêm topping
        </button>
      </div>

      {error && !formOpen && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

    <div className="rounded-2xl border border-[#E9E1D8] bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
              <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A817B]"
              />

              <input
              value={search}
              onChange={(event) =>
                  setSearch(
                  event.target.value,
                  )
              }
              placeholder="Tìm topping..."
              className="h-11 w-full rounded-xl border border-[#E9E1D8] bg-[#FAF8F5] pl-10 pr-4 text-sm outline-none transition focus:border-[#C9894B]"
              />
          </div>

          <div className="relative">
              <select
              value={selectedStatus}
              onChange={(event) =>
                  setSelectedStatus(
                  event.target.value,
                  )
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#E9E1D8] bg-white pl-4 pr-10 text-sm text-[#1F1B18] outline-none focus:border-[#C9894B]"
              >
              <option value="ALL">
                  Tất cả trạng thái
              </option>

              <option value="ACTIVE">
                  Đang hoạt động
              </option>

              <option value="INACTIVE">
                  Đã khóa
              </option>
              </select>

              <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5E5650]"
              />
          </div>
      </div>
    </div>

      <div className="overflow-hidden rounded-2xl border border-[#E9E1D8] bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-[#78866B]">
            Đang tải topping...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
                <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                </colgroup>
              <thead className="bg-[#FAF8F5]">
                <tr className="border-b border-[#E9E1D8] text-left text-xs font-semibold uppercase tracking-wide text-[#78866B]">
                  <th className="px-6 py-4">
                    Topping
                  </th>

                  <th className="px-6 py-4">
                    Giá
                  </th>

                  <th className="px-6 py-4">
                    Trạng thái
                  </th>

                  <th className="px-6 py-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredToppings.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-[#78866B]"
                    >
                      Không tìm thấy topping.
                    </td>
                  </tr>
                ) : (
                  filteredToppings.map(
                    (topping) => (
                      <tr
                        key={topping.id}
                        className="border-b border-[#F0E8E0] last:border-b-0 hover:bg-[#FCFAF7]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#1F1B18]">
                            {topping.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-semibold text-[#4A2C20]">
                          {formatCurrency(
                            topping.price,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex min-w-[100px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              topping.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {topping.isActive
                              ? 'Đang hoạt động'
                              : 'Đã khóa'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  topping,
                                )
                              }
                              title="Chỉnh sửa"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF6EC] text-[#C9894B] transition hover:bg-[#FBE8D4]"
                            >
                              <Pencil
                                size={17}
                                strokeWidth={2.2}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                topping.id
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  topping,
                                )
                              }
                              title={
                                topping.isActive
                                  ? 'Khóa topping'
                                  : 'Mở lại topping'
                              }
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-wait disabled:opacity-50 ${
                                topping.isActive
                                  ? 'bg-[#FFF1F1] text-[#C85C5C] hover:bg-[#FFE4E4]'
                                  : 'bg-[#EAF6EE] text-[#4F8A63] hover:bg-[#DDF0E3]'
                              }`}
                            >
                              {topping.isActive ? (
                                <LockKeyhole
                                  size={17}
                                />
                              ) : (
                                <UnlockKeyhole
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-sm text-[#78866B]">
          Hiển thị{' '}
          <span className="font-semibold text-[#1F1B18]">
            {filteredToppings.length}
          </span>{' '}
          / {toppings.length} topping
        </p>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#E9E1D8] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E9E1D8] px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-[#1F1B18]">
                  {editingTopping
                    ? 'Chỉnh sửa topping'
                    : 'Thêm topping'}
                </h3>

                <p className="mt-1 text-sm text-[#78866B]">
                  {editingTopping
                    ? 'Cập nhật tên và giá topping.'
                    : 'Tạo topping mới cho menu.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#78866B] hover:bg-[#FAF8F5]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
                  Tên topping
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Ví dụ: Trân châu trắng"
                  className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none focus:border-[#C9894B]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F1B18]">
                  Giá topping
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                  placeholder="Ví dụ: 10000"
                  className="h-11 w-full rounded-xl border border-[#E9E1D8] px-4 text-sm outline-none focus:border-[#C9894B]"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#F0E8E0] pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#E9E1D8] px-4 py-2.5 text-sm font-medium text-[#5E5650] hover:bg-[#FAF8F5]"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#4A2C20] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#382118] disabled:cursor-wait disabled:opacity-60"
                >
                  {saving
                    ? 'Đang lưu...'
                    : editingTopping
                      ? 'Lưu thay đổi'
                      : 'Thêm topping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}