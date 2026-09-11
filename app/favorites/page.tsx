import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function FavoritesPage() {
  const recipes = await prisma.recipe.findMany({
    where: {
      favorite: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Favorite Recipes
          </h1>

          <p className="mt-2 text-gray-600">
            Recipes you have marked as favorites.
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No favorite recipes yet
            </h2>

            <p className="mt-2 text-gray-600">
              Mark recipes as favorites from the admin dashboard.
            </p>

            <Link
              href="/admin/recipes"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Manage Recipes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link
                href={`/recipes/${recipe.slug}`}
                key={recipe.id}
                className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                    No image
                  </div>
                )}

                <div className="p-6">
                  {recipe.category && (
                    <p className="text-sm font-semibold text-orange-600">
                      {recipe.category.name}
                    </p>
                  )}

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {recipe.title}
                  </h2>

                  {recipe.description && (
                    <p className="mt-3 line-clamp-3 text-gray-600">
                      {recipe.description}
                    </p>
                  )}

                  <p className="mt-5 font-semibold text-orange-600">
                    View Recipe →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
