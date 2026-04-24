"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { Course } from "@/lib/types/database";

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "core" | "elective">("all");

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "core", "elective"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={course.type === "core" ? "primary" : "success"}>
                  {course.type}
                </Badge>
                <span className="text-xs text-surface-400 font-mono">{course.code}</span>
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">{course.title}</h3>
              {course.description && (
                <p className="text-sm text-surface-500 line-clamp-2 mb-3">{course.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-surface-400 pt-3 border-t border-surface-100">
                <span>{course.professor?.full_name || "TBA"}</span>
                <span>{course.enrollment_count || 0}/{course.max_capacity} enrolled</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-surface-400">
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
