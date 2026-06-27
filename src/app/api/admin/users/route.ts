import { NextRequest, NextResponse } from "next/server";
import { getUsers, getUserByUsername, createUser, updateUser, deleteUser } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";
import { getTokenFromRequest, verifyToken, requireAuth, requireAdmin } from "@/lib/auth";

function getUser(req: NextRequest): { userId: number; username: string; role: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  const res = new NextResponse();
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { username, password, role } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  const existing = await getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  const userRecord = await createUser(username, hashPassword(password), role || "user");
  return NextResponse.json({ success: true, user: userRecord });
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id, username, password, role } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
  }

  if (username) {
    const existing = await getUserByUsername(username);
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }
  }

  const fields: any = {};
  if (username) fields.username = username;
  if (password) fields.password_hash = hashPassword(password);
  if (role) fields.role = role;

  await updateUser(id, fields);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
  }

  await deleteUser(id);
  return NextResponse.json({ success: true });
}
