import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "block w-full rounded-lg border border-surface-300 dark:border-surface-600 px-3.5 py-2.5",
          "text-surface-800 dark:text-surface-200 placeholder:text-surface-400 bg-white dark:bg-surface-800",
          "transition-colors duration-200",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          error && "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20",
          "disabled:bg-surface-50 dark:disabled:bg-surface-900 disabled:text-surface-400",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
}
