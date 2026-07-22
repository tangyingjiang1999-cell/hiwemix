type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean | undefined | null } | ClassValue[];

/** 简单 Tailwind 类名拼接工具，替代 clsx */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }
  return classes.join(" ");
}

/** 生成金属漆光泽渐变效果的样式对象 */
export function colorSwatchStyle(hex: string) {
  return {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 16%, rgba(0,0,0,0) 32%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.28) 58%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.12) 84%, rgba(0,0,0,0.32) 100%)",
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
