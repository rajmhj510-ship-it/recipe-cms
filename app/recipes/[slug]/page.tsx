import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipeDetailPage({
  params,
}: RecipePageProps) {
  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });

  if (!recipe) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/recipes"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to Recipes
        </Link>

        <article className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-80 w-full object-cover"
            />
          ) : (
            <div className="flex h-80 items-center justify-center bg-gray-200 text-gray-500">
              No image
            </div>
          )}

          <div className="p-8">
            {recipe.category && (
              <p className="text-sm font-semibold text-gray-500">
                {recipe.category.name}
              </p>
            )}

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mt-4 text-lg text-gray-600">
                {recipe.description}
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {recipe.prepTime !== null && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Prep Time</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {recipe.prepTime} min
                  </p>
                </div>
              )}

              {recipe.cookTime !== null && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Cook Time</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {recipe.cookTime} min
                  </p>
                </div>
              )}

              {recipe.servings !== null && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Servings</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {recipe.servings}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Ingredients
              </h2>

              <div className="mt-4 whitespace-pre-line text-gray-700">
                {recipe.ingredients}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Instructions
              </h2>

              <div className="mt-4 whitespace-pre-line text-gray-700">
                {recipe.instructions}
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
