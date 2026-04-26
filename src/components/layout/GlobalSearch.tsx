"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  type: "course" | "assignment" | "user";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setQuery("");
        setResults([]);
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened — state resets happen in the open handler
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search function
  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setIsLoading(true);

    const supabase = createClient();
    const searchResults: SearchResult[] = [];

    // Search courses
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, code")
      .or(`title.ilike.%${q}%,code.ilike.%${q}%`)
      .limit(5);

    courses?.forEach((c) =>
      searchResults.push({
        type: "course",
        id: c.id,
        title: c.title,
        subtitle: c.code,
        href: `/courses/${c.id}`,
      })
    );

    // Search assignments
    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title, course:courses(code)")
      .ilike("title", `%${q}%`)
      .limit(5);

    assignments?.forEach((a) =>
      searchResults.push({
        type: "assignment",
        id: a.id,
        title: a.title,
        subtitle: ((a.course as unknown as { code: string } | null)?.code) || "",
        href: `/assignments/${a.id}`,
      })
    );

    // Search users
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(5);

    users?.forEach((u) =>
      searchResults.push({
        type: "user",
        id: u.id,
        title: u.full_name,
        subtitle: `${u.role} • ${u.email}`,
        href: `/messages/${u.id}`,
      })
    );

    setResults(searchResults);
    setSelectedIndex(0);
    setIsLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      setIsOpen(false);
    }
  };

  const typeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "course":
        return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case "assignment":
        return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case "user":
        return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden animate-fade-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-surface-200 dark:border-surface-700">
          <svg className="w-5 h-5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search courses, assignments, people..."
            className="w-full py-4 bg-transparent text-surface-800 dark:text-surface-200 placeholder:text-surface-400 outline-none text-base"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-400 text-xs font-mono">Esc</kbd>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="py-8 text-center text-surface-400 text-sm">Searching...</div>
            ) : results.length > 0 ? (
              results.map((result, i) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => { router.push(result.href); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    i === selectedIndex
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  <span className="text-surface-400">{typeIcon(result.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-surface-400 truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-[10px] uppercase font-medium text-surface-400 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                    {result.type}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-surface-400 text-sm">No results found</div>
            )}
          </div>
        )}

        {/* Footer hint */}
        {query.length < 2 && (
          <div className="px-4 py-3 text-xs text-surface-400 text-center">
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </div>
  );
}
