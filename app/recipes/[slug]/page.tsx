import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import FavoriteButton from "./FavoriteButton";
import IngredientScaler from "./IngredientScaler";
import RecipeActions from "./RecipeActions";
import { COOKIE_NAME, verifyAdminSession } from "../../../lib/admin-auth";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

function minutesToIsoDuration(minutes: number | null): string | undefined {
  return minutes === null ? undefined : `PT${minutes}M`;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    select: { title: true, description: true, image: true },
  });

  if (!recipe) return {};

  return {
    title: recipe.title,
    description: recipe.description || `Learn how to make ${recipe.title} with Recipe CMS.`,
    openGraph: {
      title: recipe.title,
      description: recipe.description || `Learn how to make ${recipe.title} with Recipe CMS.`,
      type: "article",
      images: recipe.image ? [{ url: recipe.image, alt: recipe.title }] : [],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const isAdmin = await verifyAdminSession(cookieStore.get(COOKIE_NAME)?.value);

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      category: true,
      ingredientSections: {
        orderBy: { position: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
      instructionSections: {
        orderBy: { position: "asc" },
        include: { steps: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!recipe) notFound();

  const relatedRecipes = await prisma.recipe.findMany({
    where: {
      slug: { not: recipe.slug },
      ...(recipe.categoryId ? { categoryId: recipe.categoryId } : {}),
    },
    select: { slug: true, title: true, image: true, description: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const totalTime =
    recipe.prepTime !== null && recipe.cookTime !== null
      ? recipe.prepTime + recipe.cookTime
      : null;

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description || undefined,
    image: recipe.image ? [recipe.image] : undefined,
    recipeCategory: recipe.category?.name || undefined,
    prepTime: minutesToIsoDuration(recipe.prepTime),
    cookTime: minutesToIsoDuration(recipe.cookTime),
    totalTime: totalTime !== null ? `PT${totalTime}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeIngredient: recipe.ingredientSections.flatMap((section) =>
      section.items.map((item) => item.text)
    ),
    recipeInstructions: recipe.instructionSections.flatMap((section) =>
      section.steps.map((step) => ({ "@type": "HowToStep", text: step.text }))
    ),
  };

  return (
    <>
      <PublicHeader active="recipes" />
      <main className="min-h-screen bg-gray-50 print:bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
        />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:px-0 print:py-0">
          <Link href="/recipes" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 print:hidden">
            ← Back to Recipes
          </Link>

          <article className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm print:mt-0 print:rounded-none print:shadow-none print:overflow-visible print:[width:100%]" id="print-recipe">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="h-64 w-full object-cover sm:h-80 md:h-[28rem] print:h-[32mm] print:block print:w-full print:object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center bg-gray-200 text-gray-500 sm:h-80 md:h-[28rem]">
                No image
              </div>
            )}

            <div className="p-5 sm:p-8 md:p-12 print:p-[4mm]">
              {recipe.category && (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 print:text-[7pt]">
                  {recipe.category.name}
                </p>
              )}

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl print:mt-1">
                {recipe.title}
              </h1>

              {recipe.description && (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 print:mt-2 print:text-[8pt] print:leading-[1.2]">
                  {recipe.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
                <FavoriteButton initialFavorite={recipe.favorite} slug={recipe.slug} canEdit={isAdmin} />
                <RecipeActions title={recipe.title} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 print:hidden">
                {recipe.prepTime !== null && (
                  <div className="rounded-2xl bg-orange-50 p-5">
                    <p className="text-sm font-medium text-gray-500">Prep Time</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{recipe.prepTime} min</p>
                  </div>
                )}
                {recipe.cookTime !== null && (
                  <div className="rounded-2xl bg-orange-50 p-5">
                    <p className="text-sm font-medium text-gray-500">Cook Time</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{recipe.cookTime} min</p>
                  </div>
                )}
                {totalTime !== null && (
                  <div className="rounded-2xl bg-orange-50 p-5">
                    <p className="text-sm font-medium text-gray-500">Total Time</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{totalTime} min</p>
                  </div>
                )}
                {recipe.servings !== null && totalTime === null && (
                  <div className="rounded-2xl bg-orange-50 p-5">
                    <p className="text-sm font-medium text-gray-500">Servings</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{recipe.servings}</p>
                  </div>
                )}
              </div>

              {recipe.servings !== null && totalTime !== null && (
                <p className="mt-3 text-sm text-gray-500 print:hidden">Makes {recipe.servings} servings</p>
              )}

              <nav aria-label="Recipe sections" className="mt-8 flex flex-wrap gap-2 border-y border-gray-100 py-4 print:hidden">
                <a href="#ingredients" className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">Ingredients</a>
                <a href="#instructions" className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">Instructions</a>
                {recipe.servingSuggestions && typeof recipe.servingSuggestions === "object" && (
                  <a href="#serving-suggestions" className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">Serving Suggestions</a>
                )}
                {recipe.chefTips && Array.isArray(recipe.chefTips) && recipe.chefTips.length > 0 && (
                  <a href="#chef-tips" className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">Chef Tips</a>
                )}
              </nav>

              <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-[0.8fr_1.2fr] print:mt-4 print:grid print:grid-cols-2 print:gap-[5mm] print:items-start">
                <section id="ingredients" className="scroll-mt-24 print:break-inside-avoid print:min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 print:text-[11pt]">Ingredients</h2>
                  {recipe.servings && recipe.servings > 0 ? (
                    <IngredientScaler sections={recipe.ingredientSections} originalServings={recipe.servings} />
                  ) : (
                    <div className="mt-5 space-y-8 print:mt-2 print:space-y-2">
                      {recipe.ingredientSections.map((section) => (
                        <div key={section.id} className="rounded-2xl bg-gray-50 p-6 print:rounded-none print:bg-white print:p-0 print:break-inside-avoid">
                          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                          <ul className="mt-4 space-y-3">
                            {section.items.map((item) => (
                              <li key={item.id} className="flex gap-3 leading-7 text-gray-700">
                                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section id="instructions" className="scroll-mt-24 print:break-inside-avoid print:mt-0 print:min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 print:text-[11pt]">Instructions</h2>
                  <div className="mt-5 space-y-8">
                    {recipe.instructionSections.map((section) => (
                      <div key={section.id} className="rounded-2xl bg-gray-50 p-6">
                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                        <ol className="mt-4 space-y-5 print:mt-2 print:space-y-1.5">
                          {section.steps.map((step, index) => (
                            <li key={step.id} className="flex gap-4 leading-7 text-gray-700">
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

              {recipe.servingSuggestions && typeof recipe.servingSuggestions === "object" && (
                <section id="serving-suggestions" className="mt-12 scroll-mt-24 rounded-2xl bg-orange-50 p-6 print:mt-3 print:rounded-none print:bg-white print:p-0 print:break-inside-avoid">
                  <h2 className="text-2xl font-bold text-gray-900">Serving Suggestions</h2>
                  <div className="mt-4 text-gray-700">
                    {Array.isArray((recipe.servingSuggestions as { items?: unknown }).items) &&
                      (recipe.servingSuggestions as { items: unknown[] }).items.map((item, index) => (
                        <p key={index} className="mb-2">• {String(item)}</p>
                      ))}
                  </div>
                </section>
              )}

              <div className="sticky bottom-3 z-20 mt-8 flex justify-center gap-2 md:hidden print:hidden">
                <a href="#ingredients" className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-lg ring-1 ring-gray-200">Ingredients</a>
                <a href="#instructions" className="rounded-full bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg">Instructions</a>
              </div>
              {recipe.chefTips && Array.isArray(recipe.chefTips) && recipe.chefTips.length > 0 && (
                <section id="chef-tips" className="mt-8 scroll-mt-24 rounded-2xl bg-gray-50 p-6 print:mt-3 print:rounded-none print:bg-white print:p-0 print:break-inside-avoid">
                  <h2 className="text-2xl font-bold text-gray-900">Chef Tips</h2>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    {recipe.chefTips.map((tip, index) => (
                      <li key={index}>• {String(tip)}</li>
                    ))}
                  </ul>
                </section>
              )}


              {relatedRecipes.length > 0 && (
                <section className="mt-12 border-t border-gray-100 pt-10 print:hidden">
                  <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {relatedRecipes.map((related) => (
                      <Link key={related.slug} href={`/recipes/${related.slug}`} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        {related.image ? (
                          <img src={related.image} alt="" className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                        ) : (
                          <div className="flex h-36 items-center justify-center bg-gray-100 text-sm text-gray-400">No image</div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-700">{related.title}</h3>
                          {related.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{related.description}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}


            </div>
          </article>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
