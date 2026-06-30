"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onDone,
  duration = 2000,
}: ToastProps) {
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntering(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-5 py-2.5 text-muji-body font-muji-500 text-white transition-all duration-300",
        "bg-[#1a1a2e]",
        entering ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      {message}
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
