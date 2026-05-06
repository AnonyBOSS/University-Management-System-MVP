"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createAnnouncement, deleteAnnouncement } from "@/actions/announcements";
import { formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { Announcement } from "@/lib/types/database";

interface AdminAnnouncementsClientProps {
  announcements: Announcement[];
}

export function AdminAnnouncementsClient({ announcements }: AdminAnnouncementsClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createAnnouncement(formData);
    if (result?.error) setError(result.error);
    else {
      e.currentTarget.reset();
      addToast("Announcement published.", "success");
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    addToast("Announcement deleted.", "success");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Announcements</h1>
        <p className="text-surface-500 mt-1">Create and manage university-wide announcements.</p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader><CardTitle>Post New Announcement</CardTitle></CardHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
          )}
          <Input id="title" name="title" label="Title" placeholder="Announcement title" required />
          <Textarea id="body" name="body" label="Content" placeholder="Write your announcement..." rows={4} required />
          <Button type="submit" isLoading={isLoading}>Post Announcement</Button>
        </form>
      </Card>

      {/* Existing announcements */}
      <Card>
        <CardHeader><CardTitle>All Announcements</CardTitle></CardHeader>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start justify-between p-4 rounded-lg border border-surface-200 dark:border-surface-700">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-800 dark:text-white">{a.title}</h4>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-surface-400 mt-2">{formatDateTime(a.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="ml-3 p-2 text-surface-400 dark:text-surface-500 hover:text-danger-500 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-400 py-4 text-center">No announcements yet.</p>
        )}
      </Card>
    </div>
  );
}
