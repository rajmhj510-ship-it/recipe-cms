"use client";

import { useState } from "react";
import Link from "next/link";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  category: {
    name: string;
  } | null;
};

export default function HomeSearch({
  recipes,
}: {
  recipes: Recipe[];
}) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const results = recipes
    .map((recipe) => {
      const title = recipe.title.toLowerCase();
      const category = recipe.category?.name.toLowerCase() ?? "";

      let score = 0;

      // Exact title match = highest priority
      if (title === query) {
        score += 100;
      }

      // Title starts with the search term
      else if (title.startsWith(query)) {
        score += 80;
      }

      // Title contains the search term
      else if (title.includes(query)) {
        score += 60;
      }

      // Category contains the search term
      if (category.includes(query)) {
        score += 30;
      }

      return {
        recipe,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // Higher score first
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // If scores are equal, shorter title first
      return a.recipe.title.length - b.recipe.title.length;
    })
    .slice(0, 10)
    .map((item) => item.recipe);

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <form
        action="/recipes"
        method="get"
        className="flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-md"
      >
        <input
          type="text"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search recipes"
          inputMode="search"
          placeholder="Search recipes..."
          autoComplete="off"
          className="min-w-0 flex-1 px-6 py-4 text-gray-900 outline-none"
        />

        <button
          type="submit"
          className="bg-orange-600 px-8 font-semibold text-white transition hover:bg-orange-700"
        >
          Search
        </button>
      </form>

      {search.trim() && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-lg">
          {results.length > 0 ? (
            results.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="flex items-center gap-4 border-b border-gray-100 p-3 last:border-0 hover:bg-orange-50"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">
                    {recipe.title}
                  </h3>

                  {recipe.category && (
                    <p className="mt-1 text-sm text-orange-600">
                      {recipe.category.name}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="p-5 text-center text-sm text-gray-500">
              No recipes found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
