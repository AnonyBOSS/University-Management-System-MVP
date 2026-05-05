"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get all conversations (grouped by the other user).
 */
export async function getConversations() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Not authenticated." };

  const supabase = await createClient();

  // Get all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(full_name, email, role), receiver:profiles!receiver_id(full_name, email, role)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Group by conversation partner
  const conversationMap = new Map<string, {
    partnerId: string;
    partnerName: string;
    partnerRole: string;
    lastMessage: typeof messages[0];
    unreadCount: number;
  }>();

  messages?.forEach((msg) => {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        partnerName: partner?.full_name || "Unknown",
        partnerRole: partner?.role || "student",
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    // Count unread messages from this partner
    if (msg.receiver_id === user.id && !msg.is_read) {
      const conv = conversationMap.get(partnerId)!;
      conv.unreadCount++;
    }
  });

  return { data: Array.from(conversationMap.values()), error: null };
}

/**
 * Get messages in a conversation with a specific user.
 */
export async function getThread(partnerId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Not authenticated." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(full_name, role)")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return { data: data || [], error: null };
}

/**
 * Send a message.
 */
export async function sendMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const supabase = await createClient();

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: formData.get("receiver_id") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
    parent_id: (formData.get("parent_id") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/messages");
  return { error: null };
}

/**
 * Get potential message recipients.
 */
export async function getRecipients() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Not authenticated." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .neq("id", user.id)
    .order("full_name");

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}
