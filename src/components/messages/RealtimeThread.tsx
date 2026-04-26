"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { ReplyForm } from "@/components/messages/ReplyForm";
import type { Message, Profile } from "@/lib/types/database";

interface RealtimeThreadProps {
  initialMessages: Message[];
  currentUserId: string;
  partnerId: string;
  partner: Pick<Profile, "full_name" | "email" | "role">;
}

export function RealtimeThread({ initialMessages, currentUserId, partnerId }: RealtimeThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's part of this conversation
          const isRelevant =
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === partnerId) ||
            (newMsg.sender_id === partnerId && newMsg.receiver_id === currentUserId);
          if (isRelevant) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, partnerId]);

  return (
    <>
      <div className="space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${isMine ? "bg-primary-600 text-white" : "bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700"}`}>
                <p className={`text-xs font-medium mb-1 ${isMine ? "text-primary-200" : "text-surface-400"}`}>
                  {msg.subject}
                </p>
                <p className={`text-sm ${isMine ? "text-white" : "text-surface-700 dark:text-surface-300"}`}>{msg.body}</p>
                <p className={`text-xs mt-2 ${isMine ? "text-primary-300" : "text-surface-400"}`}>
                  {formatDateTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <Card>
        <ReplyForm receiverId={partnerId} />
      </Card>
    </>
  );
}
