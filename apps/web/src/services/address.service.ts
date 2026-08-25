import type {
    CreateAddressInput,
    UpdateAddressInput,
    UserAddress,
  } from "@/types/address";
  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        "Thiếu NEXT_PUBLIC_API_URL",
      );
    }
  
    return API_URL;
  }
  
  function getHeaders(
    accessToken: string,
  ) {
    return {
      "Content-Type":
        "application/json",
  
      Authorization:
        `Bearer ${accessToken}`,
    };
  }
  
  // Đọc response dùng chung và chuẩn hóa lỗi trả về từ NestJS.
  async function readResponse<T>(
    response: Response,
    fallbackMessage: string,
  ): Promise<T> {
    const data =
      await response
        .json()
        .catch(() => null);
  
    if (!response.ok) {
      const message =
        Array.isArray(
          data?.message,
        )
          ? data.message.join(", ")
          : data?.message;
  
      throw new Error(
        message ||
          fallbackMessage,
      );
    }
  
    return data as T;
  }
  
  // Lấy toàn bộ địa chỉ của user.
  // Backend luôn sắp xếp địa chỉ mặc định lên đầu.
  export async function getMyAddresses(
    accessToken: string,
    signal?: AbortSignal,
  ): Promise<UserAddress[]> {
    const response = await fetch(
      `${getApiUrl()}/addresses`,
      {
        headers:
          getHeaders(accessToken),
  
        cache: "no-store",
        signal,
      },
    );
  
    return readResponse<
      UserAddress[]
    >(
      response,
      "Không thể tải sổ địa chỉ",
    );
  }
  
  // Thêm địa chỉ mới.
  // Địa chỉ đầu tiên sẽ được backend tự động đặt làm mặc định.
  export async function createAddress(
    accessToken: string,
    input: CreateAddressInput,
  ): Promise<UserAddress> {
    const response = await fetch(
      `${getApiUrl()}/addresses`,
      {
        method: "POST",
  
        headers:
          getHeaders(accessToken),
  
        body:
          JSON.stringify(input),
      },
    );
  
    return readResponse<UserAddress>(
      response,
      "Không thể thêm địa chỉ",
    );
  }
  
  // Chỉnh sửa thông tin của địa chỉ thuộc user hiện tại.
  export async function updateAddress(
    accessToken: string,
    addressId: number,
    input: UpdateAddressInput,
  ): Promise<UserAddress> {
    const response = await fetch(
      `${getApiUrl()}/addresses/${addressId}`,
      {
        method: "PATCH",
  
        headers:
          getHeaders(accessToken),
  
        body:
          JSON.stringify(input),
      },
    );
  
    return readResponse<UserAddress>(
      response,
      "Không thể cập nhật địa chỉ",
    );
  }
  
  // Chọn một địa chỉ làm mặc định.
  // Backend tự bỏ mặc định ở các địa chỉ còn lại.
  export async function setDefaultAddress(
    accessToken: string,
    addressId: number,
  ): Promise<UserAddress> {
    const response = await fetch(
      `${getApiUrl()}/addresses/${addressId}/default`,
      {
        method: "PATCH",
  
        headers:
          getHeaders(accessToken),
      },
    );
  
    return readResponse<UserAddress>(
      response,
      "Không thể đặt địa chỉ mặc định",
    );
  }
  
  // Xóa địa chỉ.
  // Nếu xóa địa chỉ mặc định, backend tự chọn địa chỉ thay thế.
  export async function deleteAddress(
    accessToken: string,
    addressId: number,
  ): Promise<{
    message: string;
  }> {
    const response = await fetch(
      `${getApiUrl()}/addresses/${addressId}`,
      {
        method: "DELETE",
  
        headers:
          getHeaders(accessToken),
      },
    );
  
    return readResponse<{
      message: string;
    }>(
      response,
      "Không thể xóa địa chỉ",
    );
  }