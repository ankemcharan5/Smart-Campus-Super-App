import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Bot,
  Calendar,
  CreditCard,
  ClipboardCheck,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/Button";

export function Landing() {
  const features = [
    {
      title: "Real Agentic AI Assistant",
      desc: "Instant natural language intelligence querying real-time university database records.",
      icon: Bot,
      color: "from-purple-600 to-indigo-600",
    },
    {
      title: "Academic Management",
      desc: "Live attendance percentage tracking, coursework deadlines, and exam grade cards.",
      icon: ClipboardCheck,
      color: "from-blue-600 to-cyan-600",
    },
    {
      title: "Fee Portal & Online Payments",
      desc: "Seamless fee tracking, due date reminders, and instant digital receipt generation.",
      icon: CreditCard,
      color: "from-amber-600 to-orange-600",
    },
    {
      title: "Campus Ecosystem",
      desc: "Official announcements, campus events, lost & found desk, and facility directory.",
      icon: Building2,
      color: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 md:px-12 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Smart<span className="text-blue-400">Campus</span>
            </span>
            <span className="ml-2 rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
              SUPER APP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started →
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-4xl space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-purple-400" />
            <span>Next-Generation University Super App with Agentic AI</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            The Modern Digital Campus for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Smart Universities
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            All-in-one university portal empowering students, faculty, and administrators
            with unified academics, fee payments, timetables, and an autonomous AI companion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 shadow-xl shadow-blue-500/25">
                Launch Student Portal →
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left w-full">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.color} text-white mb-5 shadow-md`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 bg-slate-950">
        © 2026 Smart Campus Super App. All rights reserved. Powered by React & FastAPI.
      </footer>
    </div>
  );
}

export default Landing;