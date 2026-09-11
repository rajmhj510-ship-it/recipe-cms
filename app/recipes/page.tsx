import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
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
          <h1 className="text-4xl font-bold text-gray-900">
            All Recipes
          </h1>
          <p className="mt-2 text-gray-600">
            Discover delicious recipes for every occasion.
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No recipes yet
            </h2>
            <p className="mt-2 text-gray-600">
              Recipes you create in the admin panel will appear here.
            </p>

            <Link
              href="/admin/recipes/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link
                href={`/recipes/${recipe.slug}`}
                key={recipe.id}
                className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
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
                    <p className="text-sm font-medium text-gray-500">
                      {recipe.category.name}
                    </p>
                  )}

                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    {recipe.title}
                  </h2>

                  {recipe.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {recipe.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    {recipe.prepTime !== null && (
                      <span>Prep: {recipe.prepTime} min</span>
                    )}

                    {recipe.cookTime !== null && (
                      <span>Cook: {recipe.cookTime} min</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
