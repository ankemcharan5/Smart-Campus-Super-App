function Complaints() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Complaints
      </h1>

      <div className="space-y-4">

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="font-semibold">
            Hostel Water Problem
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Water supply is not available properly in the hostel block.
          </p>

          <span className="mt-4 inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
            Pending
          </span>

        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="font-semibold">
            Classroom Projector Not Working
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            The projector in CSE-204 is not working properly.
          </p>

          <span className="mt-4 inline-block rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
            Resolved
          </span>

        </div>

      </div>

    </div>
  );
}

export default Complaints;