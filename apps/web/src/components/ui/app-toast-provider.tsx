"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ActionToast, { type ActionToastData } from "./action-toast";

type ToastVariant = ActionToastData["variant"];

type AppToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

export default function AppToastProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [toast, setToast] = useState<ActionToastData | null>(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const normalizedMessage = message.trim();
      if (!normalizedMessage) return;

      setToast({
        id: ++toastIdRef.current,
        message: normalizedMessage,
        variant,
      });
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AppToastContext.Provider value={value}>
      {children}
      {toast && (
        <ActionToast
          key={toast.id}
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(AppToastContext);
  if (!context) {
    throw new Error("useAppToast phải được dùng bên trong AppToastProvider");
  }
  return context;
}
