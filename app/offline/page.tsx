import Link from "next/link";
import OfflineLibrary from "./OfflineLibrary";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

export const metadata = {
  title: "Offline Recipe Library",
  description: "Recipes saved on this device for offline cooking.",
};

export default function OfflinePage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <Link href="/recipes" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ← Back to Recipes
          </Link>
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Saved on this device
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Offline Recipe Library
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Download the catalog while you are online, then open saved recipes even without an internet connection.
            </p>
          </div>
          <OfflineLibrary />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
