import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserRecord {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// 获取所有用户
export async function getUsers(): Promise<User[]> {
  const ids = await kv.smembers("users:ids");
  if (!ids || ids.length === 0) {
    await initDefaultAdmin();
    return getUsers();
  }
  const usersRaw = await kv.mget(ids.map((id: string) => `user:${id}`));
  return (usersRaw as any[])
    .filter((u): u is UserRecord => u !== null && u !== undefined)
    .map(({ password_hash, ...u }) => u as User)
    .sort((a, b) => a.id - b.id);
}

// 根据用户名获取用户（含密码）
export async function getUserByUsername(
  username: string
): Promise<(User & { password_hash: string }) | null> {
  const id = await kv.get<string>(`users:byname:${username}`);
  if (!id) return null;
  const user = await kv.get<UserRecord>(`user:${id}`);
  if (!user) return null;
  return user;
}

// 根据 id 获取用户
export async function getUserById(id: number): Promise<User | null> {
  const user = await kv.get<UserRecord>(`user:${id}`);
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

// 创建用户
export async function createUser(
  username: string,
  password_hash: string,
  role = "user"
): Promise<User> {
  const id = await kv.incr("users:next_id");
  const now = new Date().toISOString();
  const user: UserRecord = {
    id,
    username,
    password_hash,
    role,
    created_at: now,
    updated_at: now,
  };
  await kv.set(`user:${id}`, user);
  await kv.set(`users:byname:${username}`, String(id));
  await kv.sadd("users:ids", String(id));
  const { password_hash: _, ...rest } = user;
  return rest;
}

// 更新用户
export async function updateUser(
  id: number,
  fields: { username?: string; password_hash?: string; role?: string }
): Promise<void> {
  const user = await kv.get<UserRecord>(`user:${id}`);
  if (!user) return;
  if (fields.username) {
    // 删除旧的用户名索引
    await kv.del(`users:byname:${user.username}`);
    user.username = fields.username;
    await kv.set(`users:byname:${user.username}`, String(id));
  }
  if (fields.password_hash) user.password_hash = fields.password_hash;
  if (fields.role) user.role = fields.role;
  user.updated_at = new Date().toISOString();
  await kv.set(`user:${id}`, user);
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  const user = await kv.get<UserRecord>(`user:${id}`);
  if (!user || user.username === "admin") return;
  await kv.del(`users:byname:${user.username}`);
  await kv.srem("users:ids", String(id));
  await kv.del(`user:${id}`);
}

// 初始化默认管理员
export async function initDefaultAdmin(): Promise<void> {
  const admin = await getUserByUsername("admin");
  if (!admin) {
    const hash = bcrypt.hashSync("admin123", 10);
    await createUser("admin", hash, "admin");
    console.log("✅ 默认管理员账号已创建：admin / admin123");
  }
}
