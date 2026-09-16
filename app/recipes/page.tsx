import Link from "next/link";
import RecipeListSearch from "../RecipeListSearch";
import { prisma } from "../../lib/prisma";

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

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const recipes = await prisma.recipe.findMany({
    where: {
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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          ← Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">{heading}</h1>

          <p className="mt-2 text-gray-600">
            {activeCategory?.description ||
              "Discover delicious recipes for every occasion."}
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
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

        <RecipeListSearch recipes={recipes} />
      </div>
    </main>
  );
}
