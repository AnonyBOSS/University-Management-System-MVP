"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { sendMessage } from "@/actions/messages";
import { useRouter } from "next/navigation";

interface ReplyFormProps {
  receiverId: string;
}

export function ReplyForm({ receiverId }: ReplyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("receiver_id", receiverId);
    await sendMessage(formData);
    e.currentTarget.reset();
    router.refresh();
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input id="subject" name="subject" placeholder="Subject" required />
      <Textarea id="body" name="body" placeholder="Type your message..." rows={3} required />
      <Button type="submit" isLoading={isLoading}>Send Message</Button>
    </form>
  );
}
