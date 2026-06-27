"use client";

import { useEffect, useState, useCallback } from "react";

// ============================================================
// Toast Props
// ============================================================
interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

// ============================================================
// 全局 Toast 通知组件
// 用于"复制成功"等反馈，底部居中显示，自动消失
// ============================================================
export default function Toast({
  message,
  onDone,
  duration = 2000,
}: ToastProps) {
  const [entering, setEntering] = useState(false);

  // 挂载后触发进入动画
  useEffect(() => {
    requestAnimationFrame(() => setEntering(true));
  }, []);

  // 定时器自动关闭
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-300",
        "bg-[#1a1a2e]",
        entering ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      {message}
    </div>
  );
}

// ============================================================
// Toast 管理 Hook：方便任意组件使用
// ============================================================
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
