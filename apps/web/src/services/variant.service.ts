import type {
    CreateProductVariantInput,
    ProductVariant,
    UpdateProductVariantInput,
  } from '@/types/product';
  
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
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }
  
  // ADMIN lấy tất cả variant kể cả đã khóa
  export async function getAdminProductVariants(
    accessToken: string,
    productId: number,
  ): Promise<ProductVariant[]> {
    const response = await fetch(
      `${getApiUrl()}/products/${productId}/variants/admin/all`,
      {
        headers: getHeaders(accessToken),
        cache: 'no-store',
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải size sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN tạo variant mới
  export async function createProductVariant(
    accessToken: string,
    productId: number,
    input: CreateProductVariantInput,
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${getApiUrl()}/products/${productId}/variants`,
      {
        method: 'POST',
        headers: getHeaders(accessToken),
        body: JSON.stringify(input),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tạo size sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN cập nhật variant
  export async function updateProductVariant(
    accessToken: string,
    variantId: number,
    input: UpdateProductVariantInput,
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${getApiUrl()}/product-variants/${variantId}`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
        body: JSON.stringify(input),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể cập nhật size sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN khóa hoặc mở lại variant
  export async function updateProductVariantStatus(
    accessToken: string,
    variantId: number,
    isActive: boolean,
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${getApiUrl()}/product-variants/${variantId}/status`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
        body: JSON.stringify({
          isActive,
        }),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể thay đổi trạng thái size',
      );
    }
  
    return data;
  }