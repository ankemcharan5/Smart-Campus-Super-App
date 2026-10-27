import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while communicating with the server. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 md:p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-4 ring-8 ring-rose-500/10">
        <AlertTriangle size={28} />
      </div>

      <h3 className="text-lg font-semibold text-rose-300">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-rose-400/80 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button
            onClick={onRetry}
            variant="secondary"
            size="md"
            icon={RefreshCw}
            className="border-rose-500/30 text-rose-200 hover:bg-rose-500/20"
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
