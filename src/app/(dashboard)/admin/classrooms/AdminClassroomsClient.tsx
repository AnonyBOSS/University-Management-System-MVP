"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClassroom, deleteClassroom } from "@/actions/admin";
import { useRouter } from "next/navigation";
import type { Classroom } from "@/lib/types/database";

interface AdminClassroomsClientProps {
  classrooms: Classroom[];
}

export function AdminClassroomsClient({ classrooms }: AdminClassroomsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createClassroom(formData);
    if (result?.error) setError(result.error);
    else {
      e.currentTarget.reset();
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this classroom? All bookings will be removed.")) return;
    await deleteClassroom(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Classrooms</h1>
        <p className="text-surface-500 mt-1">Add and manage university classrooms.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add New Classroom</CardTitle></CardHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input id="name" name="name" label="Room Name" placeholder="Room 101" required />
            <Input id="building" name="building" label="Building" placeholder="Science Building" required />
            <Input id="capacity" name="capacity" type="number" label="Capacity" defaultValue="30" required />
          </div>
          <Button type="submit" isLoading={isLoading}>Add Classroom</Button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Name</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Building</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Capacity</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {classrooms.map((room) => (
                <tr key={room.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{room.name}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{room.building}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{room.capacity}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {classrooms.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-surface-400">No classrooms. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
