import { getUsers } from "@/actions/admin";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "./AdminUsersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users — UniManage",
  description: "Admin user management",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const { data: users } = await getUsers();

  return <AdminUsersClient users={users} />;
}
