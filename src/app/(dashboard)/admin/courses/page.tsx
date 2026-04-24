import { getCourses } from "@/actions/courses";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminCoursesClient } from "./AdminCoursesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Courses — UniManage",
  description: "Admin course management",
};

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const { data: courses } = await getCourses();

  // Get professors for the dropdown
  const supabase = await createClient();
  const { data: professors } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("role", "professor")
    .order("full_name");

  return <AdminCoursesClient courses={courses} professors={professors || []} />;
}
