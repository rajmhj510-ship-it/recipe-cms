"use client";

import { useState } from "react";
import Link from "next/link";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  category: { name: string } | null;
};

export default function HomeSearch({ recipes }: { recipes: Recipe[] }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const results = recipes
    .map((recipe) => {
      const title = recipe.title.toLowerCase();
      const category = recipe.category?.name.toLowerCase() ?? "";
      let score = 0;

      if (title === query) score += 100;
      else if (title.startsWith(query)) score += 80;
      else if (title.includes(query)) score += 60;

      if (category.includes(query)) score += 30;

      return { recipe, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.recipe.title.length - b.recipe.title.length
    )
    .slice(0, 10)
    .map((item) => item.recipe);

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <form
        action="/recipes"
        method="get"
        role="search"
        className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md sm:flex-row sm:rounded-full"
      >
        <label htmlFor="home-recipe-search" className="sr-only">
          Search recipes
        </label>
        <input
          id="home-recipe-search"
          type="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search recipes..."
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 px-5 py-4 text-gray-900 outline-none sm:px-6"
          aria-controls="home-search-results"
          aria-expanded={Boolean(search.trim())}
        />
        <button
          type="submit"
          className="px-6 py-3 font-semibold text-white transition hover:bg-orange-700 sm:px-8 sm:py-0"
          style={{ backgroundColor: "#ea580c" }}
        >
          Search
        </button>
      </form>

      {search.trim() && (
        <div
          id="home-search-results"
          className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-lg"
          aria-live="polite"
        >
          {results.length > 0 ? (
            results.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="flex items-center gap-4 border-b border-gray-100 p-3 last:border-0 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {recipe.image ? (
                    <img src={recipe.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">{recipe.title}</h3>
                  {recipe.category && (
                    <p className="mt-1 text-sm text-orange-600">{recipe.category.name}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="p-5 text-center text-sm text-gray-500">No recipes found.</p>
          )}
        </div>
      )}
    </div>
  );
}
