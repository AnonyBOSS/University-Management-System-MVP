import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — UniManage",
  description: "Your university management dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Render dashboard based on role
  if (user.role === "student") return <StudentDashboard userId={user.id} supabase={supabase} userName={user.full_name} />;
  if (user.role === "professor") return <ProfessorDashboard userId={user.id} supabase={supabase} userName={user.full_name} />;
  return <AdminDashboard supabase={supabase} userName={user.full_name} />;
}

// ============================================================
// Student Dashboard
// ============================================================
async function StudentDashboard({ userId, supabase, userName }: { userId: string; supabase: Awaited<ReturnType<typeof createClient>>; userName: string }) {
  // Fetch enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*, professor:profiles(full_name))")
    .eq("student_id", userId)
    .eq("status", "enrolled")
    .limit(5);

  // Fetch upcoming assignments from enrolled courses
  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || [];
  const { data: assignments } = enrolledCourseIds.length > 0
    ? await supabase
        .from("assignments")
        .select("*, course:courses(title, code)")
        .in("course_id", enrolledCourseIds)
        .gte("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(5)
    : { data: [] };

  // Fetch recent announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, author:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome back, {userName.split(" ")[0]}!</h1>
        <p className="text-surface-500 mt-1">Here&apos;s what&apos;s happening in your courses.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <p className="text-primary-200 text-sm">Enrolled Courses</p>
          <p className="text-3xl font-bold mt-1">{enrollments?.length || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <p className="text-amber-100 text-sm">Upcoming Assignments</p>
          <p className="text-3xl font-bold mt-1">{assignments?.length || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <p className="text-emerald-100 text-sm">Announcements</p>
          <p className="text-3xl font-bold mt-1">{announcements?.length || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <Link href="/courses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </CardHeader>
          {enrollments && enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.map((e) => (
                <Link key={e.id} href={`/courses/${e.course_id}`} className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:-translate-y-0.5 hover:border-surface-200 hover:bg-surface-50 hover:shadow-sm dark:hover:border-surface-600 dark:hover:bg-surface-700/70 dark:hover:shadow-md">
                  <div>
                  <p className="font-medium text-surface-800 dark:text-white">{e.course?.title}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{e.course?.code} • {e.course?.professor?.full_name}</p>
                  </div>
                  <Badge variant="primary">{e.course?.type}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-4 text-center">No courses enrolled. <Link href="/courses" className="text-primary-600">Browse courses</Link></p>
          )}
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <Link href="/assignments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </CardHeader>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => (
                <Link key={a.id} href={`/assignments/${a.id}`} className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:-translate-y-0.5 hover:border-surface-200 hover:bg-surface-50 hover:shadow-sm dark:hover:border-surface-600 dark:hover:bg-surface-700/70 dark:hover:shadow-md">
                  <div>
                    <p className="font-medium text-surface-800 dark:text-white">{a.title}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{a.course?.code}</p>
                  </div>
                  <Badge variant="warning">Due {formatDate(a.due_date)}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-4 text-center">No upcoming assignments.</p>
          )}
        </Card>
      </div>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <Link href="/announcements" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </CardHeader>
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-surface-100 last:border-0 pb-4 last:pb-0">
                <h4 className="font-medium text-surface-800 dark:text-white">{a.title}</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{a.body}</p>
                <p className="text-xs text-surface-400 mt-2">{a.author?.full_name} • {formatDateTime(a.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Professor Dashboard
// ============================================================
async function ProfessorDashboard({ userId, supabase, userName }: { userId: string; supabase: Awaited<ReturnType<typeof createClient>>; userName: string }) {
  // Courses taught
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("professor_id", userId);

  // Pending submissions (ungraded)
  const courseIds = courses?.map((c) => c.id) || [];
  const { data: pendingSubmissions } = courseIds.length > 0
    ? await supabase
        .from("submissions")
        .select("*, student:profiles(full_name), assignment:assignments(title, course_id)")
        .in("assignment_id", (
          await supabase.from("assignments").select("id").in("course_id", courseIds)
        ).data?.map((a) => a.id) || [])
        .is("file_url", null)  // Simple heuristic: will improve later
        .order("submitted_at", { ascending: false })
        .limit(10)
    : { data: [] };

  // Unread messages
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome, Prof. {userName.split(" ")[0]}!</h1>
        <p className="text-surface-500 mt-1">Manage your courses and student submissions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <p className="text-primary-200 text-sm">Courses Teaching</p>
          <p className="text-3xl font-bold mt-1">{courses?.length || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <p className="text-amber-100 text-sm">Pending Reviews</p>
          <p className="text-3xl font-bold mt-1">{pendingSubmissions?.length || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <p className="text-rose-100 text-sm">Unread Messages</p>
          <p className="text-3xl font-bold mt-1">{unreadMessages || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <Link href="/courses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </CardHeader>
          {courses && courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:-translate-y-0.5 hover:border-surface-200 hover:bg-surface-50 hover:shadow-sm dark:hover:border-surface-600 dark:hover:bg-surface-700/70 dark:hover:shadow-md">
                  <div>
                    <p className="font-medium text-surface-800 dark:text-white">{c.title}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{c.code} • {c.schedule || "No schedule"}</p>
                  </div>
                  <Badge variant="primary">{c.type}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-4 text-center">No courses assigned yet.</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <Link href="/assignments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </CardHeader>
          {pendingSubmissions && pendingSubmissions.length > 0 ? (
            <div className="space-y-3">
              {pendingSubmissions.map((s) => (
                <Link key={s.id} href={`/assignments/${s.assignment_id}`} className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:-translate-y-0.5 hover:border-surface-200 hover:bg-surface-50 hover:shadow-sm dark:hover:border-surface-600 dark:hover:bg-surface-700/70 dark:hover:shadow-md">
                  <div>
                    <p className="font-medium text-surface-800 dark:text-white">{s.student?.full_name}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{s.assignment?.title}</p>
                  </div>
                  <Badge variant="warning">Needs Grading</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-4 text-center">No pending submissions.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Admin Dashboard
// ============================================================
async function AdminDashboard({ supabase, userName }: { supabase: Awaited<ReturnType<typeof createClient>>; userName: string }) {
  const { count: totalStudents } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student");
  const { count: totalProfessors } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "professor");
  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true });
  const { count: totalClassrooms } = await supabase.from("classrooms").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-surface-500 mt-1">Welcome, {userName}. System overview below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <p className="text-primary-200 text-sm">Students</p>
          <p className="text-3xl font-bold mt-1">{totalStudents || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <p className="text-emerald-100 text-sm">Professors</p>
          <p className="text-3xl font-bold mt-1">{totalProfessors || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <p className="text-amber-100 text-sm">Courses</p>
          <p className="text-3xl font-bold mt-1">{totalCourses || 0}</p>
        </Card>
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <p className="text-rose-100 text-sm">Classrooms</p>
          <p className="text-3xl font-bold mt-1">{totalClassrooms || 0}</p>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/courses" className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <p className="font-medium text-surface-800 dark:text-white">Add Course</p>
              <p className="text-xs text-surface-400">Create a new course</p>
            </div>
          </Link>
          <Link href="/admin/announcements" className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-amber-500 hover:bg-primary-50 dark:hover:bg-amber-900/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            </div>
            <div>
              <p className="font-medium text-surface-800 dark:text-white">Post Announcement</p>
              <p className="text-xs text-surface-400 dark:text-surface-300">Notify all users</p>
            </div>
          </Link>
          <Link href="/classrooms" className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-emerald-500 hover:bg-primary-50 dark:hover:bg-emerald-900/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
            </div>
            <div>
              <p className="font-medium text-surface-800 dark:text-white">Classrooms</p>
              <p className="text-xs text-surface-400 dark:text-surface-300">View & manage rooms</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
