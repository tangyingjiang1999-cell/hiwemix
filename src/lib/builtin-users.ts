// 内置用户存储（使用 globalThis 避免 HMR 重置）
// 生产环境应替换为数据库

// 声明全局类型
declare global {
  // eslint-disable-next-line no-var
  var __builtinUsers: BuiltinUser[] | undefined;
}

export interface BuiltinUser {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
}

// 首次加载时初始化，后续从 globalThis 读取（HMR 安全）
function getUsers(): BuiltinUser[] {
  if (!globalThis.__builtinUsers) {
    globalThis.__builtinUsers = [
      {
        id: 1,
        username: "admin",
        password: "admin123",
        role: "admin",
        created_at: new Date().toISOString(),
      },
    ];
  }
  return globalThis.__builtinUsers;
}

// 查找用户（按用户名）
export function findUser(username: string): BuiltinUser | undefined {
  return getUsers().find((u) => u.username === username);
}

// 查找用户（按 ID）
export function findUserById(id: number): BuiltinUser | undefined {
  return getUsers().find((u) => u.id === id);
}

// 更新密码
export function updatePassword(userId: number, newPassword: string): boolean {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return false;
  user.password = newPassword;
  return true;
}

// 获取用户列表（不含密码）
export function getUserList(): Omit<BuiltinUser, "password">[] {
  return getUsers().map(({ password, ...rest }) => rest);
}
