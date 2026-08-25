"use client";

import { useEffect } from "react";
import { useAppToast } from "./app-toast-provider";
import type { ActionToastData } from "./action-toast";

type ToastMessageProps = {
  message: string;
  variant?: ActionToastData["variant"];
};

// Component không render giao diện; nó chỉ chuyển state thông báo sẵn có thành
// toast toàn cục để không làm dịch chuyển hoặc chiếm chỗ trong bố cục trang.
export default function ToastMessage({
  message,
  variant = "error",
}: ToastMessageProps) {
  const { showToast } = useAppToast();

  useEffect(() => {
    if (message) showToast(message, variant);
  }, [message, showToast, variant]);

  return null;
}
