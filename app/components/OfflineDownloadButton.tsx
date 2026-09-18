"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CACHE_NAME = "recipe-cms-recipes-v3";

export default function OfflineDownloadButton() {
  const [status, setStatus] = useState<"idle" | "downloading" | "ready" | "error">("idle");
  const [savedCount, setSavedCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    async function checkSavedRecipes() {
      if (!("caches" in window)) return;

      try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        const saved = requests.some((request) => {
          const url = new URL(request.url);
          return url.origin === window.location.origin && /^\/recipes\/[^/]+$/.test(url.pathname);
        });
        const count = requests.filter((request) => /^\\/recipes\\/[^/]+$/.test(new URL(request.url).pathname)).length;
        if (saved) {
          setSavedCount(count);
          setStatus("ready");
        }
      } catch {}
    }

    checkSavedRecipes();
  }, []);

  async function downloadRecipes() {
    if (status === "downloading") return;

    setStatus("downloading");

    try {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all([cache.add("/"), cache.add("/recipes"), cache.add("/offline")]);

      const response = await fetch("/recipes", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load recipes");

      const html = await response.text();
      const recipeUrls = [...html.matchAll(/href=["'](\/recipes\/[^"'?#]+)["']/g)]
        .map((match) => match[1])
        .filter((url, index, list) => list.indexOf(url) === index);

      let downloaded = 0;

      for (const url of recipeUrls) {
        try {
          const recipeResponse = await fetch(url, { cache: "no-store" });
          if (!recipeResponse.ok) continue;
          await cache.put(url, recipeResponse.clone());
          downloaded += 1;
        } catch {}
      }

      if (recipeUrls.length > 0 && downloaded === 0) {
        throw new Error("No recipes could be saved");
      }

      setSavedCount(downloaded);

      localStorage.setItem(
        "recipe-cms-offline-ready",
        JSON.stringify({ version: 3, downloaded, updatedAt: new Date().toISOString() }),
      );

      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4">
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <button
          type="button"
          onClick={downloadRecipes}
          disabled={status === "downloading"}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition sm:w-auto sm:px-5 ${status === "ready" ? "bg-green-600 text-white" : "bg-[#082a7b] text-white hover:bg-[#061f5c]"} disabled:cursor-wait disabled:opacity-70`}
        >
          {status === "downloading"
            ? "Saving recipes…"
            : status === "error"
              ? "Try Download Again"
              : status === "ready"
                ? `✓ ${savedCount} ${savedCount === 1 ? "Recipe" : "Recipes"} Offline`
                : "Download for Offline"}
        </button>

        <a
          href="/offline"
          className="w-full rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-gray-700 shadow-lg ring-1 ring-gray-200 sm:w-auto"
        >
          Open Offline Library
        </a>
      </div>
    </div>
  );
}
