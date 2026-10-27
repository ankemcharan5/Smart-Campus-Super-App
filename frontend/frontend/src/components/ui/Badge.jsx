import React from "react";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default: "bg-white/10 text-slate-300 border-white/10",
    primary: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    overdue: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    absent: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const selectedVariant =
    variants[variant.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${selectedVariant} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
