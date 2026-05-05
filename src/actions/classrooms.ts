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
  const classroomId = formData.get("classroom_id") as string;
  const bookingDate = formData.get("booking_date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  if (!classroomId || !bookingDate || !startTime || !endTime) {
    return { error: "Please provide a room, date, start time, and end time." };
  }

  const bookingDay = new Date(`${bookingDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(bookingDay.getTime())) {
    return { error: "Please choose a valid booking date." };
  }

  if (bookingDay <= today) {
    return { error: "Booking date must be in the future." };
  }

  if (endTime <= startTime) {
    return { error: "End time must be after start time." };
  }

  const { data: conflictingBookings, error: lookupError } = await supabase
    .from("bookings")
    .select("id")
    .eq("classroom_id", classroomId)
    .eq("booking_date", bookingDate)
    .lt("start_time", endTime)
    .gt("end_time", startTime)
    .limit(1);

  if (lookupError) {
    return { error: lookupError.message };
  }

  if (conflictingBookings && conflictingBookings.length > 0) {
    return { error: "This time slot conflicts with an existing booking." };
  }

  const { error } = await supabase.from("bookings").insert({
    classroom_id: classroomId,
    booked_by: user.id,
    booking_date: bookingDate,
    start_time: startTime,
    end_time: endTime,
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
