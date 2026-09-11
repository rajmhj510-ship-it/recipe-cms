import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";

async function updateRecipe(id: number, formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const ingredients = String(formData.get("ingredients") || "").trim();
  const instructions = String(formData.get("instructions") || "").trim();

  const categoryIdValue = String(formData.get("categoryId") || "");
  const prepTimeValue = String(formData.get("prepTime") || "");
  const cookTimeValue = String(formData.get("cookTime") || "");
  const servingsValue = String(formData.get("servings") || "");

  if (!title || !slug || !ingredients || !instructions) {
    throw new Error(
      "Title, slug, ingredients, and instructions are required."
    );
  }

  const categoryId = categoryIdValue
    ? Number(categoryIdValue)
    : null;

  const prepTime = prepTimeValue
    ? Number(prepTimeValue)
    : null;

  const cookTime = cookTimeValue
    ? Number(cookTimeValue)
    : null;

  const servings = servingsValue
    ? Number(servingsValue)
    : null;

  await prisma.recipe.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      description: description || null,
      image: image || null,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      featured: formData.get("featured") === "on",
      favorite: formData.get("favorite") === "on",
      categoryId,
    },
  });

  redirect("/admin/recipes");
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = Number(id);

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!recipe) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Recipe not found
          </h1>

          <Link
            href="/admin/recipes"
            className="mt-4 inline-block text-sm text-gray-600 hover:text-black"
          >
            ← Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/recipes"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Back to Recipes
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit Recipe
          </h1>

          <p className="mt-2 text-gray-600">
            Update your recipe information.
          </p>
        </div>

        <form
          action={updateRecipe.bind(null, recipe.id)}
          className="space-y-6 rounded-xl bg-white p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Recipe Title
            </label>

            <input
              type="text"
              name="title"
              defaultValue={recipe.title}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              type="text"
              name="slug"
              defaultValue={recipe.slug}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              defaultValue={recipe.description || ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="categoryId"
              defaultValue={recipe.categoryId?.toString() || ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Prep Time (minutes)
              </label>

              <input
                type="number"
                name="prepTime"
                min="0"
                defaultValue={recipe.prepTime ?? ""}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cook Time (minutes)
              </label>

              <input
                type="number"
                name="cookTime"
                min="0"
                defaultValue={recipe.cookTime ?? ""}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Servings
              </label>

              <input
                type="number"
                name="servings"
                min="1"
                defaultValue={recipe.servings ?? ""}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL
            </label>

            <input
              type="url"
              name="image"
              defaultValue={recipe.image || ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ingredients
            </label>

            <textarea
              name="ingredients"
              rows={8}
              defaultValue={recipe.ingredients}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Instructions
            </label>

            <textarea
              name="instructions"
              rows={8}
              defaultValue={recipe.instructions}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={recipe.featured}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Featured recipe
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="favorite"
                defaultChecked={recipe.favorite}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Favorite recipe
              </span>
            </label>
          </div>

          <div className="flex gap-3 border-t pt-6">
            <button
              type="submit"
              className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Update Recipe
            </button>

            <Link
              href="/admin/recipes"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
