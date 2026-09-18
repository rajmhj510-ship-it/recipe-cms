import NewsletterForm from "./NewsletterForm";
import FeaturedCarousel from "./FeaturedCarousel";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import HomeSearch from "./HomeSearch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredRecipes = await prisma.recipe.findMany({
    where: {
      featured: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const searchRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl"
          >
            Recipe<span className="text-orange-600">CMS</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="font-medium text-orange-600"
            >
              Home
            </Link>

            <Link
              href="/recipes"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Recipes
            </Link>

            <Link
              href="/favorites"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Favorites
            </Link>

            <a
              href="#categories"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Categories
            </a>

            <a
              href="#blog"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Blog
            </a>
          </nav>

          <Link
            href="/admin"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 sm:px-5 sm:py-2.5 sm:text-base"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-20 md:py-24">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600 sm:mb-4 sm:text-sm sm:tracking-[0.25em]">
            Welcome to Recipe CMS
          </p>

          <h1 className="mx-auto max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Discover delicious recipes for every occasion
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs leading-5 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
            Find simple, delicious recipes and discover your next favorite
            meal.
          </p>

          <div className="mt-6 sm:mt-8">
            <HomeSearch recipes={searchRecipes} />
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section
        id="recipes"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 md:py-20"
      >
        <div className="mb-6 flex items-end justify-between sm:mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600 sm:text-sm">
              Our picks
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:mt-2 sm:text-4xl">
              Featured Recipes
            </h2>
          </div>

          <Link
            href="/recipes"
            className="hidden font-semibold text-orange-600 transition hover:text-orange-700 sm:block"
          >
            View all →
          </Link>
        </div>

        {/* Carousel container */}
        <div className="w-full min-w-0 overflow-hidden">
          <FeaturedCarousel
            recipes={featuredRecipes.map((recipe) => ({
              id: recipe.id,
              title: recipe.title,
              slug: recipe.slug,
              image: recipe.image,
              time: recipe.time,
              difficulty: recipe.difficulty,
              description: recipe.description,
            }))}
          />
        </div>

        <div className="mt-10 sm:mt-16">
          <div className="mb-6 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600 sm:text-sm">
              Our favorites
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:mt-2 sm:text-4xl">
              Top-Rated & Most Loved
            </h2>
          </div>

          {featuredRecipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center sm:p-12">
              <h3 className="text-lg font-bold sm:text-xl">
                No featured recipes yet
              </h3>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Add a recipe from the admin dashboard and mark it as featured.
              </p>

              <Link
                href="/admin/recipes/new"
                className="mt-5 inline-block rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 sm:px-6 sm:py-3 sm:text-base"
              >
                Add Recipe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {featuredRecipes.map((recipe) => (
                <Link
                  href={`/recipes/${recipe.slug}`}
                  key={recipe.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-2 sm:p-3">
                    {recipe.category && (
                      <p className="text-[10px] font-semibold text-orange-600 sm:text-xs">
                        {recipe.category.name}
                      </p>
                    )}

                    <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-4 text-gray-900 group-hover:text-orange-600 sm:text-sm sm:leading-5">
                      {recipe.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section
        id="categories"
        className="bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 md:py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600 sm:text-sm">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:mt-2 sm:text-4xl">
              Popular Categories
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:mt-4 sm:text-base">
              Browse recipes by category and find something delicious to cook.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                href={`/recipes?category=${category.slug}`}
                key={category.id}
                className="group rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-8"
              >
                <div className="text-3xl sm:text-5xl">
                  🍽️
                </div>

                <h3 className="mt-3 text-sm font-bold group-hover:text-orange-600 sm:mt-5 sm:text-xl">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-base">
                  Explore recipes →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        id="blog"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 md:py-20"
      >
        <div className="rounded-2xl bg-orange-600 px-5 py-10 text-center text-white sm:rounded-3xl sm:px-8 sm:py-16 md:px-16">
          <p className="text-xs font-bold uppercase tracking-widest sm:text-sm">
            Stay inspired
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
            Get delicious recipes in your inbox
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-orange-100 sm:mt-4 sm:text-base">
            Subscribe for new recipes, cooking ideas, and helpful kitchen
            inspiration.
          </p>

          <div className="mt-5 sm:mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-4 py-8 text-gray-400 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="text-lg font-bold text-white sm:text-xl">
              Recipe<span className="text-orange-500">CMS</span>
            </p>

            <p className="mt-1 text-xs sm:mt-2 sm:text-sm">
              Delicious recipes made simple.
            </p>
          </div>

          <p className="text-xs sm:text-sm">
            © 2026 Recipe CMS. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
