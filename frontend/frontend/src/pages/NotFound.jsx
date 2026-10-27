import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

      <div className="text-center">

        <h1 className="text-7xl font-bold text-blue-500">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold">
          Page not found
        </h2>

        <p className="mt-2 text-slate-400">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Go Home
        </Link>

      </div>

    </div>
  );
}

export default NotFound;