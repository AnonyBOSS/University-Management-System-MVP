"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { createAssignment } from "@/actions/assignments";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface CreateAssignmentButtonProps {
  courses: { id: string; title: string; code: string }[];
}

// Compute a safe minimum due date (now) once at module load time
const MODULE_MIN_DUE_DATE = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 16);

export function CreateAssignmentButton({ courses }: CreateAssignmentButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const minDueDate = MODULE_MIN_DUE_DATE;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createAssignment(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      addToast("Assignment created successfully.", "success");
      router.refresh();
    }
    setIsLoading(false);
  };

  if (courses.length === 0) return null;

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        New Assignment
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Assignment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
          )}
          <Select
            id="course_id"
            name="course_id"
            label="Course"
            options={courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` }))}
            required
          />
          <Input id="title" name="title" label="Assignment Title" placeholder="e.g., Homework 1" required />
          <Textarea id="description" name="description" label="Description" placeholder="Describe the assignment..." rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="due_date" name="due_date" type="datetime-local" label="Due Date" min={minDueDate} required />
            <Input id="max_score" name="max_score" type="number" min={0} label="Max Score" defaultValue="100" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
