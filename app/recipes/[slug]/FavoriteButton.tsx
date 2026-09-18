"use client";

import { useState } from "react";

type FavoriteButtonProps = {
  initialFavorite: boolean;
  slug: string;
  canEdit: boolean;
};

export default function FavoriteButton({
  initialFavorite,
  slug,
  canEdit,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (!canEdit || loading) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/recipes/${slug}/favorite`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      const data = await response.json();
      setFavorite(data.favorite);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div aria-live="polite">
      {canEdit ? (
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={loading}
          className={`rounded-full px-5 py-3 font-semibold transition ${
            favorite
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-orange-50"
          } ${loading ? "cursor-wait opacity-70" : ""}`}
        >
          {loading
            ? "Saving..."
            : favorite
              ? "♥ Favorited"
              : "♡ Add to Favorites"}
        </button>
      ) : (
        <span
          className={`inline-flex rounded-full px-5 py-3 font-semibold ${
            favorite
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {favorite ? "♥ Favorite" : "♡ Not a favorite"}
        </span>
      )}
    </div>
  );
}
