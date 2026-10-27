import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = "up",
  color = "blue",
  onClick,
  className = "",
}) {
  const colorMap = {
    blue: {
      bg: "from-blue-600/20 to-indigo-600/10",
      border: "hover:border-blue-500/40",
      iconBg: "bg-blue-600/20 text-blue-400 ring-blue-500/10",
      accent: "text-blue-400",
    },
    emerald: {
      bg: "from-emerald-600/20 to-teal-600/10",
      border: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-600/20 text-emerald-400 ring-emerald-500/10",
      accent: "text-emerald-400",
    },
    amber: {
      bg: "from-amber-600/20 to-orange-600/10",
      border: "hover:border-amber-500/40",
      iconBg: "bg-amber-600/20 text-amber-400 ring-amber-500/10",
      accent: "text-amber-400",
    },
    rose: {
      bg: "from-rose-600/20 to-red-600/10",
      border: "hover:border-rose-500/40",
      iconBg: "bg-rose-600/20 text-rose-400 ring-rose-500/10",
      accent: "text-rose-400",
    },
    purple: {
      bg: "from-purple-600/20 to-violet-600/10",
      border: "hover:border-purple-500/40",
      iconBg: "bg-purple-600/20 text-purple-400 ring-purple-500/10",
      accent: "text-purple-400",
    },
    cyan: {
      bg: "from-cyan-600/20 to-blue-600/10",
      border: "hover:border-cyan-500/40",
      iconBg: "bg-cyan-600/20 text-cyan-400 ring-cyan-500/10",
      accent: "text-cyan-400",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 ${
        scheme.border
      } ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 active:scale-[0.99]"
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-white">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-4 ${scheme.iconBg}`}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          {trendDirection === "up" ? (
            <span className="flex items-center text-emerald-400">
              <ArrowUpRight size={14} className="mr-0.5" />
              {trend}
            </span>
          ) : (
            <span className="flex items-center text-rose-400">
              <ArrowDownRight size={14} className="mr-0.5" />
              {trend}
            </span>
          )}
          <span className="text-slate-500 ml-1">vs last period</span>
        </div>
      )}

      {/* Subtle bottom glow */}
      <div
        className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${scheme.bg} blur-2xl pointer-events-none`}
      />
    </div>
  );
}

export default StatCard;
