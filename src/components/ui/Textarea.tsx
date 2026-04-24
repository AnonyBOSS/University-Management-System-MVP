import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-surface-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "block w-full rounded-lg border border-surface-300 px-3.5 py-2.5",
          "text-surface-800 placeholder:text-surface-400",
          "transition-colors duration-200 resize-y min-h-[100px]",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          error && "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20",
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
