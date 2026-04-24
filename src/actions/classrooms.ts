"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get all classrooms.
 */
export async function getClassrooms() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classrooms")
    .select("*")
    .order("building", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/**
 * Get a single classroom with its bookings for a specific date.
 */
export async function getClassroom(classroomId: string, date?: string) {
  const supabase = await createClient();

  const { data: classroom, error } = await supabase
    .from("classrooms")
    .select("*")
    .eq("id", classroomId)
    .single();

  if (error) return { data: null, error: error.message };

  // Get bookings for the specified date (default: today)
  const bookingDate = date || new Date().toISOString().split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, booker:profiles(full_name)")
    .eq("classroom_id", classroomId)
    .eq("booking_date", bookingDate)
    .order("start_time", { ascending: true });

  return {
    data: { ...classroom, bookings: bookings || [] },
    error: null,
  };
}

/**
 * Create a booking for a classroom.
 * Overlap checking is enforced by the database exclusion constraint.
 */
export async function createBooking(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const supabase = await createClient();

  const { error } = await supabase.from("bookings").insert({
    classroom_id: formData.get("classroom_id") as string,
    booked_by: user.id,
    booking_date: formData.get("booking_date") as string,
    start_time: formData.get("start_time") as string,
    end_time: formData.get("end_time") as string,
    purpose: (formData.get("purpose") as string) || null,
  });

  if (error) {
    if (error.message.includes("no_overlapping_bookings")) {
      return { error: "This time slot conflicts with an existing booking." };
    }
    return { error: error.message };
  }

  revalidatePath("/classrooms");
  return { error: null };
}

/**
 * Cancel a booking.
 */
export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("booked_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/classrooms");
  return { error: null };
}
