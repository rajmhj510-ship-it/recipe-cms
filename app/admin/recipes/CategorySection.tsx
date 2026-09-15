"use client";

import { useState } from "react";

type CategorySectionProps = {
  categoryName: string;
  recipeCount: number;
  children: React.ReactNode;
};

export default function CategorySection({
  categoryName,
  recipeCount,
  children,
}: CategorySectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {categoryName}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        <span className="text-xl text-gray-500">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && <div>{children}</div>}
    </section>
  );
}
