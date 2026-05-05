"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateProfile } from "@/actions/profile";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/database";

export function SettingsClient({ user }: { user: Profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    if (result?.error) setError(result.error);
    else {
      setSuccess(true);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-600">{error}</div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600">Profile updated!</div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xl font-bold">
              {user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-surface-800 dark:text-surface-200">{user.full_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-surface-500">{user.email}</p>
                <Badge variant="primary">{user.role}</Badge>
              </div>
            </div>
          </div>

          <Input id="full_name" name="full_name" label="Full Name" defaultValue={user.full_name} required />

          {user.role === "admin" && (
            <Select
              id="role"
              name="role"
              label="Role"
              defaultValue={user.role}
              options={[
                { value: "student", label: "Student" },
                { value: "professor", label: "Professor" },
                { value: "admin", label: "Admin" },
              ]}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-500 cursor-not-allowed"
            />
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Role</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-500 capitalize cursor-not-allowed"
            />
            <p className="text-xs text-surface-400 mt-1">Contact an admin to change your role.</p>
          </div>

          <Button type="submit" isLoading={isLoading}>Save Changes</Button>
        </form>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
            <span className="text-surface-500">Member since</span>
            <span className="text-surface-800 dark:text-surface-200">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-surface-500">User ID</span>
            <span className="text-surface-400 font-mono text-xs">{user.id.slice(0, 16)}...</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
