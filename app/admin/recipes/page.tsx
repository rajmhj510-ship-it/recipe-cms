import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

async function deleteRecipe(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!id) {
    throw new Error("Invalid recipe ID.");
  }

  await prisma.recipe.delete({
    where: {
      id,
    },
  });

  redirect("/admin/recipes");
}

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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-black"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Recipes
            </h1>

            <p className="mt-2 text-gray-600">
              Manage all recipes in your database.
            </p>
          </div>

          <Link
            href="/admin/recipes/new"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Recipe
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {recipes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No recipes yet.</p>

              <Link
                href="/admin/recipes/new"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Add Your First Recipe
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Recipe
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Featured
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Favorite
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recipes.map((recipe) => (
                    <tr key={recipe.id} className="border-b last:border-0">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {recipe.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            /{recipe.slug}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {recipe.category?.name || "Uncategorized"}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {recipe.featured ? "Yes" : "No"}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {recipe.favorite ? "Yes" : "No"}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/recipes/edit/${recipe.id}`}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <form action={deleteRecipe}>
                            <input
                              type="hidden"
                              name="id"
                              value={recipe.id}
                            />

                            <button
                              type="submit"
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
          )}
        </div>
      </div>
    </main>
  );
}
