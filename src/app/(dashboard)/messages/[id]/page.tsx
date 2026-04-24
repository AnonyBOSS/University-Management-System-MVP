import { getThread } from "@/actions/messages";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatDateTime, getInitials } from "@/lib/utils";
import Link from "next/link";
import { ReplyForm } from "@/components/messages/ReplyForm";
import { notFound } from "next/navigation";

export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partnerId } = await params;
  const [user, { data: messages }] = await Promise.all([
    getCurrentUser(),
    getThread(partnerId),
  ]);

  if (!user) notFound();

  // Get partner info
  const supabase = await createClient();
  const { data: partner } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", partnerId)
    .single();

  if (!partner) notFound();

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Link href="/messages" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Messages
      </Link>

      {/* Partner header */}
      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
          {getInitials(partner.full_name)}
        </div>
        <div>
          <p className="font-medium text-surface-800">{partner.full_name}</p>
          <p className="text-sm text-surface-500 capitalize">{partner.role} • {partner.email}</p>
        </div>
      </Card>

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${isMine ? "bg-primary-600 text-white" : "bg-white border border-surface-200"}`}>
                <p className={`text-xs font-medium mb-1 ${isMine ? "text-primary-200" : "text-surface-400"}`}>
                  {msg.subject}
                </p>
                <p className={`text-sm ${isMine ? "text-white" : "text-surface-700"}`}>{msg.body}</p>
                <p className={`text-xs mt-2 ${isMine ? "text-primary-300" : "text-surface-400"}`}>
                  {formatDateTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply form */}
      <Card>
        <ReplyForm receiverId={partnerId} />
      </Card>
    </div>
  );
}
