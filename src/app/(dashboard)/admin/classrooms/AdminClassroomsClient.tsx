"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClassroom, updateClassroom, deleteClassroom } from "@/actions/admin";
import { useRouter } from "next/navigation";
import type { Classroom } from "@/lib/types/database";

interface AdminClassroomsClientProps {
  classrooms: Classroom[];
}

export function AdminClassroomsClient({ classrooms }: AdminClassroomsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = editingClassroom 
      ? await updateClassroom(editingClassroom.id, formData)
      : await createClassroom(formData);
    if (result?.error) setError(result.error);
    else {
      setIsModalOpen(false);
      setEditingClassroom(null);
      router.refresh();
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingClassroom(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this classroom? All bookings will be removed.")) return;
    setError(null);
    const result = await deleteClassroom(id);
    if (result?.error) setError(result.error);
    else router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Classrooms</h1>
          <p className="text-surface-500 mt-1">Add and manage university classrooms.</p>
        </div>
        <Button onClick={openCreateModal}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Classroom
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
      )}

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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="rounded-lg border border-danger-200 dark:border-danger-500/30 px-3 py-1.5 text-xs font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClassroom(null);
        }}
        title={editingClassroom ? "Edit Classroom" : "Add New Classroom"}
      >
        <form key={editingClassroom?.id || "new"} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}
          <Input
            id="name"
            name="name"
            label="Room Name"
            placeholder="Room 101"
            defaultValue={editingClassroom?.name || ""}
            required
          />
          <Input
            id="building"
            name="building"
            label="Building"
            placeholder="Science Building"
            defaultValue={editingClassroom?.building || ""}
            required
          />
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            label="Capacity"
            defaultValue={editingClassroom?.capacity || 30}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingClassroom(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingClassroom ? "Save Changes" : "Add Classroom"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
