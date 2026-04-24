import { getConversations } from "@/actions/messages";
import { getCurrentUser } from "@/actions/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, getInitials } from "@/lib/utils";
import Link from "next/link";
import { ComposeButton } from "@/components/messages/ComposeButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages — UniManage",
  description: "Your messages and conversations",
};

export default async function MessagesPage() {
  const [user, { data: conversations }] = await Promise.all([
    getCurrentUser(),
    getConversations(),
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Messages</h1>
          <p className="text-surface-500 mt-1">Your conversations with {user.role === "student" ? "professors" : "students"}.</p>
        </div>
        <ComposeButton userRole={user.role} />
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-2 stagger-children">
          {conversations.map((conv) => (
            <Link key={conv.partnerId} href={`/messages/${conv.partnerId}`}>
              <Card hover className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {getInitials(conv.partnerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-surface-800">{conv.partnerName}</p>
                    <Badge variant="default">{conv.partnerRole}</Badge>
                    {conv.unreadCount > 0 && (
                      <Badge variant="danger">{conv.unreadCount} new</Badge>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 truncate">{conv.lastMessage.subject}: {conv.lastMessage.body}</p>
                </div>
                <span className="text-xs text-surface-400 flex-shrink-0">
                  {formatDateTime(conv.lastMessage.created_at)}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-surface-400 mb-2">No conversations yet.</p>
          <p className="text-sm text-surface-400">Start a new conversation using the button above.</p>
        </Card>
      )}
    </div>
  );
}
