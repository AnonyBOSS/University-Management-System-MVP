"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { enrollInCourse, dropCourse } from "@/actions/courses";
import { useRouter } from "next/navigation";

interface EnrollButtonProps {
  courseId: string;
  enrollmentStatus: string | null;
  isFull: boolean;
}

export function EnrollButton({ courseId, enrollmentStatus, isFull }: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setIsLoading(true);
    setError(null);
    const result = await enrollInCourse(courseId);
    if (result?.error) setError(result.error);
    else router.refresh();
    setIsLoading(false);
  };

  const handleDrop = async () => {
    if (!confirm("Are you sure you want to drop this course?")) return;
    setIsLoading(true);
    setError(null);
    const result = await dropCourse(courseId);
    if (result?.error) setError(result.error);
    else router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {enrollmentStatus === "enrolled" ? (
        <Button variant="danger" onClick={handleDrop} isLoading={isLoading}>
          Drop Course
        </Button>
      ) : (
        <Button
          onClick={handleEnroll}
          isLoading={isLoading}
          disabled={isFull}
        >
          {isFull ? "Course Full" : "Enroll"}
        </Button>
      )}
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
