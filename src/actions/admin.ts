"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/database";

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

  const validRoles: UserRole[] = ["student", "professor", "admin"];
  if (!validRoles.includes(role as UserRole)) {
    return { error: "Please select a valid role." };
  }

  // Prefer service-role client for privileged updates to avoid RLS drift in deployed DB.
  // Still gated by the authenticated admin check above.
  let error: { message: string } | null = null;

  try {
    const adminSupabase = createAdminClient();
    const result = await adminSupabase
      .from("profiles")
      .update({ role: role as UserRole })
      .eq("id", userId);
    error = result.error;
  } catch {
    // Fallback to request-scoped client (RLS) if service role key is not configured.
    const supabase = await createClient();
    const result = await supabase
      .from("profiles")
      .update({ role: role as UserRole })
      .eq("id", userId);
    error = result.error;
  }

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

  const name = (formData.get("name") as string)?.trim();
  const building = (formData.get("building") as string)?.trim();
  const capacityValue = (formData.get("capacity") as string)?.trim();
  const capacity = capacityValue ? Number.parseInt(capacityValue, 10) : 30;

  if (!name || !building) {
    return { error: "Room name and building are required." };
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "Capacity must be a positive number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("classrooms").insert({
    name,
    building,
    capacity,
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

  // Remove any bookings tied to this classroom first to avoid FK constraint errors.
  const { error: bookingsError } = await supabase
    .from("bookings")
    .delete()
    .eq("classroom_id", classroomId);

  if (bookingsError) return { error: bookingsError.message };

  const { error } = await supabase
    .from("classrooms")
    .delete()
    .eq("id", classroomId);

  if (error) return { error: error.message };

  revalidatePath("/classrooms");
  revalidatePath("/admin/classrooms");
  return { error: null };
}

/**
 * Admin: Update a classroom.
 */
export async function updateClassroom(classroomId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const building = (formData.get("building") as string)?.trim();
  const capacityValue = (formData.get("capacity") as string)?.trim();
  const capacity = capacityValue ? Number.parseInt(capacityValue, 10) : 30;

  if (!name || !building) {
    return { error: "Room name and building are required." };
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "Capacity must be a positive number." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("classrooms")
    .update({ name, building, capacity })
    .eq("id", classroomId);

  if (error) return { error: error.message };

  revalidatePath("/classrooms");
  revalidatePath("/admin/classrooms");
  return { error: null };
}
