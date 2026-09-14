import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import FavoriteButton from "./FavoriteButton";

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

            <div className="mt-6">
              <FavoriteButton
                initialFavorite={recipe.favorite}
                slug={recipe.slug}
              />
            </div>

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

                <div className="mt-5 space-y-8">
                  {recipe.ingredientSections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl bg-gray-50 p-6"
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.title}
                      </h3>

                      <ul className="mt-4 space-y-3">
                        {section.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex gap-3 leading-7 text-gray-700"
                          >
                            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900">
                  Instructions
                </h2>

                <div className="mt-5 space-y-8">
                  {recipe.instructionSections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl bg-gray-50 p-6"
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.title}
                      </h3>

                      <ol className="mt-4 space-y-5">
                        {section.steps.map((step, index) => (
                          <li
                            key={step.id}
                            className="flex gap-4 leading-7 text-gray-700"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                              {index + 1}
                            </span>

                            <span>{step.text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {recipe.servingSuggestions &&
              typeof recipe.servingSuggestions === "object" && (
                <section className="mt-12 rounded-2xl bg-orange-50 p-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Serving Suggestions
                  </h2>

                  <div className="mt-4 text-gray-700">
                    {Array.isArray(
                      (recipe.servingSuggestions as { items?: unknown }).items
                    ) &&
                      (
                        recipe.servingSuggestions as {
                          items: unknown[];
                        }
                      ).items.map((item, index) => (
                        <p key={index} className="mb-2">
                          • {String(item)}
                        </p>
                      ))}
                  </div>
                </section>
              )}

            {recipe.chefTips &&
              Array.isArray(recipe.chefTips) &&
              recipe.chefTips.length > 0 && (
                <section className="mt-8 rounded-2xl bg-gray-50 p-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Chef Tips
                  </h2>

                  <ul className="mt-4 space-y-3 text-gray-700">
                    {recipe.chefTips.map((tip, index) => (
                      <li key={index}>• {String(tip)}</li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        </article>
      </div>
    </main>
  );
}
