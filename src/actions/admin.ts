"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get all users (admin only).
 */
export async function getUsers() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { data: [], error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/**
 * Admin: Update a user's role.
 */
export async function updateUserRole(userId: string, role: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { error: null };
}

/**
 * Admin: Create a classroom.
 */
export async function createClassroom(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("classrooms").insert({
    name: formData.get("name") as string,
    building: formData.get("building") as string,
    capacity: parseInt(formData.get("capacity") as string) || 30,
  });

  if (error) return { error: error.message };

  revalidatePath("/classrooms");
  revalidatePath("/admin/classrooms");
  return { error: null };
}

/**
 * Admin: Delete a classroom.
 */
export async function deleteClassroom(classroomId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("classrooms")
    .delete()
    .eq("id", classroomId);

  if (error) return { error: error.message };

  revalidatePath("/classrooms");
  revalidatePath("/admin/classrooms");
  return { error: null };
}
