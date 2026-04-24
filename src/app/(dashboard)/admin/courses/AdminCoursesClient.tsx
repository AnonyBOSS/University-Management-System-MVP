"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { createCourse } from "@/actions/courses";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/types/database";

interface AdminCoursesClientProps {
  courses: Course[];
  professors: { id: string; full_name: string }[];
}

export function AdminCoursesClient({ courses, professors }: AdminCoursesClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCourse(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsModalOpen(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Manage Courses</h1>
          <p className="text-surface-500 mt-1">Add and manage university courses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Course
        </Button>
      </div>

      {/* Course table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Code</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Title</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Type</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Professor</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Capacity</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-surface-600">{course.code}</td>
                  <td className="px-6 py-4 font-medium text-surface-800">{course.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant={course.type === "core" ? "primary" : "success"}>{course.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-surface-600">{course.professor?.full_name || "TBA"}</td>
                  <td className="px-6 py-4 text-surface-600">{course.max_capacity}</td>
                  <td className="px-6 py-4 text-surface-600">{course.schedule || "—"}</td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">
                    No courses yet. Click &quot;Add Course&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Course Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Course">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input id="code" name="code" label="Course Code" placeholder="CS101" required />
            <Select
              id="type"
              name="type"
              label="Type"
              options={[
                { value: "core", label: "Core" },
                { value: "elective", label: "Elective" },
              ]}
              defaultValue="core"
            />
          </div>

          <Input id="title" name="title" label="Course Title" placeholder="Introduction to Computer Science" required />
          <Textarea id="description" name="description" label="Description" placeholder="Course description..." />

          <Select
            id="professor_id"
            name="professor_id"
            label="Professor"
            placeholder="Select a professor"
            options={professors.map((p) => ({ value: p.id, label: p.full_name }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input id="max_capacity" name="max_capacity" label="Max Capacity" type="number" defaultValue="30" />
            <Input id="schedule" name="schedule" label="Schedule" placeholder="Mon/Wed 10:00-11:30" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
