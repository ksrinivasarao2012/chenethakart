"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type Kind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: Kind;
  message: string;
}

const ToastContext = createContext<{ toast: (message: string, kind?: Kind) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message: string, kind: Kind = "success") => {
      const id = Date.now() + Math.random();
      setItems((cur) => [...cur.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toast }), [toast]);

  const Icon = { success: CheckCircle2, error: XCircle, info: Info };
  const tone = { success: "text-forest", error: "text-terracotta", info: "text-brown-soft" };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6"
      >
        {items.map((t) => {
          const I = Icon[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border border-beige bg-white px-4 py-3 text-sm shadow-lift"
            >
              <I className={`mt-0.5 h-5 w-5 shrink-0 ${tone[t.kind]}`} aria-hidden />
              <span className="text-brown">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-brown-soft hover:text-brown">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}
