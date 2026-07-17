import { redirect } from "next/navigation";

// /admin → /admin/data 自动跳转
export default function AdminPage() {
  redirect("/admin/data");
}
