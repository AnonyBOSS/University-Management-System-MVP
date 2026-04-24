import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grades — UniManage",
  description: "View your grades and academic performance",
};

export default async function GradesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, assignment:assignments(title, max_score, course:courses(title, code)), grade:grades(*)")
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false });

  const graded = submissions?.filter((s) => s.grade) || [];
  const avgScore = graded.length > 0
    ? Math.round(graded.reduce((sum, s) => sum + (s.grade.score / s.assignment.max_score) * 100, 0) / graded.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Grades</h1>
        <p className="text-surface-500 mt-1">Track your academic performance.</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <p className="text-primary-200 text-sm">Average Score</p>
          <p className="text-3xl font-bold mt-1">{avgScore}%</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <p className="text-emerald-100 text-sm">Graded</p>
          <p className="text-3xl font-bold mt-1">{graded.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <p className="text-amber-100 text-sm">Pending</p>
          <p className="text-3xl font-bold mt-1">{(submissions?.length || 0) - graded.length}</p>
        </Card>
      </div>

      {/* Grade table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Assignment</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Course</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Score</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {submissions?.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-surface-800">{sub.assignment?.title}</td>
                  <td className="px-6 py-4 text-surface-600">{sub.assignment?.course?.code}</td>
                  <td className="px-6 py-4">
                    {sub.grade ? (
                      <Badge variant={sub.grade.score >= sub.assignment.max_score * 0.6 ? "success" : "danger"}>
                        {sub.grade.score}/{sub.assignment.max_score}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-surface-500 max-w-xs truncate">{sub.grade?.feedback || "—"}</td>
                </tr>
              ))}
              {(!submissions || submissions.length === 0) && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-surface-400">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
