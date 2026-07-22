import { getBrands } from "@/lib/db-formula";
import { safeJson } from "@/lib/api-error";

// 公开读取接口：搜索页、颜色库等普通用户均可访问（无需登录）
export async function GET() {
  return safeJson(() => getBrands());
}
