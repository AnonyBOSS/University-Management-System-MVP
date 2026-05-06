import { getAnnouncements } from "@/actions/announcements";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements — UniManage",
  description: "University announcements and updates",
};

export default async function AnnouncementsPage() {
  const { data: announcements } = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Announcements</h1>
        <p className="text-surface-500 mt-1">Latest news and updates from the university.</p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-white">{a.title}</h3>
                  <p className="text-surface-600 dark:text-surface-300 mt-2 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                  <p className="text-xs text-surface-400 mt-3">
                    Posted by {a.author?.full_name} • {formatDateTime(a.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-surface-400">No announcements yet.</p>
        </Card>
      )}
    </div>
  );
}
