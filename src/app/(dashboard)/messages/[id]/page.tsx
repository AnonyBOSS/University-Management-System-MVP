import { getThread } from "@/actions/messages";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { getInitials } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RealtimeThread } from "@/components/messages/RealtimeThread";
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
      <Breadcrumbs items={[
        { label: "Messages", href: "/messages" },
        { label: partner.full_name },
      ]} />

      {/* Partner header */}
      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-semibold text-sm">
          {getInitials(partner.full_name)}
        </div>
        <div>
          <p className="font-medium text-surface-800 dark:text-surface-200">{partner.full_name}</p>
          <p className="text-sm text-surface-500 capitalize">{partner.role} • {partner.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
          <span className="text-xs text-surface-400">Live</span>
        </div>
      </Card>

      {/* Real-time messages */}
      <RealtimeThread
        initialMessages={messages}
        currentUserId={user.id}
        partnerId={partnerId}
        partner={partner}
      />
    </div>
  );
}
