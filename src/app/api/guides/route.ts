import { getGuideCategories, getGuides } from "@/lib/db-guide";
import { safeJson } from "@/lib/api-error";

// 公开读（无需登录），供 Application Guide 页面加载
export async function GET() {
  return safeJson(async () => {
    const [categories, guides] = await Promise.all([getGuideCategories(), getGuides()]);
    return { categories, guides };
  });
}
