import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken, requireAdmin } from "@/lib/auth";
import { getUsers, getUserById, updateUser, createUser, deleteUser, getUserByUsername } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";

function getUser(req: NextRequest): { userId: number; username: string; role: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json(await getUsers());
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await req.json();
  const { username, password, role } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  // 检查用户名是否已存在
  const existing = await getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  // 创建用户（bcrypt 加密存储）
  const password_hash = hashPassword(password);
  const newUser = await createUser(username, password_hash, role || "user");

  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await req.json();
  const { id, userId, password, newPassword } = body;
  const targetUserId = userId || id;
  const targetNewPassword = newPassword || password;

  if (!targetUserId || !targetNewPassword) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  // 验证目标用户存在
  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // 更新密码（bcrypt 加密存储）
  const password_hash = hashPassword(targetNewPassword);
  await updateUser(targetUserId, { password_hash });

  return NextResponse.json({ success: true, message: "密码修改成功" });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
  }

  // 不能删除自己
  if (Number(id) === Number(user!.userId)) {
    return NextResponse.json({ error: "不能删除自己的账号" }, { status: 400 });
  }

  // 检查目标用户是否存在
  const targetUser = await getUserById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // 不允许删除 admin 账号（超級管理員保护）
  if (targetUser.username === "admin") {
    return NextResponse.json({ error: "不能删除超级管理员" }, { status: 403 });
  }

  await deleteUser(id);
  return NextResponse.json({ success: true, message: "用户已删除" });
}
