import type {
  Category,
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

// Public: chỉ lấy danh mục đang hoạt động
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    `${getApiUrl()}/categories`,
    {
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Không thể tải danh mục',
    );
  }

  return data;
}

// ADMIN: lấy tất cả danh mục kể cả đã khóa
export async function getAdminCategories(
  accessToken: string,
): Promise<Category[]> {
  const response = await fetch(
    `${getApiUrl()}/categories/admin/all`,
    {
      headers:
        getHeaders(accessToken),

      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Không thể tải danh sách danh mục',
    );
  }

  return data;
}

export async function createCategory(
  accessToken: string,
  input: {
    name: string;
    description?: string;
  },
): Promise<Category> {
  const response = await fetch(
    `${getApiUrl()}/categories`,
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
        'Không thể tạo danh mục',
    );
  }

  return data;
}

export async function updateCategory(
  accessToken: string,
  categoryId: number,
  input: {
    name?: string;
    description?: string;
  },
): Promise<Category> {
  const response = await fetch(
    `${getApiUrl()}/categories/${categoryId}`,
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
        'Không thể cập nhật danh mục',
    );
  }

  return data;
}

export async function updateCategoryStatus(
  accessToken: string,
  categoryId: number,
  isActive: boolean,
): Promise<Category> {
  const response = await fetch(
    `${getApiUrl()}/categories/${categoryId}/status`,
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
        'Không thể thay đổi trạng thái danh mục',
    );
  }

  return data;
}