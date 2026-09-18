import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import ImageUrlPreview from "../ImageUrlPreview";

async function updateRecipe(id: number, formData: FormData) {
  "use server";
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid recipe ID.");
  }

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
        throw new Error("Invalid image URL.");
      }
    } catch {
      throw new Error("Image must be a valid HTTP(S) URL.");
    }
  }

  if (
    (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) ||
    (prepTime !== null && (!Number.isInteger(prepTime) || prepTime < 0)) ||
    (cookTime !== null && (!Number.isInteger(cookTime) || cookTime < 0)) ||
    (servings !== null && (!Number.isInteger(servings) || servings < 1))
  ) {
    throw new Error("Recipe numeric fields are invalid.");
  }

  const ingredients = ingredientsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const instructions = instructionsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (ingredients.length === 0 || instructions.length === 0) {
    throw new Error("At least one ingredient and instruction are required.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existing) {
      throw new Error("Recipe not found.");
    }

    if (categoryId !== null) {
      const category = await tx.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new Error("Selected category does not exist.");
      }
    }

    await tx.recipe.update({
    where: {
      id,
    },
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

  await tx.ingredientSection.deleteMany({
    where: {
      recipeId: id,
    },
  });

  const ingredientSection = await tx.ingredientSection.create({
    data: {
      title: "Ingredients",
      position: 0,
      recipeId: id,
    },
  });

  await tx.ingredientItem.createMany({
    data: ingredients.map((text, index) => ({
      text,
      position: index,
      sectionId: ingredientSection.id,
    })),
  });

  await tx.instructionSection.deleteMany({
    where: {
      recipeId: id,
    },
  });

  const instructionSection = await tx.instructionSection.create({
    data: {
      title: "Instructions",
      position: 0,
      recipeId: id,
    },
  });

  await tx.instructionStep.createMany({
    data: instructions.map((text, index) => ({
      text,
      position: index,
      sectionId: instructionSection.id,
    })),
  });

    return { oldSlug: existing.slug };
  });

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${result.oldSlug}`);
  revalidatePath(`/recipes/${slug}`);
  redirect("/admin/recipes");
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const recipeId = Number(id);

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      ingredientSections: {
        orderBy: {
          position: "asc",
        },
        include: {
          items: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      instructionSections: {
        orderBy: {
          position: "asc",
        },
        include: {
          steps: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
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

  const ingredientText = recipe.ingredientSections
    .flatMap((section) => section.items.map((item) => item.text))
    .join("\n");

  const instructionText = recipe.instructionSections
    .flatMap((section) => section.steps.map((step) => step.text))
    .join("\n");

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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="categoryId"
              defaultValue={recipe.categoryId?.toString() || ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
                defaultValue={recipe.cookTime ?? ""}
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
                defaultValue={recipe.servings ?? ""}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <ImageUrlPreview defaultValue={recipe.image || ""} />
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
              defaultValue={ingredientText}
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
              defaultValue={instructionText}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
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
