"use client";

import { useState } from "react";

type DeleteRecipeButtonProps = {
  recipeId: number;
  deleteRecipe: (formData: FormData) => void | Promise<void>;
};

export default function DeleteRecipeButton({
  recipeId,
  deleteRecipe,
}: DeleteRecipeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete recipe?
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this recipe? This action cannot
              be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <form action={deleteRecipe}>
                <input type="hidden" name="id" value={recipeId} />

                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Yes, delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
