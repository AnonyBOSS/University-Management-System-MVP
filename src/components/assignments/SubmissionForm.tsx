"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { submitAssignment } from "@/actions/assignments";
import { useRouter } from "next/navigation";

interface SubmissionFormProps {
  assignmentId: string;
}

export function SubmissionForm({ assignmentId }: SubmissionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("assignment_id", assignmentId);

    const result = await submitAssignment(formData);
    if (result?.error) setError(result.error);
    else router.refresh();
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      <Textarea
        id="content"
        name="content"
        label="Your Answer"
        placeholder="Type your submission here..."
        rows={5}
      />

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Attachment (optional)
        </label>
        <input
          type="file"
          name="file"
          className="block w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Submit Assignment
      </Button>
    </form>
  );
}
