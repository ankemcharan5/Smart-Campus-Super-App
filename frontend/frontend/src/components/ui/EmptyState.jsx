import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no records to display at this time.",
  actionText,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 ring-8 ring-blue-500/5">
        <Icon size={32} />
      </div>

      <h3 className="text-lg font-semibold text-white tracking-tight">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-400 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary" size="md">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
