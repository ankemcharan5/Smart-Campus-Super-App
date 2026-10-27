function Clubs() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Clubs
      </h1>

      <div className="grid gap-5 md:grid-cols-3">

        {[
          "Coding Club",
          "Robotics Club",
          "Cultural Club",
        ].map((club) => (
          <div
            key={club}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="font-semibold">
              {club}
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Manage campus club information.
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Clubs;