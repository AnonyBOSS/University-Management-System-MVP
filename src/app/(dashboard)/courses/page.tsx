import { getCourses } from "@/actions/courses";
import { CourseList } from "@/components/courses/CourseList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses — UniManage",
  description: "Browse and enroll in available courses",
};

export default async function CoursesPage() {
  const { data: courses } = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Course Catalog</h1>
        <p className="text-surface-500 mt-1">Browse available courses and manage your enrollment.</p>
      </div>
      <CourseList courses={courses} />
    </div>
  );
}
