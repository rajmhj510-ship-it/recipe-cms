import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function AdminPage() {
  const recipeCount = await prisma.recipe.count();
  const categoryCount = await prisma.category.count();
  const featuredCount = await prisma.recipe.count({
    where: { featured: true },
  });
  const favoriteCount = await prisma.recipe.count({
    where: { favorite: true },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Recipe CMS Admin
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your recipes, categories, and website content.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Recipes</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {recipeCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {categoryCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Featured</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {featuredCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Favorites</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {favoriteCount}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/recipes"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Recipes
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Add, edit, and delete recipes.
              </p>
            </Link>

            <Link
              href="/admin/categories"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Categories
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Add, edit, and manage recipe categories.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
