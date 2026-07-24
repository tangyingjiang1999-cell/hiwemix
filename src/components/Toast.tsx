"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, onDone, duration = 2000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 300);
    }, duration);
    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onDone]);

  if (!message && !visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[2000] -translate-x-1/2">
      <div
        className={`flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-2xs font-medium text-white shadow-lg transition-all duration-300 ${
          visible && !exiting ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const dismissToast = useCallback(() => {
    setMessage(null);
  }, []);

  const toastElement = message ? (
    <Toast message={message} onDone={dismissToast} />
  ) : null;

  return { showToast, toastElement };
}
