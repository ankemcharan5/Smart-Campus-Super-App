import React from "react";
import { User, Mail, Shield } from "lucide-react";

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="text-slate-400 mt-2">
          View your student account information.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-800">

          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={42} />
          </div>

          <div className="text-center sm:text-left">

            <h2 className="text-2xl font-bold">
              {user.name || "Student"}
            </h2>

            <p className="text-slate-400 mt-1">
              Student Account
            </p>

          </div>

        </div>

        <div className="mt-8 space-y-5">

          <div className="flex items-center gap-4 bg-slate-800/60 p-4 rounded-xl">
            <User className="text-blue-400" />

            <div>
              <p className="text-xs text-slate-400">
                Full Name
              </p>

              <p className="font-medium">
                {user.name || "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 p-4 rounded-xl">
            <Mail className="text-blue-400" />

            <div>
              <p className="text-xs text-slate-400">
                Email
              </p>

              <p className="font-medium">
                {user.email || "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 p-4 rounded-xl">
            <Shield className="text-blue-400" />

            <div>
              <p className="text-xs text-slate-400">
                Role
              </p>

              <p className="font-medium">
                {user.role || "student"}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;