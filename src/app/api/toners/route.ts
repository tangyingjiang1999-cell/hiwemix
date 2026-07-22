import { getToners } from "@/lib/db-toner";
import { safeJson } from "@/lib/api-error";

// 动态接口：每次请求直接从 Supabase 获取最新数据
// 注意：/api/admin/toners 的 POST/PUT/DELETE 操作后，客户端应重新 fetch 此接口
export async function GET() {
  return safeJson(() => getToners());
}
