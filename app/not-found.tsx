import Link from "next/link";
import PublicHeader from "./components/PublicHeader";
import PublicFooter from "./components/PublicFooter";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="flex min-h-[65vh] items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">404</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Recipe not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
            The page you are looking for may have moved or no longer exists.
          </p>
          <Link
            href="/recipes"
            className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Browse Recipes
          </Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
