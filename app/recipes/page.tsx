import Link from "next/link";
import RecipeListSearch from "../RecipeListSearch";
import { prisma } from "../../lib/prisma";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

type RecipesPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
};

export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;
  const search = params.search?.trim() || "";

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
      ...(selectedCategory
        ? {
            category: {
              slug: selectedCategory,
            },
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory
  );

  let heading = "All Recipes";

  if (activeCategory) {
    heading = `${activeCategory.name} Recipes`;
  }

  return (
    <>
      <PublicHeader active="recipes" />
      <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          ← Back to Home
        </Link>

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm sm:mb-10 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Browse the collection</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{heading}</h1>

          <p className="mt-2 text-gray-600">
            {activeCategory?.description ||
              "Discover delicious recipes for every occasion."}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 sm:mb-10 sm:gap-3">
          <Link
            href="/recipes"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              !selectedCategory
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
            }`}
          >
            All Recipes
          </Link>

          {categories.map((category) => (
            <Link
              href={`/recipes?category=${category.slug}`}
              key={category.id}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === category.slug
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <RecipeListSearch recipes={recipes} initialSearch={search} />
      </div>
      </main>
      <PublicFooter />
    </>
  );
}
