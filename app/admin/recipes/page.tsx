import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function deleteRecipe(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!id) {
    return;
  }

  await prisma.recipe.delete({
    where: { id },
  });

  redirect("/admin/recipes");
}

export default async function AdminRecipesPage() {
  const recipes = await prisma.recipe.findMany({
    include: {
      category: true,
    },
    orderBy: [
      { category: { name: "asc" } },
      { title: "asc" },
    ],
  });

  const groupedRecipes = recipes.reduce(
    (groups, recipe) => {
      const categoryName = recipe.category?.name || "Uncategorized";

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }

      groups[categoryName].push(recipe);

      return groups;
    },
    {} as Record<string, typeof recipes>,
  );

  const categories = Object.entries(groupedRecipes);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Recipe Management
            </h1>
            <p className="mt-1 text-gray-600">
              {recipes.length} recipes across {categories.length} categories
            </p>
          </div>

          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No recipes yet
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first recipe to get started.
            </p>

            <Link
              href="/admin/recipes/new"
              className="mt-5 inline-block rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              Add Recipe
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map(([categoryName, categoryRecipes]) => (
              <details
                key={categoryName}
                open
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <summary className="cursor-pointer list-none bg-gray-100 px-6 py-4 hover:bg-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {categoryName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {categoryRecipes.length}{" "}
                        {categoryRecipes.length === 1 ? "recipe" : "recipes"}
                      </p>
                    </div>

                    <span className="text-gray-500">▼</span>
                  </div>
                </summary>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-white">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                          Recipe
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                          Featured
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                          Favorite
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {categoryRecipes.map((recipe) => (
                        <tr
                          key={recipe.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {recipe.title}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              /recipes/{recipe.slug}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {recipe.featured ? (
                              <span className="font-medium text-green-600">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {recipe.favorite ? (
                              <span className="font-medium text-red-600">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/admin/recipes/edit/${recipe.id}`}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </Link>

                              <Link
                                href={`/recipes/${recipe.slug}`}
                                target="_blank"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                View
                              </Link>

                              <form action={deleteRecipe}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={recipe.id}
                                />

                                <button
                                  type="submit"
                                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
