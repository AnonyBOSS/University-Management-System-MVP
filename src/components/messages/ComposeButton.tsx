"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { sendMessage, getRecipients } from "@/actions/messages";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types/database";

interface ComposeButtonProps {
  userRole: UserRole;
}

export function ComposeButton({ userRole }: ComposeButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<{ id: string; full_name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getRecipients().then(({ data }) => setRecipients(data));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await sendMessage(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        New Message
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Message">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
          )}
          <Select
            id="receiver_id"
            name="receiver_id"
            label={`Send to (${userRole === "student" ? "Professor" : "Student"})`}
            placeholder="Select recipient"
            options={recipients.map((r) => ({ value: r.id, label: r.full_name }))}
            required
          />
          <Input id="subject" name="subject" label="Subject" placeholder="Message subject" required />
          <Textarea id="body" name="body" label="Message" placeholder="Type your message..." rows={4} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Send</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
