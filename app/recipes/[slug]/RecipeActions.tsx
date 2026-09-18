"use client";

import { useState } from "react";

export default function RecipeActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Ignore cancelled native shares.
    }
  }

  function openGraphic() {
    const slug = window.location.pathname.split("/").pop() ?? "";
    window.open(`/recipes/${slug}/social-image`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">
        Print Recipe
      </button>
      <button type="button" onClick={share} className="rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700">
        {copied ? "Link Copied!" : "Share Recipe"}
      </button>
      <button type="button" onClick={openGraphic} className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700">
        Social Graphic
      </button>
    </div>
  );
}
