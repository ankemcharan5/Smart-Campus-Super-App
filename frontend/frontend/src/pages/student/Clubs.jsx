function Clubs() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Clubs
        </h1>

        <p className="mt-2 text-slate-400">
          Explore student clubs and campus activities.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

        {[
          "Coding Club",
          "Robotics Club",
          "Cultural Club",
        ].map((club) => (
          <div
            key={club}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="text-lg font-semibold">
              {club}
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Student community for learning, collaboration
              and campus activities.
            </p>

            <button className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700">
              Explore
            </button>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Clubs;