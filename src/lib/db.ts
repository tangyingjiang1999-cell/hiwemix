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

// ====== 本地内存存储兜底（Vercel KV 未配置时使用）======

let localNextId = 1;
const localUsers = new Map<number, UserRecord>();
const localUserByName = new Map<string, number>();
const localUserIds = new Set<string>();

function isKVAvailable(): boolean {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL);
}

// 初始化本地默认管理员
function initLocalDefaultAdmin() {
  if (localUserByName.has("admin")) return;
  const hash = bcrypt.hashSync("admin123", 10);
  const now = new Date().toISOString();
  const admin: UserRecord = {
    id: 1,
    username: "admin",
    password_hash: hash,
    role: "admin",
    created_at: now,
    updated_at: now,
  };
  localUsers.set(1, admin);
  localUserByName.set("admin", 1);
  localUserIds.add("1");
  localNextId = 2;
}

// ====== 用户 CRUD ======

// 获取所有用户
export async function getUsers(): Promise<User[]> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
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
  } catch {
    // KV 不可用时，使用本地内存存储
    if (localUserIds.size === 0) initLocalDefaultAdmin();
    const users: User[] = [];
    for (const [id, user] of localUsers) {
      const { password_hash, ...rest } = user;
      users.push(rest as User);
    }
    return users.sort((a, b) => a.id - b.id);
  }
}

// 根据用户名获取用户（含密码）
export async function getUserByUsername(
  username: string
): Promise<(User & { password_hash: string }) | null> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const id = await kv.get<string>(`users:byname:${username}`);
    if (!id) return null;
    const user = await kv.get<UserRecord>(`user:${id}`);
    if (!user) return null;
    return user;
  } catch {
    // KV 不可用时，使用本地内存存储
    if (localUserIds.size === 0) initLocalDefaultAdmin();
    const id = localUserByName.get(username);
    if (id === undefined) return null;
    return localUsers.get(id) ?? null;
  }
}

// 根据 id 获取用户
export async function getUserById(id: number): Promise<User | null> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const user = await kv.get<UserRecord>(`user:${id}`);
    if (!user) return null;
    const { password_hash, ...rest } = user;
    return rest;
  } catch {
    // KV 不可用时，使用本地内存存储
    if (localUserIds.size === 0) initLocalDefaultAdmin();
    const user = localUsers.get(id);
    if (!user) return null;
    const { password_hash, ...rest } = user;
    return rest;
  }
}

// 创建用户
export async function createUser(
  username: string,
  password_hash: string,
  role = "user"
): Promise<User> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
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
  } catch {
    // KV 不可用时，使用本地内存存储
    if (localUserIds.size === 0) initLocalDefaultAdmin();
    if (localUserByName.has(username)) {
      throw new Error("用户名已存在");
    }
    const id = localNextId++;
    const now = new Date().toISOString();
    const user: UserRecord = {
      id,
      username,
      password_hash,
      role,
      created_at: now,
      updated_at: now,
    };
    localUsers.set(id, user);
    localUserByName.set(username, id);
    localUserIds.add(String(id));
    const { password_hash: _, ...rest } = user;
    return rest;
  }
}

// 更新用户
export async function updateUser(
  id: number,
  fields: { username?: string; password_hash?: string; role?: string }
): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const user = await kv.get<UserRecord>(`user:${id}`);
    if (!user) return;
    if (fields.username) {
      await kv.del(`users:byname:${user.username}`);
      user.username = fields.username;
      await kv.set(`users:byname:${user.username}`, String(id));
    }
    if (fields.password_hash) user.password_hash = fields.password_hash;
    if (fields.role) user.role = fields.role;
    user.updated_at = new Date().toISOString();
    await kv.set(`user:${id}`, user);
  } catch {
    // KV 不可用时，使用本地内存存储
    const user = localUsers.get(id);
    if (!user) return;
    if (fields.username) {
      localUserByName.delete(user.username);
      user.username = fields.username;
      localUserByName.set(user.username, id);
    }
    if (fields.password_hash) user.password_hash = fields.password_hash;
    if (fields.role) user.role = fields.role;
    user.updated_at = new Date().toISOString();
  }
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const user = await kv.get<UserRecord>(`user:${id}`);
    if (!user || user.username === "admin") return;
    await kv.del(`users:byname:${user.username}`);
    await kv.srem("users:ids", String(id));
    await kv.del(`user:${id}`);
  } catch {
    // KV 不可用时，使用本地内存存储
    const user = localUsers.get(id);
    if (!user || user.username === "admin") return;
    localUserByName.delete(user.username);
    localUserIds.delete(String(id));
    localUsers.delete(id);
  }
}

// 初始化默认管理员
export async function initDefaultAdmin(): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const admin = await getUserByUsername("admin");
    if (!admin) {
      const hash = bcrypt.hashSync("admin123", 10);
      await createUser("admin", hash, "admin");
      console.log("✅ 默认管理员账号已创建：admin / admin123");
    }
  } catch {
    // KV 不可用时，本地兜底在 initLocalDefaultAdmin 中完成
    if (localUserIds.size === 0) {
      initLocalDefaultAdmin();
      console.log("✅ [本地模式] 默认管理员账号已创建：admin / admin123");
    }
  }
}
