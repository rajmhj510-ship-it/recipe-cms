import NewsletterForm from "./NewsletterForm";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import HomeSearch from "./HomeSearch";

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    where: {
      featured: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
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
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
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
            className="rounded-full bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-600">
            Welcome to Recipe CMS
          </p>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Discover delicious recipes for every occasion
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Find simple, delicious recipes and discover your next favorite
            meal.
          </p>

          <HomeSearch recipes={searchRecipes} />
        </div>
      </section>

      {/* Featured Recipes */}
      <section
        id="recipes"
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Our picks
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
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

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <h3 className="text-xl font-bold">
              No featured recipes yet
            </h3>

            <p className="mt-2 text-gray-600">
              Add a recipe from the admin dashboard and mark it as featured.
            </p>

            <Link
              href="/admin/recipes/new"
              className="mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Add Recipe
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {recipes.map((recipe) => (
              <Link
                href={`/recipes/${recipe.slug}`}
                key={recipe.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-64 overflow-hidden bg-gray-100">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {recipe.category && (
                    <p className="text-sm font-semibold text-orange-600">
                      {recipe.category.name}
                    </p>
                  )}

                  <h3 className="mt-2 text-2xl font-bold">
                    {recipe.title}
                  </h3>

                  {recipe.description && (
                    <p className="mt-3 leading-7 text-gray-600">
                      {recipe.description}
                    </p>
                  )}

                  <p className="mt-5 font-semibold text-orange-600">
                    View Recipe →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Categories */}
      <section
        id="categories"
        className="bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Explore
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Popular Categories
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Browse recipes by category and find something delicious to cook.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                href={`/recipes?category=${category.slug}`}
                key={category.id}
                className="group rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-5xl">
                  🍽️
                </div>

                <h3 className="mt-5 text-xl font-bold group-hover:text-orange-600">
                  {category.name}
                </h3>

                <p className="mt-2 text-gray-500">
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
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <div className="rounded-3xl bg-orange-600 px-8 py-16 text-center text-white md:px-16">
          <p className="text-sm font-bold uppercase tracking-widest">
            Stay inspired
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Get delicious recipes in your inbox
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-orange-100">
            Subscribe for new recipes, cooking ideas, and helpful kitchen
            inspiration.
          </p>

         <NewsletterForm />
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-6 py-12 text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div>
            <p className="text-xl font-bold text-white">
              Recipe<span className="text-orange-500">CMS</span>
            </p>

            <p className="mt-2 text-sm">
              Delicious recipes made simple.
            </p>
          </div>

          <p className="text-sm">
            © 2026 Recipe CMS. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
