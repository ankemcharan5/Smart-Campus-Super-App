import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, AlertCircle, Sparkles, User, ShieldCheck } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.toLowerCase().trim(), password);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const from = location.state?.from?.pathname;

      if (from && from !== "/login") {
        navigate(from, { replace: true });
        return;
      }

      if (user?.role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (user?.role === "faculty") {
        navigate("/faculty/dashboard", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.detail || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white selection:bg-blue-600">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 ring-4 ring-white/10">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to your Smart Campus university portal
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-2xl space-y-5"
        >
          {location.state?.message && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              {location.state.message}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="phase11student@example.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full py-3"
          >
            Sign In
          </Button>

          {/* Quick Demo Logins Helper */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Role Switcher
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoLogin("phase11student@example.com", "StudentPass123!")}
                className="rounded-xl border border-white/10 bg-white/5 py-1.5 px-2 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors truncate"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setDemoLogin("faculty1@smartcampus.edu", "FacultyPass123!")}
                className="rounded-xl border border-white/10 bg-white/5 py-1.5 px-2 text-[10px] font-semibold text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-colors truncate"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setDemoLogin("admin@smartcampus.edu", "AdminPass123!")}
                className="rounded-xl border border-white/10 bg-white/5 py-1.5 px-2 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors truncate"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;