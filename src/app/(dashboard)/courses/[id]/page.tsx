import { getCourse } from "@/actions/courses";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EnrollButton } from "@/components/courses/EnrollButton";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: course }, user] = await Promise.all([
    getCourse(id),
    getCurrentUser(),
  ]);

  if (!course || !user) notFound();

  // Check enrollment status for students
  let enrollmentStatus: string | null = null;
  if (user.role === "student") {
    const supabase = await createClient();
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("status")
      .eq("student_id", user.id)
      .eq("course_id", id)
      .single();
    enrollmentStatus = enrollment?.status || null;
  }

  const isFull = (course.enrollment_count || 0) >= course.max_capacity;

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Courses
      </Link>

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={course.type === "core" ? "primary" : "success"}>{course.type}</Badge>
              <span className="text-sm text-surface-400 font-mono">{course.code}</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900">{course.title}</h1>
          </div>

          {/* Enrollment action for students */}
          {user.role === "student" && (
            <EnrollButton
              courseId={course.id}
              enrollmentStatus={enrollmentStatus}
              isFull={isFull}
            />
          )}
        </div>

        {course.description && (
          <p className="mt-4 text-surface-600 leading-relaxed">{course.description}</p>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-surface-50">
            <p className="text-xs text-surface-400 mb-1">Professor</p>
            <p className="font-medium text-surface-800">{course.professor?.full_name || "TBA"}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-50">
            <p className="text-xs text-surface-400 mb-1">Schedule</p>
            <p className="font-medium text-surface-800">{course.schedule || "TBA"}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-50">
            <p className="text-xs text-surface-400 mb-1">Enrollment</p>
            <p className="font-medium text-surface-800">{course.enrollment_count}/{course.max_capacity}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-50">
            <p className="text-xs text-surface-400 mb-1">Type</p>
            <p className="font-medium text-surface-800 capitalize">{course.type}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
