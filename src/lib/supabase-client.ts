import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 前端可用：publishable key 公开，受 RLS 限制，仅能读取公开数据（published 产品等）。
// 写操作请走 Next.js API 路由，使用 supabase-server 中的 getSupabaseAdmin()。
// 懒加载：避免构建时环境变量缺失导致报错
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    }
    _client = createClient(supabaseUrl, publishableKey);
  }
  return _client;
}
