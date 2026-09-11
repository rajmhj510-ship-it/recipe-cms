"use client";

import { useState } from "react";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function RecipeTitleSlugFields() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(makeSlug(value));
  }

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Recipe Title
        </label>

        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="e.g. Creamy Garlic Pasta"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Slug
        </label>

        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(makeSlug(event.target.value))}
          placeholder="e.g. creamy-garlic-pasta"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
        />

        <p className="mt-1 text-sm text-gray-500">
          This will be used in the recipe URL.
        </p>
      </div>
    </>
  );
}
