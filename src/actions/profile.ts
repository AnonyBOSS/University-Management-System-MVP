"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Update the current user's profile.
 */
export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") as string,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { error: null };
}
