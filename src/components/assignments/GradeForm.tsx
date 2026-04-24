"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { gradeSubmission } from "@/actions/assignments";
import { useRouter } from "next/navigation";

interface GradeFormProps {
  submissionId: string;
  maxScore: number;
}

export function GradeForm({ submissionId, maxScore }: GradeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("submission_id", submissionId);
    const result = await gradeSubmission(formData);
    if (result?.error) setError(result.error);
    else router.refresh();
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 rounded-lg bg-surface-50 space-y-3">
      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-sm text-danger-600">{error}</div>
      )}
      <div className="flex gap-3">
        <div className="w-32">
          <Input id={`score-${submissionId}`} name="score" type="number" label="Score" min={0} max={maxScore} required />
        </div>
        <div className="flex-1">
          <Textarea id={`feedback-${submissionId}`} name="feedback" label="Feedback" placeholder="Optional feedback..." rows={2} />
        </div>
      </div>
      <Button type="submit" size="sm" isLoading={isLoading}>Submit Grade</Button>
    </form>
  );
}
