"use client";

import { useEffect, useState } from "react";

const CACHE_NAME = "recipe-cms-recipes-v1";

export default function OfflineDownloadButton() {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    caches.has(CACHE_NAME).then((exists) => {
      if (exists) setStatus("ready");
    });
  }, []);

  async function downloadRecipes() {
    if (status === "downloading") return;

    setStatus("downloading");

    try {
      const cache = await caches.open(CACHE_NAME);

      await cache.add("/");
      await cache.add("/recipes");

      const response = await fetch("/recipes", { cache: "no-store" });
      const html = await response.text();

      const recipeUrls = [
        ...html.matchAll(/href=["'](\/recipes\/[^"'?#]+)["']/g),
      ]
        .map((match) => match[1])
        .filter((url, index, list) => list.indexOf(url) === index);

      for (const url of recipeUrls) {
        try {
          const recipeResponse = await fetch(url, { cache: "no-store" });

          if (!recipeResponse.ok) continue;

          await cache.put(url, recipeResponse.clone());
        } catch {}
      }

      localStorage.setItem("recipe-cms-offline-ready", "true");
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ready") {
    return (
      <button
        type="button"
        disabled
        className="fixed bottom-4 right-4 z-50 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        ✓ Available Offline
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={downloadRecipes}
      disabled={status === "downloading"}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-[#082a7b] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#061f5c] disabled:cursor-wait disabled:opacity-70"
    >
      {status === "downloading"
        ? "Downloading recipes…"
        : status === "error"
          ? "Try Download Again"
          : "Download for Offline"}
    </button>
  );
}
