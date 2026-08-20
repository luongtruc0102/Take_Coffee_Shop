import type {
    CreateVoucherInput,
    UpdateVoucherInput,
    Voucher,
    CheckoutVoucher,
  } from '@/types/voucher';
  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        'Thiếu NEXT_PUBLIC_API_URL',
      );
    }
  
    return API_URL;
  }
  
  function getHeaders(
    accessToken: string,
  ) {
    return {
      'Content-Type':
        'application/json',
  
      Authorization:
        `Bearer ${accessToken}`,
    };
  }
  
  export async function getAdminVouchers(
    accessToken: string,
  ): Promise<Voucher[]> {
    const response = await fetch(
      `${getApiUrl()}/vouchers`,
      {
        headers:
          getHeaders(accessToken),
  
        cache: 'no-store',
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải voucher',
      );
    }
  
    return data;
  }
  
  export async function createVoucher(
    accessToken: string,
    input: CreateVoucherInput,
  ): Promise<Voucher> {
    const response = await fetch(
      `${getApiUrl()}/vouchers`,
      {
        method: 'POST',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify(input),
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ||
              'Không thể tạo voucher',
      );
    }
  
    return data;
  }
  
  export async function updateVoucher(
    accessToken: string,
    voucherId: number,
    input: UpdateVoucherInput,
  ): Promise<Voucher> {
    const response = await fetch(
      `${getApiUrl()}/vouchers/${voucherId}`,
      {
        method: 'PATCH',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify(input),
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ||
              'Không thể cập nhật voucher',
      );
    }
  
    return data;
  }
  
  export async function updateVoucherStatus(
    accessToken: string,
    voucherId: number,
    isActive: boolean,
  ): Promise<Voucher> {
    const response = await fetch(
      `${getApiUrl()}/vouchers/${voucherId}/status`,
      {
        method: 'PATCH',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify({
          isActive,
        }),
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể cập nhật trạng thái voucher',
      );
    }
  
    return data;
  }

  export async function getCheckoutVouchers(
    accessToken: string,
    subtotal: number,
  ): Promise<CheckoutVoucher[]> {
    const response = await fetch(
      `${getApiUrl()}/vouchers/available/checkout?subtotal=${encodeURIComponent(subtotal)}`,
      {
        headers: getHeaders(accessToken),
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải voucher',
      );
    }

    return data;
  }
