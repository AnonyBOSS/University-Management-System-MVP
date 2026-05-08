import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { WeeklyCalendar } from "@/components/ui/WeeklyCalendar";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule — UniManage",
  description: "View your weekly course schedule",
};

// Parse a schedule string like "Mon/Wed 10:00-11:30" into time blocks
function parseSchedule(schedule: string, courseTitle: string, courseId: string) {
  const blocks: { id: string; title: string; startTime: string; endTime: string; day: number }[] = [];
  if (!schedule) return blocks;

  const dayMap: Record<string, number> = {
    mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
    monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6,
  };

  // Try to parse "Mon/Wed 10:00-11:30" or "Monday, Wednesday 10:00 - 11:30"
  const timeMatch = schedule.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (!timeMatch) return blocks;

  const startTime = timeMatch[1];
  const endTime = timeMatch[2];

  // Find day names in the string, including weekend abbreviations
  const lowerSchedule = schedule.toLowerCase();
  const dayPattern = /\b(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/g;
  const matchedDays = new Set<number>();
  for (const match of lowerSchedule.matchAll(dayPattern)) {
    const dayIndex = dayMap[match[1]];
    if (dayIndex !== undefined) matchedDays.add(dayIndex);
  }

  if (matchedDays.size === 0) {
    for (const [name, dayIndex] of Object.entries(dayMap)) {
      if (lowerSchedule.includes(name)) matchedDays.add(dayIndex);
    }
  }

  for (const dayIndex of matchedDays) {
      blocks.push({
        id: `${courseId}-${dayIndex}`,
        title: courseTitle,
        startTime,
        endTime,
        day: dayIndex,
      });
  }

  return blocks;
}

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  let courses: { id: string; title: string; code: string; schedule: string | null }[] = [];

  if (user.role === "student") {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course:courses(id, title, code, schedule)")
      .eq("student_id", user.id)
      .eq("status", "enrolled");
    courses = (enrollments?.map((e) => e.course).filter(Boolean) as unknown as typeof courses) || [];
  } else if (user.role === "professor") {
    const { data } = await supabase
      .from("courses")
      .select("id, title, code, schedule")
      .eq("professor_id", user.id);
    courses = data || [];
  }

  // Parse all schedules into time blocks
  const blocks = courses.flatMap((c) =>
    c.schedule ? parseSchedule(c.schedule, `${c.code} ${c.title}`, c.id) : []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Weekly Schedule</h1>
        <p className="text-surface-500 mt-1">
          {user.role === "student" ? "Your enrolled course schedule." : "Your teaching schedule."}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>This Week</CardTitle></CardHeader>
        {blocks.length > 0 ? (
          <WeeklyCalendar blocks={blocks} />
        ) : (
          <div className="py-12 text-center text-surface-400">
            <p>No schedule data available.</p>
            <p className="text-sm mt-1">Courses need a schedule in the format &quot;Mon/Wed 10:00-11:30&quot; to appear here.</p>
          </div>
        )}
      </Card>

      {/* Course list */}
      <Card>
        <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{c.code} — {c.title}</p>
                <p className="text-xs text-surface-400">{c.schedule || "No schedule set"}</p>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-4">No courses found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
