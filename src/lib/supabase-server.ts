import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 仅服务端使用：secret key 自带 BYPASSRLS，可执行写操作。
// 严禁在 "use client" 组件中 import 此模块，否则 secret key 会泄露到浏览器。
// 懒加载：避免构建时环境变量缺失导致报错
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !secretKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    }
    _client = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
