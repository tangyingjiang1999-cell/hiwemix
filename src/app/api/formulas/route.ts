import { getFormulas } from "@/lib/db-formula";
import { safeJson } from "@/lib/api-error";

// 公开读取接口：搜索页普通用户可访问（无需登录）
export async function GET() {
  return safeJson(() => getFormulas());
}
