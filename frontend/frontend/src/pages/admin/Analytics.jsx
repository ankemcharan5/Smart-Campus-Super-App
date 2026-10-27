function Analytics() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="mt-2 text-slate-400">
          SmartCampus platform statistics.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm text-slate-500">
            Total Users
          </p>

          <p className="mt-2 text-4xl font-bold">
            6
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm text-slate-500">
            Attendance Records
          </p>

          <p className="mt-2 text-4xl font-bold">
            2
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm text-slate-500">
            Campus Resources
          </p>

          <p className="mt-2 text-4xl font-bold">
            3
          </p>
        </div>

      </div>

    </div>
  );
}

export default Analytics;