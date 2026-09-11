import Link from "next/link";
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
  const search = params.search?.trim();

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
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
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

  if (activeCategory && search) {
    heading = `${activeCategory.name} Recipes`;
  } else if (activeCategory) {
    heading = `${activeCategory.name} Recipes`;
  } else if (search) {
    heading = `Search Results for "${search}"`;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">{heading}</h1>

          <p className="mt-2 text-gray-600">
            {activeCategory?.description ||
              (search
                ? `Showing recipes matching "${search}".`
                : "Discover delicious recipes for every occasion.")}
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
              href={`/recipes?category=${category.slug}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
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

        {recipes.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No recipes found
            </h2>

            <p className="mt-2 text-gray-600">
              {search
                ? `No recipes matched "${search}".`
                : "There are no recipes in this category yet."}
            </p>

            <Link
              href="/recipes"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              View All Recipes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link
                href={`/recipes/${recipe.slug}`}
                key={recipe.id}
                className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
              >
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                    No image
                  </div>
                )}

                <div className="p-6">
                  {recipe.category && (
                    <p className="text-sm font-medium text-orange-600">
                      {recipe.category.name}
                    </p>
                  )}

                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    {recipe.title}
                  </h2>

                  {recipe.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {recipe.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    {recipe.prepTime !== null && (
                      <span>Prep: {recipe.prepTime} min</span>
                    )}
                    {recipe.cookTime !== null && (
                      <span>Cook: {recipe.cookTime} min</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
