import { getClassrooms } from "@/actions/classrooms";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { AdminClassroomsClient } from "./AdminClassroomsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Classrooms — UniManage",
  description: "Admin classroom management",
};

export default async function AdminClassroomsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const { data: classrooms } = await getClassrooms();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminClassroomsClient classrooms={classrooms} />
    </div>
  );
}
