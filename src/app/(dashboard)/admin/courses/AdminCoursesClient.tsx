"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { createCourse, updateCourse, deleteCourse } from "@/actions/courses";
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
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = editingCourse ? await updateCourse(editingCourse.id, formData) : await createCourse(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsModalOpen(false);
      setEditingCourse(null);
      router.refresh();
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete ${course.code}? This removes the course and its related records.`)) return;
    setError(null);
    const result = await deleteCourse(course.id);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Courses</h1>
          <p className="text-surface-500 mt-1">Add, edit, and manage university courses.</p>
        </div>
        <Button onClick={openCreateModal}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Course
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Code</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Title</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Type</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Professor</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Capacity</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Schedule</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <td className="px-6 py-4 font-mono text-surface-600 dark:text-surface-400">{course.code}</td>
                  <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{course.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant={course.type === "core" ? "primary" : "success"}>{course.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{course.professor?.full_name || "TBA"}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{course.max_capacity}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{course.schedule || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        className="rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course)}
                        className="rounded-lg border border-danger-200 dark:border-danger-500/30 px-3 py-1.5 text-xs font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-400">
                    No courses yet. Click &quot;Add Course&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? "Edit Course" : "Add New Course"}
      >
        <form key={editingCourse?.id || "new"} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input id="code" name="code" label="Course Code" placeholder="CS101" defaultValue={editingCourse?.code || ""} required />
            <Select
              id="type"
              name="type"
              label="Type"
              options={[
                { value: "core", label: "Core" },
                { value: "elective", label: "Elective" },
              ]}
              defaultValue={editingCourse?.type || "core"}
            />
          </div>

          <Input id="title" name="title" label="Course Title" placeholder="Introduction to Computer Science" defaultValue={editingCourse?.title || ""} required />
          <Textarea id="description" name="description" label="Description" placeholder="Course description..." defaultValue={editingCourse?.description || ""} />

          <Select
            id="professor_id"
            name="professor_id"
            label="Professor"
            placeholder="Select a professor"
            options={professors.map((p) => ({ value: p.id, label: p.full_name }))}
            defaultValue={editingCourse?.professor_id || ""}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input id="max_capacity" name="max_capacity" label="Max Capacity" type="number" min={1} defaultValue={editingCourse?.max_capacity || 30} required />
            <Input id="schedule" name="schedule" label="Schedule" placeholder="Mon/Wed 10:00-11:30" defaultValue={editingCourse?.schedule || ""} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
