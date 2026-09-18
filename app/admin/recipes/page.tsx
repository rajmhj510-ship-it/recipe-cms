import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import DeleteRecipeButton from "./DeleteRecipeButton";
import CategorySection from "./CategorySection";

export const dynamic = "force-dynamic";

async function deleteRecipe(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  await prisma.recipe.delete({
    where: { id },
  });

  redirect("/admin/recipes");
}

export default async function AdminRecipesPage() {
  await requireAdmin();
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
  <Link
    href="/admin"
    className="mb-6 inline-block text-sm font-semibold text-gray-700 hover:text-orange-600"
  >
    ← Back to Dashboard
  </Link>

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
  <CategorySection
    key={categoryName}
    categoryName={categoryName}
    recipeCount={categoryRecipes.length}
  >

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

                              <DeleteRecipeButton
                               recipeId={recipe.id}
                              deleteRecipe={deleteRecipe}
                             />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CategorySection>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
