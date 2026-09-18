"use client";

import { useState } from "react";
import Link from "next/link";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
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
  const query = search.trim().toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => {
    if (!query) return true;
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.category?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search recipes..."
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          aria-label="Search recipes"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">No recipes found</h2>
          <p className="mt-2 text-gray-600">
            No recipes matched &quot;{search}&quot;.
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
                {recipe.category && (
                  <p className="text-sm font-medium text-orange-600">{recipe.category.name}</p>
                )}
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
