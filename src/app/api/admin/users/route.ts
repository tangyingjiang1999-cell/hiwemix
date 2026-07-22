import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { applyRateLimit, ADMIN_LIMIT } from "@/lib/rate-limit";
import { getUsers, getUserById, updateUser, createUser, deleteUser, getUserByUsername } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";
import { safeJson, errorResponse, successResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  // 管理后台限流：每分钟 60 次
  const limitRes_GET = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes_GET) return limitRes_GET;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json(await getUsers());
}

export async function POST(req: NextRequest) {
  // 管理后台限流：每分钟 60 次
  const limitRes_POST = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes_POST) return limitRes_POST;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await safeJson<{ username?: string; password?: string; role?: string }>(req);
  if (!body) {
    return errorResponse("请求格式错误");
  }
  const { username, password, role } = body;

  if (!username || !password) {
    return errorResponse("用户名和密码不能为空");
  }

  // 检查用户名是否已存在
  const existing = await getUserByUsername(username);
  if (existing) {
    return errorResponse("用户名已存在", 409);
  }

  // 创建用户（bcrypt 加密存储）
  const password_hash = hashPassword(password);
  const newUser = await createUser(username, password_hash, role || "user");

  return successResponse(newUser, 201);
}

export async function PUT(req: NextRequest) {
  // 管理后台限流：每分钟 60 次
  const limitRes_PUT = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes_PUT) return limitRes_PUT;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await safeJson<{ id?: string; userId?: string; password?: string; newPassword?: string; role?: string }>(req);
  if (!body) {
    return errorResponse("请求格式错误");
  }
  const { id, userId, password, newPassword, role } = body;
  const targetUserId = userId || id;
  const targetNewPassword = newPassword || password;

  if (!targetUserId) {
    return errorResponse("缺少必要参数");
  }

  // 验证目标用户存在
  const targetUser = await getUserById(Number(targetUserId));
  if (!targetUser) {
    return errorResponse("用户不存在", 404);
  }

  // 构建更新字段：密码和角色都可以单独或同时更新
  const fields: { password_hash?: string; role?: string } = {};
  if (targetNewPassword) {
    fields.password_hash = hashPassword(targetNewPassword);
  }
  if (role && ["admin", "user"].includes(role)) {
    fields.role = role;
  }

  if (!fields.password_hash && !fields.role) {
    return errorResponse("缺少需要更新的字段");
  }

  await updateUser(Number(targetUserId), fields);

  return successResponse({ success: true, message: "用户信息更新成功" });
}

export async function DELETE(req: NextRequest) {
  // 管理后台限流：每分钟 60 次
  const limitRes_DELETE = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes_DELETE) return limitRes_DELETE;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await safeJson<{ id?: string }>(req);
  if (!body) {
    return errorResponse("请求格式错误");
  }
  const { id } = body;

  if (!id) {
    return errorResponse("缺少用户ID");
  }

  // 不能删除自己
  if (Number(id) === Number(user!.userId)) {
    return errorResponse("不能删除自己的账号");
  }

  // 检查目标用户是否存在
  const targetUser = await getUserById(Number(id));
  if (!targetUser) {
    return errorResponse("用户不存在", 404);
  }

  // 不允许删除 admin 账号（超級管理員保护）
  if (targetUser.username === "admin") {
    return errorResponse("不能删除超级管理员", 403);
  }

  await deleteUser(Number(id));
  return successResponse({ success: true, message: "用户已删除" });
}
