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

type AdminRecipesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function AdminRecipesPage({
  searchParams,
}: AdminRecipesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = (params.q || "").trim();
  const categoryFilter = (params.category || "").trim();
  const searchPattern = query ? `%\${query}%` : undefined;

  const [recipes, categoryOptions] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
                {
                  description: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(categoryFilter
          ? {
              category: {
                slug: categoryFilter,
              },
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: [
        { category: { name: "asc" } },
        { title: "asc" },
      ],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

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
  const isFiltered = Boolean(query || categoryFilter);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-6 inline-block text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Content
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Recipe Management
            </h1>
            <p className="mt-1 text-gray-600">
              {recipes.length} matching {recipes.length === 1 ? "recipe" : "recipes"} across{" "}
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
          </div>

          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            + Add Recipe
          </Link>
        </div>

        <form
          method="GET"
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <div>
              <label
                htmlFor="recipe-search"
                className="sr-only"
              >
                Search recipes
              </label>
              <input
                id="recipe-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search title, slug, or description..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="recipe-category" className="sr-only">
                Filter by category
              </label>
              <select
                id="recipe-category"
                name="category"
                defaultValue={categoryFilter}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Search
              </button>

              {isFiltered && (
                <Link
                  href="/admin/recipes"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              {isFiltered ? "No matching recipes" : "No recipes yet"}
            </h2>

            <p className="mt-2 text-gray-600">
              {isFiltered
                ? "Try a different search or category."
                : "Add your first recipe to get started."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {isFiltered && (
                <Link
                  href="/admin/recipes"
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </Link>
              )}
              <Link
                href="/admin/recipes/new"
                className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
              >
                Add Recipe
              </Link>
            </div>
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
                  <table className="w-full min-w-[720px] text-left">
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
                              <span className="font-medium text-green-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {recipe.favorite ? (
                              <span className="font-medium text-red-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/admin/recipes/edit/${recipe.id}`}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </Link>

                              <Link
                                href={`/recipes/${recipe.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
