import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 生成金属漆光泽渐变效果的样式对象 */
export function colorSwatchStyle(hex: string) {
  return {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(45deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 16%, rgba(0,0,0,0) 32%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.28) 58%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.04) 84%, rgba(0,0,0,0.08) 100%)",
  };
}

/** 安全解析 JSON 请求体，失败时返回 null */
export async function safeJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** 统一错误响应格式 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/** 统一成功响应格式 */
export function successResponse(data: unknown, status: number = 200) {
  return Response.json(data, { status });
}
