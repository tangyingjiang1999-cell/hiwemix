import { NextRequest, NextResponse } from "next/server";
import { getDb, hashPassword } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.res) return auth.res;

  const db = getDb();
  const users = db.prepare("SELECT id, username, role, created_at, updated_at FROM users ORDER BY id").all();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.res) return auth.res;

  const { username, password, role } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  const hash = hashPassword(password);
  db.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
  ).run(username, hash, role || "user");

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.res) return auth.res;

  const { id, username, password, role } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
  }

  const db = getDb();
  const updates: string[] = [];
  const params: any[] = [];

  if (username) {
    const existing = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(username, id);
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }
    updates.push("username = ?");
    params.push(username);
  }
  if (password) {
    updates.push("password_hash = ?");
    params.push(hashPassword(password));
  }
  if (role) {
    updates.push("role = ?");
    params.push(role);
  }
  updates.push("updated_at = datetime('now', 'localtime')");
  params.push(id);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.res) return auth.res;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ? AND username != 'admin'").run(id);
  return NextResponse.json({ success: true });
}
