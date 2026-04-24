"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get all announcements (newest first).
 */
export async function getAnnouncements() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("*, author:profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/**
 * Admin: Create an announcement.
 */
export async function createAnnouncement(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Only admins can create announcements." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("announcements").insert({
    author_id: user.id,
    title: formData.get("title") as string,
    body: formData.get("body") as string,
  });

  if (error) return { error: error.message };

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { error: null };
}

/**
 * Admin: Delete an announcement.
 */
export async function deleteAnnouncement(announcementId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Only admins can delete announcements." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) return { error: error.message };

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { error: null };
}
