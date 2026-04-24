"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createBooking } from "@/actions/classrooms";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  classroomId: string;
  selectedDate: string;
}

export function BookingForm({ classroomId, selectedDate }: BookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("classroom_id", classroomId);

    const result = await createBooking(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600">Booking confirmed!</div>
      )}

      <Input id="booking_date" name="booking_date" type="date" label="Date" defaultValue={selectedDate} required />

      <div className="grid grid-cols-2 gap-4">
        <Input id="start_time" name="start_time" type="time" label="Start Time" required />
        <Input id="end_time" name="end_time" type="time" label="End Time" required />
      </div>

      <Input id="purpose" name="purpose" label="Purpose (optional)" placeholder="e.g., Study group, lecture, meeting" />

      <Button type="submit" isLoading={isLoading}>Reserve Classroom</Button>
    </form>
  );
}
