import { getSupabaseAdmin } from "./supabase-server";

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString(),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date(row.updated_at).toISOString(),
  };
}

// ====== 用户 CRUD（统一走 Supabase，service_role 自带 BYPASSRLS）======
// 用户名统一存小写，查询端也转小写，登录时输入大小写不敏感。

export async function getUsers(): Promise<User[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("id, username, role, created_at, updated_at")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data as UserRow[]).map(rowToUser);
}

export async function getUserByUsername(
  username: string
): Promise<(User & { password_hash: string }) | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .limit(1);
  if (error) throw error;
  const row = (data as UserRow[])[0];
  return row ? { ...rowToUser(row), password_hash: row.password_hash } : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("id, username, role, created_at, updated_at")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  const row = (data as UserRow[])[0];
  return row ? rowToUser(row) : null;
}

export async function createUser(
  username: string,
  password_hash: string,
  role = "user"
): Promise<User> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .insert({ username: username.toLowerCase(), password_hash, role })
    .select("id, username, role, created_at, updated_at")
    .single();
  if (error) throw error;
  return rowToUser(data as UserRow);
}

export async function updateUser(
  id: number,
  fields: { username?: string; password_hash?: string; role?: string }
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (fields.username) update.username = fields.username.toLowerCase();
  if (fields.password_hash) update.password_hash = fields.password_hash;
  if (fields.role) update.role = fields.role;
  update.updated_at = new Date().toISOString();
  const { error } = await getSupabaseAdmin().from("users").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteUser(id: number): Promise<void> {
  const target = await getUserById(id);
  if (!target || target.username === "admin") return;
  const { error } = await getSupabaseAdmin().from("users").delete().eq("id", id);
  if (error) throw error;
}
