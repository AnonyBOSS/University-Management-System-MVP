import { getAssignments } from "@/actions/assignments";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CreateAssignmentButton } from "@/components/assignments/CreateAssignmentButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments — UniManage",
  description: "View and manage your assignments",
};

export default async function AssignmentsPage() {
  const [user, { data: assignments }] = await Promise.all([
    getCurrentUser(),
    getAssignments(),
  ]);

  if (!user) return null;

  const now = new Date();

  // For professors: get their courses so they can create assignments
  let professorCourses: { id: string; title: string; code: string }[] = [];
  if (user.role === "professor") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, code")
      .eq("professor_id", user.id);
    professorCourses = data || [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Assignments</h1>
          <p className="text-surface-500 mt-1">
            {user.role === "professor" ? "Manage assignments for your courses." : "View and submit your assignments."}
          </p>
        </div>
        {user.role === "professor" && <CreateAssignmentButton courses={professorCourses} />}
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {assignments.map((assignment) => {
            const isPast = new Date(assignment.due_date) < now;
            return (
              <Link key={assignment.id} href={`/assignments/${assignment.id}`}>
                <Card hover className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-surface-900 dark:text-white">{assignment.title}</h3>
                      {isPast && <Badge variant="danger">Past Due</Badge>}
                    </div>
                    <p className="text-sm text-surface-500">
                      {assignment.course?.code} — {assignment.course?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Due {formatDate(assignment.due_date)}</p>
                    <p className="text-xs text-surface-400">Max score: {assignment.max_score}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-surface-400">No assignments found.</p>
        </Card>
      )}
    </div>
  );
}
