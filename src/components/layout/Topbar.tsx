"use client";

import { signOut } from "@/actions/auth";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import { useState } from "react";

interface TopbarProps {
  user: Profile;
}

export function Topbar({ user }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 backdrop-blur-md px-6">
      {/* Page area — left empty for page titles */}
      <div />

      {/* Right side — user menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-50 transition-colors"
        >
          {/* Avatar */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
            {getInitials(user.full_name)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-surface-800">{user.full_name}</p>
            <p className="text-xs text-surface-400 capitalize">{user.role}</p>
          </div>
          <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-surface-200 bg-white py-1 shadow-lg z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-surface-100">
                <p className="text-sm font-medium text-surface-800">{user.full_name}</p>
                <p className="text-xs text-surface-400">{user.email}</p>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
