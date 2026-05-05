"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/database";

/**
 * Update the current user's profile.
 */
export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const fullName = (formData.get("full_name") as string)?.trim();
  const roleValue = (formData.get("role") as string)?.trim();

  if (!fullName) {
    return { error: "Full name is required." };
  }

  const updateData: { full_name: string; role?: UserRole } = {
    full_name: fullName,
  };

  if (user.role === "admin" && roleValue) {
    const validRoles: UserRole[] = ["student", "professor", "admin"];
    if (!validRoles.includes(roleValue as UserRole)) {
      return { error: "Please select a valid role." };
    }
    updateData.role = roleValue as UserRole;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { error: null };
}
