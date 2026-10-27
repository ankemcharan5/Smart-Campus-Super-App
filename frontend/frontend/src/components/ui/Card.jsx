import React from "react";

export function Card({
  children,
  className = "",
  hover = false,
  glass = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10 ${
        glass
          ? "bg-slate-900/60 backdrop-blur-xl"
          : "bg-slate-900"
      } ${
        hover
          ? "transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", action }) {
  return (
    <div
      className={`flex items-center justify-between border-b border-white/10 px-6 py-4 ${className}`}
    >
      <div className="space-y-1">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-white ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-xs text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`flex items-center border-t border-white/10 px-6 py-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
