import { getSettings } from "@/lib/db-formula";
import { safeJson } from "@/lib/api-error";

// 公开读（无需登录），供 SearchPanel 加载自定义参数
export async function GET() {
  return safeJson(() => getSettings());
}
