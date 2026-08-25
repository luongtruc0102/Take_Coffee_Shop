export type UserNotification = {
  id: number;
  userId: number;
  orderId: number | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationList = {
  items: UserNotification[];
  unreadCount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("Thiếu NEXT_PUBLIC_API_URL trong .env.local");
  }
  return API_URL;
}

function getHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse<T>(response: Response, fallback: string) {
  const data = await response.json();
  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
    throw new Error(message || fallback);
  }
  return data as T;
}

export async function getMyNotifications(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/notifications`, {
    headers: getHeaders(accessToken),
    cache: "no-store",
  });
  return parseResponse<NotificationList>(response, "Không thể tải thông báo");
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: number,
) {
  const response = await fetch(
    `${getApiUrl()}/notifications/${notificationId}/read`,
    { method: "PATCH", headers: getHeaders(accessToken) },
  );
  return parseResponse<UserNotification>(
    response,
    "Không thể đánh dấu thông báo",
  );
}

export async function markAllNotificationsRead(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/notifications/read-all`, {
    method: "PATCH",
    headers: getHeaders(accessToken),
  });
  return parseResponse<{ updatedCount: number; readAt: string }>(
    response,
    "Không thể đánh dấu tất cả thông báo",
  );
}
