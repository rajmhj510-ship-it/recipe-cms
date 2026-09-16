export const dynamic = "force-dynamic";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

async function deleteCategory(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!id) {
    throw new Error("Invalid category ID.");
  }

  const recipeCount = await prisma.recipe.count({
    where: {
      categoryId: id,
    },
  });

  if (recipeCount > 0) {
    throw new Error(
      "Cannot delete a category that still has recipes."
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });
revalidatePath("/");
revalidatePath("/recipes");

  redirect("/admin/categories");
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          recipes: true,
        },
      },
    },
    orderBy: {
      name: "asc",
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
              Categories
            </h1>

            <p className="mt-2 text-gray-600">
              Manage recipe categories.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Category
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No categories yet.</p>

              <Link
                href="/admin/categories/new"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Add Your First Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Slug
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Recipes
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>

                        {category.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        /{category.slug}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {category._count.recipes}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/categories/edit/${category.id}`}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          {category._count.recipes === 0 && (
                            <form action={deleteCategory}>
                              <input
                                type="hidden"
                                name="id"
                                value={category.id}
                              />

                              <button
                                type="submit"
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </form>
                          )}
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
