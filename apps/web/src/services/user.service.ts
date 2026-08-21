import type {
  AdminUser,
  CreateStaffInput,
} from '@/types/user';

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

export async function getAdminUsers(
  accessToken: string,
  query = '',
  signal?: AbortSignal,
): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());

  const url = `${getApiUrl()}/users?${params.toString()}`;

  const response = await fetch(
    url,
    {
      headers:
        getHeaders(accessToken),

      cache: 'no-store',
      signal,
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Không thể tải người dùng',
    );
  }

  return data;
}

export async function getAdminUserById(
  accessToken: string,
  userId: number,
): Promise<AdminUser> {
  const response = await fetch(
    `${getApiUrl()}/users/${userId}`,
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
        'Không thể tải thông tin người dùng',
    );
  }

  return data;
}

export async function createStaff(
  accessToken: string,
  input: CreateStaffInput,
): Promise<AdminUser> {
  const response = await fetch(
    `${getApiUrl()}/users/staff`,
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
    const message =
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;

    throw new Error(
      message ||
        'Không thể tạo nhân viên',
    );
  }

  return data;
}

export async function updateUserStatus(
  accessToken: string,
  userId: number,
  isActive: boolean,
): Promise<AdminUser> {
  const response = await fetch(
    `${getApiUrl()}/users/${userId}/status`,
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
        'Không thể cập nhật trạng thái người dùng',
    );
  }

  return data;
}