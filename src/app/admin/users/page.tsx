"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/Toast";
import { useLang } from "@/components/LanguageContext";

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const { t } = useLang();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showToast, toastElement } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    } else if (res.status === 401) {
      router.push("/login");
    } else if (res.status === 403) {
      showToast(t.adminNoPermission);
      router.push("/");
    }
    setLoading(false);
  }, [router, showToast, t]);

  useEffect(() => {
    // 初始加载用户列表；fetchUsers 内部会 setState，属于标准数据获取模式
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  function openCreate() {
    setEditingUser(null);
    setForm({ username: "", password: "", role: "user" });
    setError("");
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({ username: user.username, password: "", role: user.role });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    const method = editingUser ? "PUT" : "POST";
    const body = editingUser
      ? { id: editingUser.id, ...form }
      : { ...form };

    if (!editingUser && !form.password) {
      setError(t.adminPasswordRequired);
      return;
    }

    const res = await fetch("/api/admin/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      fetchUsers();
    } else {
      setError(data.error || "操作失败");
    }
  }

  async function handleDelete(user: User) {
    if (user.username === "admin") {
      showToast(t.adminCannotDeleteAdmin);
      return;
    }
    if (!confirm(t.adminConfirmDelete(user.username))) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    if (res.ok) {
      fetchUsers();
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">{t.adminLoading}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SiteHeader />
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t.adminTitle}</h2>
          <button
            onClick={openCreate}
            className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold font-semibold text-white transition-colors hover:bg-[#0F766E]"
          >
            + {t.adminNewUser}
          </button>
        </div>

        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] text-gray-500 font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">{t.adminColId}</th>
                <th className="px-4 py-3">{t.adminColUsername}</th>
                <th className="px-4 py-3">{t.adminColRole}</th>
                <th className="px-4 py-3">{t.adminColCreatedAt}</th>
                <th className="px-4 py-3 text-right">{t.adminColActions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-xs text-gray-600">{user.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">{user.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium font-medium ${
                        user.role === "admin"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role === "admin" ? t.adminRoleAdmin : t.adminRoleUser}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{user.created_at}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="mr-3 text-xs text-blue-600 hover:text-blue-800"
                    >
                      {t.adminEdit}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-xs text-red-600 hover:text-red-800"
                      disabled={user.username === "admin"}
                    >
                      {t.adminDelete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastElement}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-[400px] rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              {editingUser ? t.adminEditTitle : t.adminNewUser}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">{t.adminColUsername}</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editingUser}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none disabled:bg-gray-100 focus:border-[#0D9488]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  {t.adminLabelPassword} {editingUser ? t.adminPasswordHint : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#0D9488]"
                  placeholder={editingUser ? t.adminPasswordPlaceholder : ""}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">{t.adminLabelRole}</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#0D9488]"
                >
                  <option value="user">{t.adminRoleUser}</option>
                  <option value="admin">{t.adminRoleAdmin}</option>
                </select>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border border-gray-300 px-4 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t.adminCancel}
              </button>
              <button
                onClick={handleSave}
                className="rounded bg-[#0D9488] px-4 py-2 text-xs font-semibold font-semibold text-white transition-colors hover:bg-[#0F766E]"
              >
                {editingUser ? t.adminSave : t.adminCreate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
