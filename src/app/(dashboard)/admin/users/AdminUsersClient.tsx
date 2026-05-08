"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { updateUserRole } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import type { Profile, UserRole } from "@/lib/types/database";

interface AdminUsersClientProps {
  users: Profile[];
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleByUserId, setRoleByUserId] = useState<Record<string, UserRole>>(
    () => Object.fromEntries(users.map((u) => [u.id, u.role]))
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const previousRole = roleByUserId[userId];

    // Optimistically reflect the selected role immediately.
    setRoleByUserId((prev) => ({ ...prev, [userId]: newRole }));
    setLoadingId(userId);
    setError(null);

    try {
      const result = await updateUserRole(userId, newRole);
      if (result?.error) {
        setError(result.error);
        setRoleByUserId((prev) => ({ ...prev, [userId]: previousRole }));
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not update role right now. Please sign in again and retry.");
      setRoleByUserId((prev) => ({ ...prev, [userId]: previousRole }));
    }

    setLoadingId(null);
  };

  const roleBadge = (role: UserRole) => {
    const variants: Record<UserRole, "primary" | "success" | "warning"> = {
      student: "primary",
      professor: "success",
      admin: "warning",
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Users</h1>
        <p className="text-surface-500 mt-1">View and manage user roles. {users.length} total users.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Name</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Email</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Role</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Joined</th>
                <th className="text-left px-6 py-3 font-medium text-surface-600 dark:text-surface-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{u.full_name}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{u.email}</td>
                  <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-surface-500">{formatDateTime(u.created_at)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={roleByUserId[u.id] ?? u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={loadingId === u.id}
                      className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="student">Student</option>
                      <option value="professor">Professor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
