import { getAssignment } from "@/actions/assignments";
import { getCurrentUser } from "@/actions/auth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Submission } from "@/lib/types/database";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubmissionForm } from "@/components/assignments/SubmissionForm";
import { GradeForm } from "@/components/assignments/GradeForm";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, { data: assignment }] = await Promise.all([
    getCurrentUser(),
    getAssignment(id),
  ]);

  if (!assignment || !user) notFound();

  const isPast = new Date(assignment.due_date) < new Date();

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: "Assignments", href: "/assignments" },
        { label: assignment.title },
      ]} />

      {/* Assignment details */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isPast ? "danger" : "primary"}>{isPast ? "Past Due" : "Active"}</Badge>
              <span className="text-sm text-surface-400">{assignment.course?.code}</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900">{assignment.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-surface-500">Due</p>
            <p className="font-medium text-surface-800">{formatDate(assignment.due_date)}</p>
          </div>
        </div>

        {assignment.description && (
          <div className="mt-4 p-4 rounded-lg bg-surface-50 text-surface-600 leading-relaxed">
            {assignment.description}
          </div>
        )}

        <div className="mt-4 flex gap-4 text-sm text-surface-500">
          <span>Max Score: <strong className="text-surface-700">{assignment.max_score}</strong></span>
          <span>Course: <strong className="text-surface-700">{assignment.course?.title}</strong></span>
        </div>
      </Card>

      {/* Student: Submission form + existing submission */}
      {user.role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>

          {assignment.submission ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-50">
                <p className="text-sm text-surface-500 mb-1">Submitted {formatDateTime(assignment.submission.submitted_at)}</p>
                <p className="text-surface-700">{assignment.submission.content || "No text content"}</p>
                {assignment.submission.file_url && (
                  <a href={assignment.submission.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    View Attachment
                  </a>
                )}
              </div>

              {/* Grade display */}
              {assignment.submission.grade && (
                <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-800">Grade</h4>
                    <Badge variant="success">{assignment.submission.grade.score}/{assignment.max_score}</Badge>
                  </div>
                  {assignment.submission.grade.feedback && (
                    <p className="text-sm text-emerald-700">{assignment.submission.grade.feedback}</p>
                  )}
                </div>
              )}

              {/* Allow re-submission if not graded */}
              {!assignment.submission.grade && !isPast && (
                <div className="border-t border-surface-200 pt-4">
                  <p className="text-sm text-surface-500 mb-3">Update your submission:</p>
                  <SubmissionForm assignmentId={assignment.id} />
                </div>
              )}
            </div>
          ) : (
            isPast ? (
              <p className="text-sm text-surface-400 py-4">This assignment is past due and can no longer be submitted.</p>
            ) : (
              <SubmissionForm assignmentId={assignment.id} />
            )
          )}
        </Card>
      )}

      {/* Professor: View all submissions + grade */}
      {user.role === "professor" && assignment.submissions && (
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions ({assignment.submissions.length})</CardTitle>
          </CardHeader>

          {assignment.submissions.length > 0 ? (
            <div className="space-y-4">
              {assignment.submissions.map((sub: Submission & { student?: { full_name: string; email: string }; grade?: { score: number; feedback: string | null } }) => (
                <div key={sub.id} className="p-4 rounded-lg border border-surface-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-surface-800">{sub.student?.full_name}</h4>
                    <span className="text-xs text-surface-400">{formatDateTime(sub.submitted_at)}</span>
                  </div>
                  <p className="text-sm text-surface-600 mb-2">{sub.content || "No text content"}</p>
                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      View Attachment
                    </a>
                  )}

                  {sub.grade ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-800">Graded: {sub.grade.score}/{assignment.max_score}</p>
                      {sub.grade.feedback && <p className="text-sm text-emerald-700 mt-1">{sub.grade.feedback}</p>}
                    </div>
                  ) : (
                    <GradeForm submissionId={sub.id} maxScore={assignment.max_score} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-4 text-center">No submissions yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}
