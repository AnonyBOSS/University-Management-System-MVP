"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get assignments — students see their enrolled course assignments,
 * professors see assignments for their courses.
 */
export async function getAssignments() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Not authenticated." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(title, code, professor_id)")
    .order("due_date", { ascending: true });

  if (error) return { data: [], error: error.message };

  return { data: data || [], error: null };
}

/**
 * Get a single assignment with submissions.
 */
export async function getAssignment(assignmentId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Not authenticated." };

  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("*, course:courses(title, code, professor_id)")
    .eq("id", assignmentId)
    .single();

  if (error) return { data: null, error: error.message };

  // For students: get their submission
  if (user.role === "student") {
    const { data: submission } = await supabase
      .from("submissions")
      .select("*, grade:grades(*)")
      .eq("assignment_id", assignmentId)
      .eq("student_id", user.id)
      .single();

    return { data: { ...assignment, submission }, error: null };
  }

  // For professors: get all submissions
  if (user.role === "professor") {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*, student:profiles(full_name, email), grade:grades(*)")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    return { data: { ...assignment, submissions }, error: null };
  }

  return { data: assignment, error: null };
}

/**
 * Professor: Create an assignment for a course.
 */
export async function createAssignment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "professor") {
    return { error: "Only professors can create assignments." };
  }

  const supabase = await createClient();
  const dueDateValue = formData.get("due_date") as string;
  const dueDate = new Date(dueDateValue);

  if (!dueDateValue || Number.isNaN(dueDate.getTime())) {
    return { error: "Please provide a valid due date." };
  }

  if (dueDate <= new Date()) {
    return { error: "Deadline must be a future date and time." };
  }

  const maxScore = parseInt(formData.get("max_score") as string) || 100;
  if (!Number.isInteger(maxScore) || maxScore < 0) {
    return { error: "Max score must be 0 or greater." };
  }

  const { error } = await supabase.from("assignments").insert({
    course_id: formData.get("course_id") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    due_date: dueDate.toISOString(),
    max_score: maxScore,
  });

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  return { error: null };
}

/**
 * Student: Submit an assignment (text + optional file).
 */
export async function submitAssignment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return { error: "Only students can submit assignments." };
  }

  const supabase = await createClient();
  const assignmentId = formData.get("assignment_id") as string;
  const content = (formData.get("content") as string)?.trim() || "";
  const file = formData.get("file") as File | null;

  // Validate: at least content or file must be provided
  if (!content && (!file || file.size === 0)) {
    return { error: "Please provide either text content or upload a file." };
  }

  let fileUrl: string | null = null;

  // Upload file if provided
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${assignmentId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(filePath, file);

    if (uploadError) return { error: `File upload failed: ${uploadError.message}` };

    const { data: urlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(filePath);

    fileUrl = urlData.publicUrl;
  }

  // Check for existing submission
  const { data: existing } = await supabase
    .from("submissions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .single();

  if (existing) {
    // Update existing submission
    const { error } = await supabase
      .from("submissions")
      .update({
        content,
        file_url: fileUrl || undefined,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content,
      file_url: fileUrl,
    });

    if (error) return { error: error.message };
  }

  revalidatePath(`/assignments/${assignmentId}`);
  return { error: null };
}

/**
 * Professor: Grade a submission.
 */
export async function gradeSubmission(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "professor") {
    return { error: "Only professors can grade submissions." };
  }

  const supabase = await createClient();
  const submissionId = formData.get("submission_id") as string;
  const score = parseInt(formData.get("score") as string);
  const feedback = formData.get("feedback") as string;

  // Check for existing grade
  const { data: existing } = await supabase
    .from("grades")
    .select("id")
    .eq("submission_id", submissionId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("grades")
      .update({ score, feedback, graded_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("grades").insert({
      submission_id: submissionId,
      graded_by: user.id,
      score,
      feedback,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/assignments");
  return { error: null };
}
