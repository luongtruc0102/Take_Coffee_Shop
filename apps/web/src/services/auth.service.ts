export type LoginPayload = {
    email: string;
    password: string;
  };
  
  export type LoginResponse = {
    accessToken: string;
    user: {
      id: number;
      email: string;
      fullName: string;
      role: string;
    };
  };
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        'Thiếu NEXT_PUBLIC_API_URL trong .env.local',
      );
    }
  
    return API_URL;
  }
  
  // Đăng nhập và lấy JWT từ backend
  export async function login(
    payload: LoginPayload,
  ): Promise<LoginResponse> {
    const response = await fetch(
      `${getApiUrl()}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || 'Đăng nhập thất bại',
      );
    }
  
    return data;
  }