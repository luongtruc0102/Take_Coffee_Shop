"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";

export type ActionToastData = {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
};

type ActionToastProps = {
  toast: ActionToastData;
  onClose: () => void;
  duration?: number;
};

const variantStyles = {
  success: {
    icon: CircleCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    borderClass: "border-emerald-100",
  },
  error: {
    icon: CircleAlert,
    iconClass: "bg-red-50 text-red-600",
    borderClass: "border-red-100",
  },
  info: {
    icon: Info,
    iconClass: "bg-[#F3E9DE] text-[#C2763D]",
    borderClass: "border-[#E9D4BF]",
  },
};

export default function ActionToast({
  toast,
  onClose,
  duration = 5000,
}: ActionToastProps) {
  const onCloseRef = useRef(onClose);
  const style = variantStyles[toast.variant];
  const Icon = style.icon;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [duration, toast.id]);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[20000] w-[min(92vw,380px)]">
      <div
        role={toast.variant === "error" ? "alert" : "status"}
        aria-live={toast.variant === "error" ? "assertive" : "polite"}
        className={`notification-toast-enter pointer-events-auto rounded-2xl border bg-white p-4 shadow-2xl ${style.borderClass}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}
          >
            <Icon size={19} />
          </span>
          <p className="min-w-0 flex-1 pt-1 text-sm leading-6 text-[#4A403A]">
            {toast.message}
          </p>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#8A817B] transition hover:bg-[#F7F2EC]"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
