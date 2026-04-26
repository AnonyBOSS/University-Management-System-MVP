import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
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

  // Grade distribution for chart
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  graded.forEach((s) => {
    const pct = (s.grade.score / s.assignment.max_score) * 100;
    if (pct >= 90) distribution.A++;
    else if (pct >= 80) distribution.B++;
    else if (pct >= 70) distribution.C++;
    else if (pct >= 60) distribution.D++;
    else distribution.F++;
  });
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Grades</h1>
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

      {/* Grade Distribution Chart */}
      {graded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <div className="flex items-end gap-3 h-40">
            {Object.entries(distribution).map(([grade, count]) => {
              const height = (count / maxCount) * 100;
              const colors: Record<string, string> = {
                A: "bg-emerald-500",
                B: "bg-primary-500",
                C: "bg-amber-500",
                D: "bg-orange-500",
                F: "bg-rose-500",
              };
              return (
                <div key={grade} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-surface-600 dark:text-surface-400">{count}</span>
                  <div className="w-full rounded-t-lg bg-surface-100 dark:bg-surface-700 relative" style={{ height: "100%" }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg ${colors[grade]} transition-all duration-500`}
                      style={{ height: `${height}%`, minHeight: count > 0 ? "8px" : "0" }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{grade}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-surface-400">
            <span>A: 90%+</span>
            <span>B: 80-89%</span>
            <span>C: 70-79%</span>
            <span>D: 60-69%</span>
            <span>F: &lt;60%</span>
          </div>
        </Card>
      )}

      {/* Grade table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Assignment</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Course</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Score</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {submissions?.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{sub.assignment?.title}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{sub.assignment?.course?.code}</td>
                  <td className="px-6 py-4">
                    {sub.grade ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.grade.score >= sub.assignment.max_score * 0.6 ? "success" : "danger"}>
                          {sub.grade.score}/{sub.assignment.max_score}
                        </Badge>
                        {/* Mini progress bar */}
                        <div className="w-16 h-1.5 rounded-full bg-surface-200 dark:bg-surface-700">
                          <div
                            className={`h-full rounded-full ${sub.grade.score >= sub.assignment.max_score * 0.7 ? "bg-emerald-500" : sub.grade.score >= sub.assignment.max_score * 0.5 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${(sub.grade.score / sub.assignment.max_score) * 100}%` }}
                          />
                        </div>
                      </div>
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
