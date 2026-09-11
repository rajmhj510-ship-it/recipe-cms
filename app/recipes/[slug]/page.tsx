import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
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
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/recipes"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          ← Back to Recipes
        </Link>

        <article className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-80 w-full object-cover md:h-[28rem]"
            />
          ) : (
            <div className="flex h-80 items-center justify-center bg-gray-200 text-gray-500 md:h-[28rem]">
              No image
            </div>
          )}

          <div className="p-8 md:p-12">
            {recipe.category && (
              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                {recipe.category.name}
              </p>
            )}

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
                {recipe.description}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {recipe.prepTime !== null && (
                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Prep Time
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {recipe.prepTime} min
                  </p>
                </div>
              )}

              {recipe.cookTime !== null && (
                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Cook Time
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {recipe.cookTime} min
                  </p>
                </div>
              )}

              {recipe.servings !== null && (
                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Servings
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {recipe.servings}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
              <section>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ingredients
                </h2>

                <div className="mt-5 whitespace-pre-line rounded-2xl bg-gray-50 p-6 leading-8 text-gray-700">
                  {recipe.ingredients}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900">
                  Instructions
                </h2>

                <div className="mt-5 whitespace-pre-line rounded-2xl bg-gray-50 p-6 leading-8 text-gray-700">
                  {recipe.instructions}
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
