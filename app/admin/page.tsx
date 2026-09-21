import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const [recipeCount, categoryCount, subscriberCount, featuredCount, favoriteCount, recentRecipes] = await Promise.all([
    prisma.recipe.count(),
    prisma.category.count(),
    prisma.subscriber.count(),
    prisma.recipe.count({ where: { featured: true } }),
    prisma.recipe.count({ where: { favorite: true } }),
    prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, createdAt: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold tracking-tight">
            Recipe<span className="text-orange-600">CMS</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
            >
              View Website
            </Link>

            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-full bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-3 text-gray-600">
            Manage your recipes, categories, and newsletter subscribers.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Recipes</p>
            <p className="mt-2 text-4xl font-bold">{recipeCount}</p>
            <Link
              href="/admin/recipes"
              className="mt-5 inline-block font-semibold text-orange-600 hover:text-orange-700"
            >
              Manage Recipes →
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Categories</p>
            <p className="mt-2 text-4xl font-bold">{categoryCount}</p>
            <Link
              href="/admin/categories"
              className="mt-5 inline-block font-semibold text-orange-600 hover:text-orange-700"
            >
              Manage Categories →
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Subscribers
            </p>

            <p className="mt-2 text-4xl font-bold">{subscriberCount}</p>

            <Link
              href="/admin/subscribers"
              className="mt-5 inline-block font-semibold text-orange-600 hover:text-orange-700"
            >
              Manage Subscribers →
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm font-semibold text-orange-700">Featured Recipes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{featuredCount}</p>
            <p className="mt-1 text-sm text-gray-600">Currently featured on the website.</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">Favorite Recipes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{favoriteCount}</p>
            <p className="mt-1 text-sm text-gray-600">Recipes currently marked as favorites.</p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold">Recently Added</h2>
              <p className="mt-1 text-sm text-gray-500">Your latest recipe content.</p>
            </div>
            <Link href="/admin/recipes" className="text-sm font-semibold text-orange-600 hover:text-orange-700">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRecipes.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500">No recipes added yet.</p>
            ) : recentRecipes.map((recipe) => (
              <div key={recipe.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{recipe.title}</p>
                  <p className="mt-1 text-xs text-gray-500">Added {recipe.createdAt.toLocaleDateString()}</p>
                </div>
                <Link href={`/admin/recipes/edit/${recipe.id}`} className="shrink-0 text-sm font-semibold text-gray-700 hover:text-orange-600">Edit →</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Quick Actions</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/recipes/new"
              className="rounded-2xl bg-orange-600 p-6 font-semibold text-white transition hover:bg-orange-700"
            >
              Add New Recipe →
            </Link>

            <Link
              href="/admin/categories/new"
              className="rounded-2xl border border-gray-200 bg-white p-6 font-semibold text-gray-900 transition hover:border-orange-500 hover:text-orange-600"
            >
              Add New Category →
            </Link>

            <Link
              href="/admin/subscribers"
              className="rounded-2xl border border-gray-200 bg-white p-6 font-semibold text-gray-900 transition hover:border-orange-500 hover:text-orange-600"
            >
              View Subscribers →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
