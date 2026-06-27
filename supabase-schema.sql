-- HAIWEN MIX 用户表
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 启用行级安全（RLS），但我们用 service role key 绕过
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 允许 service role 完全访问
CREATE POLICY "service_role_all" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- 插入默认管理员账号（密码：admin123）
INSERT INTO public.users (username, password_hash, role)
VALUES ('admin', '$2a$10$8xMxQvZCKqLZkrQqlZ0QOeHvZCGx3zHJ1N1xZ5Q6xZ0QOeHvZCG.', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 创建更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
