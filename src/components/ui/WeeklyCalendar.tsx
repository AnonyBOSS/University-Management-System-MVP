"use client";

import { useMemo } from "react";

interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  day: number;       // 0=Mon, 1=Tue, ..., 6=Sun
  color?: string;
}

interface WeeklyCalendarProps {
  blocks: TimeBlock[];
  startHour?: number;
  endHour?: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLORS = [
  "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800",
  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function WeeklyCalendar({ blocks, startHour = 8, endHour = 18 }: WeeklyCalendarProps) {
  const totalMinutes = (endHour - startHour) * 60;
  const hours = useMemo(() => {
    const arr = [];
    for (let h = startHour; h < endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  // Assign colors to unique titles
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueTitles = [...new Set(blocks.map((b) => b.title))];
    uniqueTitles.forEach((title, i) => {
      map.set(title, COLORS[i % COLORS.length]);
    });
    return map;
  }, [blocks]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-150">
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-surface-200 dark:bg-surface-700 rounded-t-xl overflow-hidden">
          <div className="bg-surface-50 dark:bg-surface-800 p-2" />
          {DAYS.map((day) => (
            <div key={day} className="bg-surface-50 dark:bg-surface-800 p-3 text-center text-sm font-semibold text-surface-700 dark:text-surface-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div
          className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-surface-200 dark:bg-surface-700 rounded-b-xl overflow-hidden"
          style={{ height: `${hours.length * 48}px` }}
        >
          {/* Time labels + day grid */}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="bg-white dark:bg-surface-800 px-2 h-12 flex items-center justify-end">
                <span className="text-[10px] text-surface-400">{hour.toString().padStart(2, "0")}:00</span>
              </div>
              {DAYS.map((_, dayIndex) => (
                <div key={`${hour}-${dayIndex}`} className="bg-white dark:bg-surface-800 h-12 relative border-t border-surface-100 dark:border-surface-700" />
              ))}
            </div>
          ))}

          {/* Event overlays */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-[60px_repeat(7,1fr)] gap-px">
            <div />
            {DAYS.map((_, dayIndex) => (
              <div key={dayIndex} className="relative">
                {blocks
                  .filter((b) => b.day === dayIndex)
                  .map((block) => {
                    const startMin = timeToMinutes(block.startTime) - startHour * 60;
                    const endMin = timeToMinutes(block.endTime) - startHour * 60;
                    const top = (startMin / totalMinutes) * 100;
                    const height = ((endMin - startMin) / totalMinutes) * 100;
                    const colorClass = block.color || colorMap.get(block.title) || COLORS[0];

                    return (
                      <div
                        key={block.id}
                        className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-0.5 overflow-hidden ${colorClass}`}
                        style={{ top: `${top}%`, height: `${height}%`, minHeight: "20px" }}
                      >
                        <p className="text-[10px] font-semibold truncate">{block.title}</p>
                        <p className="text-[9px] opacity-70 truncate">{block.startTime}–{block.endTime}</p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
