export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import RecipeTitleSlugFields from "./RecipeTitleSlugFields";

async function createRecipe(formData: FormData) {
  "use server";
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const ingredientsText = String(formData.get("ingredients") || "").trim();
  const instructionsText = String(formData.get("instructions") || "").trim();

  const categoryIdValue = String(formData.get("categoryId") || "");
  const prepTimeValue = String(formData.get("prepTime") || "");
  const cookTimeValue = String(formData.get("cookTime") || "");
  const servingsValue = String(formData.get("servings") || "");

  if (!title || !slug || !ingredientsText || !instructionsText) {
    throw new Error(
      "Title, slug, ingredients, and instructions are required."
    );
  }

  const categoryId = categoryIdValue ? Number(categoryIdValue) : null;
  const prepTime = prepTimeValue ? Number(prepTimeValue) : null;
  const cookTime = cookTimeValue ? Number(cookTimeValue) : null;
  const servings = servingsValue ? Number(servingsValue) : null;

  if (!/^[-a-z0-9]+$/.test(slug) || slug.length > 180) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens.");
  }

  if (description.length > 5000 || title.length > 200) {
    throw new Error("Title or description is too long.");
  }

  if (image) {
    try {
      const url = new URL(image);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Image must be a valid HTTP(S) URL.");
      }
    } catch {
      throw new Error("Image must be a valid HTTP(S) URL.");
    }
  }

  if (
    (categoryId !== null && !Number.isInteger(categoryId)) ||
    (prepTime !== null && (!Number.isInteger(prepTime) || prepTime < 0)) ||
    (cookTime !== null && (!Number.isInteger(cookTime) || cookTime < 0)) ||
    (servings !== null && (!Number.isInteger(servings) || servings < 1))
  ) {
    throw new Error("Recipe numeric fields are invalid.");
  }

  if (ingredients.length === 0 || instructions.length === 0) {
    throw new Error("At least one ingredient and instruction are required.");
  }

  const ingredients = ingredientsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const instructions = instructionsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.create({
      data: {
        title,
        slug,
        description: description || null,
        image: image || null,
        prepTime,
        cookTime,
        servings,
        featured: formData.get("featured") === "on",
        favorite: formData.get("favorite") === "on",
        categoryId,
      },
    });

    const ingredientSection = await tx.ingredientSection.create({
      data: {
        title: "Ingredients",
        position: 0,
        recipeId: recipe.id,
      },
    });

    await tx.ingredientItem.createMany({
      data: ingredients.map((text, index) => ({
        text,
        position: index,
        sectionId: ingredientSection.id,
      })),
    });

    const instructionSection = await tx.instructionSection.create({
      data: {
        title: "Instructions",
        position: 0,
        recipeId: recipe.id,
      },
    });

    await tx.instructionStep.createMany({
      data: instructions.map((text, index) => ({
        text,
        position: index,
        sectionId: instructionSection.id,
      })),
    });
  });

  redirect("/admin/recipes");
}

export default async function NewRecipePage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

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
            Add New Recipe
          </h1>

          <p className="mt-2 text-gray-600">
            Create a new recipe for your website.
          </p>
        </div>

        <form
          action={createRecipe}
          className="space-y-6 rounded-xl bg-white p-8 shadow-sm"
        >
          <RecipeTitleSlugFields />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the recipe..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="categoryId"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
              defaultValue=""
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
                placeholder="15"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
                placeholder="30"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
                placeholder="4"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
              placeholder="https://example.com/recipe-image.jpg"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <p className="mb-2 text-sm text-gray-500">
              Enter one ingredient per line.
            </p>
            <textarea
              name="ingredients"
              rows={8}
              placeholder={"1 cup flour\n2 eggs\n1/2 cup milk"}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <p className="mb-2 text-sm text-gray-500">
              Enter one instruction step per line.
            </p>
            <textarea
              name="instructions"
              rows={8}
              placeholder={
                "Prepare the ingredients.\nCook according to the recipe.\nServe and enjoy."
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
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
              Save Recipe
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
