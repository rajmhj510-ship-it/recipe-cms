"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  difficulty: string | null;
  category: { name: string } | null;
};

export default function RecipeListSearch({
  recipes,
  initialSearch = "",
}: {
  recipes: Recipe[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("newest");
  const query = search.trim().toLowerCase();

  const filteredRecipes = useMemo(() => {
    const result = recipes.filter((recipe) => {
      const matchesSearch =
        !query ||
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.category?.name.toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "all" ||
        recipe.difficulty?.toLowerCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });

    return [...result].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "time") {
        const aTime = (a.prepTime ?? 0) + (a.cookTime ?? 0);
        const bTime = (b.prepTime ?? 0) + (b.cookTime ?? 0);
        return aTime - bTime;
      }
      return b.id - a.id;
    });
  }, [recipes, query, difficulty, sort]);

  return (
    <div>
      <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipes..."
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            aria-label="Search recipes"
          />

          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            aria-label="Filter by difficulty"
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            aria-label="Sort recipes"
          >
            <option value="newest">Newest</option>
            <option value="title">A–Z</option>
            <option value="time">Shortest time</option>
          </select>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Showing {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">No recipes found</h2>
          <p className="mt-2 text-gray-600">
            Try a different search, difficulty, or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={"/recipes/" + recipe.slug}
              className="group block overflow-hidden rounded-xl bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">No image</div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  {recipe.category ? (
                    <p className="text-sm font-medium text-orange-600">{recipe.category.name}</p>
                  ) : (
                    <span />
                  )}
                  {recipe.difficulty && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">
                      {recipe.difficulty.toLowerCase()}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-bold text-gray-900">{recipe.title}</h2>
                {recipe.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">{recipe.description}</p>
                )}
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  {recipe.prepTime !== null && <span>Prep: {recipe.prepTime} min</span>}
                  {recipe.cookTime !== null && <span>Cook: {recipe.cookTime} min</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
