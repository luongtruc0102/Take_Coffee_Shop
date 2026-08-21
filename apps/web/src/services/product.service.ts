import type {
    CreateProductInput,
    Product,
    UpdateProductInput,
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
      'Content-Type':
        'application/json',
  
      Authorization:
        `Bearer ${accessToken}`,
    };
  }
  
  // ADMIN lấy tất cả sản phẩm kể cả đã khóa
  export async function getAdminProducts(
    accessToken: string,
    query = '',
    signal?: AbortSignal,
  ): Promise<Product[]> {
    const searchParams =
      new URLSearchParams();

    if (query.trim()) {
      searchParams.set(
        'q',
        query.trim(),
      );
    }

    const queryString =
      searchParams.toString();
    const response = await fetch(
      `${getApiUrl()}/products/admin/all${queryString ? `?${queryString}` : ''}`,
      {
        headers:
          getHeaders(accessToken),

        cache: 'no-store',
        signal,
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải danh sách sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN tạo sản phẩm mới
  export async function createProduct(
    accessToken: string,
    input: CreateProductInput,
  ): Promise<Product> {
    const response = await fetch(
      `${getApiUrl()}/products`,
      {
        method: 'POST',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify(input),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tạo sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN cập nhật sản phẩm
  export async function updateProduct(
    accessToken: string,
    productId: number,
    input: UpdateProductInput,
  ): Promise<Product> {
    const response = await fetch(
      `${getApiUrl()}/products/${productId}`,
      {
        method: 'PATCH',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify(input),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể cập nhật sản phẩm',
      );
    }
  
    return data;
  }
  
  // ADMIN khóa hoặc mở lại sản phẩm
  export async function updateProductStatus(
    accessToken: string,
    productId: number,
    isActive: boolean,
  ): Promise<Product> {
    const response = await fetch(
      `${getApiUrl()}/products/${productId}/status`,
      {
        method: 'PATCH',
  
        headers:
          getHeaders(accessToken),
  
        body: JSON.stringify({
          isActive,
        }),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể thay đổi trạng thái sản phẩm',
      );
    }
  
    return data;
  }