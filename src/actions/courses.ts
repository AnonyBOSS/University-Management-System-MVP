"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Fetch all courses with professor info and enrollment count.
 */
export async function getCourses(filter?: { type?: string; search?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*, professor:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (filter?.type && filter.type !== "all") {
    query = query.eq("type", filter.type);
  }

  if (filter?.search) {
    query = query.or(`title.ilike.%${filter.search}%,code.ilike.%${filter.search}%`);
  }

  const { data: courses, error } = await query;

  if (error) return { error: error.message, data: [] };

  // Get enrollment counts
  const { data: enrollmentCounts } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("status", "enrolled");

  const countMap: Record<string, number> = {};
  enrollmentCounts?.forEach((e) => {
    countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
  });

  const enrichedCourses = courses?.map((c) => ({
    ...c,
    enrollment_count: countMap[c.id] || 0,
  }));

  return { data: enrichedCourses || [], error: null };
}

/**
 * Get a single course with details.
 */
export async function getCourse(courseId: string) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*, professor:profiles(full_name, email)")
    .eq("id", courseId)
    .single();

  if (error) return { error: error.message, data: null };

  // Get enrollment count
  const { count } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("status", "enrolled");

  return {
    data: { ...course, enrollment_count: count || 0 },
    error: null,
  };
}

/**
 * Enroll current student in a course.
 */
export async function enrollInCourse(courseId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return { error: "Only students can enroll in courses." };
  }

  const supabase = await createClient();

  // Check capacity
  const { data: course } = await supabase
    .from("courses")
    .select("max_capacity")
    .eq("id", courseId)
    .single();

  const { count: currentEnrollment } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("status", "enrolled");

  if (course && currentEnrollment !== null && currentEnrollment >= course.max_capacity) {
    return { error: "This course is full." };
  }

  // Check if already enrolled (or previously dropped — re-enroll)
  const { data: existing } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    if (existing.status === "enrolled") {
      return { error: "You are already enrolled in this course." };
    }
    // Re-enroll if previously dropped
    const { error } = await supabase
      .from("enrollments")
      .update({ status: "enrolled", enrolled_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("enrollments").insert({
      student_id: user.id,
      course_id: courseId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { error: null };
}

/**
 * Drop a course (set status to 'dropped').
 */
export async function dropCourse(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "dropped" })
    .eq("student_id", user.id)
    .eq("course_id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { error: null };
}

/**
 * Admin: Create a new course.
 */
export async function createCourse(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Only admins can create courses." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("courses").insert({
    title: formData.get("title") as string,
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    professor_id: (formData.get("professor_id") as string) || null,
    max_capacity: parseInt(formData.get("max_capacity") as string) || 30,
    schedule: (formData.get("schedule") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  return { error: null };
}
