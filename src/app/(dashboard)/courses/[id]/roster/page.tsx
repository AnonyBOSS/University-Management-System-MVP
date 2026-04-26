import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Roster — UniManage",
  description: "View enrolled students in your course",
};

export default async function CourseRosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "professor") redirect("/dashboard");

  const supabase = await createClient();

  // Get the course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, code, professor_id")
    .eq("id", id)
    .single();

  if (!course || course.professor_id !== user.id) notFound();

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, student:profiles(id, full_name, email)")
    .eq("course_id", id)
    .eq("status", "enrolled")
    .order("enrolled_at", { ascending: true });

  // Get grades for each student's submissions in this course
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, max_score")
    .eq("course_id", id);

  const assignmentIds = assignments?.map((a) => a.id) || [];

  let submissions: { student_id: string; assignment_id: string; grade: { score: number }[] }[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from("submissions")
      .select("student_id, assignment_id, grade:grades(score)")
      .in("assignment_id", assignmentIds);
    submissions = (data || []) as typeof submissions;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: "Courses", href: "/courses" },
        { label: course.title, href: `/courses/${course.id}` },
        { label: "Roster" },
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{course.code} — Student Roster</h1>
        <p className="text-surface-500 mt-1">{enrollments?.length || 0} students enrolled</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">#</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Student</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Email</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Submissions</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Avg Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {enrollments?.map((e, i) => {
                const studentSubs = submissions.filter((s) => s.student_id === e.student_id);
                const gradedSubs = studentSubs.filter((s) => s.grade && s.grade.length > 0);
                const avgGrade = gradedSubs.length > 0
                  ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade[0]?.score || 0), 0) / gradedSubs.length)
                  : null;

                return (
                  <tr key={e.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <td className="px-6 py-4 text-surface-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{e.student?.full_name}</td>
                    <td className="px-6 py-4 text-surface-500">{e.student?.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={studentSubs.length === assignmentIds.length ? "success" : "warning"}>
                        {studentSubs.length} / {assignmentIds.length}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {avgGrade !== null ? (
                        <Badge variant={avgGrade >= 70 ? "success" : avgGrade >= 50 ? "warning" : "danger"}>
                          {avgGrade}%
                        </Badge>
                      ) : (
                        <span className="text-surface-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!enrollments || enrollments.length === 0) && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-400">No students enrolled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
