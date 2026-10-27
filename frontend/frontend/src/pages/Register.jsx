import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import API from "../api/axios";
import { Button } from "../components/ui/Button";

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        email: email.toLowerCase().trim(),
        password,
        role,
        student_id: role === "student" ? (studentId || `SC${Math.floor(100 + Math.random() * 900)}`) : null,
        department: role !== "admin" ? department : null,
        year: role === "student" ? Number(year) : null,
      };

      await API.post("/auth/register", payload);

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Account created successfully! Please sign in." },
        });
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.detail || "Registration failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white selection:bg-blue-600">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 ring-4 ring-white/10">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-sm text-slate-400">
            Join the Smart Campus Super App digital portal
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-2xl space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["student", "faculty", "admin"].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl border py-2 text-xs font-bold capitalize transition-all ${
                    role === r
                      ? "border-blue-500 bg-blue-600/20 text-blue-400 shadow-sm"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Charan Teja"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@campus.edu"
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

          {role === "student" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="SC005"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </div>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full py-3 mt-2"
          >
            Create Account
          </Button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;