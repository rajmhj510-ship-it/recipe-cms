"use client";

import { useEffect, useState } from "react";

const CACHE_NAME = "recipe-cms-recipes-v3";

export default function OfflineLibrary() {
  const [recipes, setRecipes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        const urls = requests
          .map((request) => new URL(request.url))
          .filter(
            (url) =>
              url.origin === window.location.origin &&
              /^\/recipes\/[^/]+$/.test(url.pathname),
          )
          .map((url) => url.pathname)
          .filter((value, index, list) => list.indexOf(value) === index)
          .sort();

        if (active) {
          setRecipes(urls);
          setReady(true);
        }
      } catch {
        if (active) setReady(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Loading saved recipes…
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl">
          ♨️
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          No recipes saved offline yet
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
          While you are online, use the Download for Offline button to save your recipe collection to this device.
        </p>
        <a
          href="/recipes"
          className="mt-5 inline-flex rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Browse Recipes
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {recipes.map((pathname) => {
        const slug = pathname.split("/").pop() || "";
        const title = decodeURIComponent(slug)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());

        return (
          <a
            key={pathname}
            href={pathname}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <p className="text-base font-semibold text-gray-900 group-hover:text-orange-600">
              {title}
            </p>
            <p className="mt-2 text-sm font-semibold text-orange-600">
              Open offline →
            </p>
          </a>
        );
      })}
    </div>
  );
}
