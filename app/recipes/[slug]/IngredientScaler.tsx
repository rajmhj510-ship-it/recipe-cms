"use client";

import { useMemo, useState } from "react";

type Ingredient = { id: number; text: string };
type Section = { id: number; title: string; items: Ingredient[] };

function parseNumber(value: string): number | null {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+\/\d+$/.test(parts[1])) {
    const [a, b] = parts[1].split("/").map(Number);
    return b ? Number(parts[0]) + a / b : null;
  }
  if (/^\d+\/\d+$/.test(value.trim())) {
    const [a, b] = value.trim().split("/").map(Number);
    return b ? a / b : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  const common = [
    [0.25, "¼"], [0.333, "⅓"], [0.5, "½"], [0.667, "⅔"], [0.75, "¾"],
  ] as const;
  const match = common.find(([n]) => Math.abs(rounded - n) < 0.01);
  return match ? match[1] : String(rounded).replace(/\.0+$/, "");
}

function scaleText(text: string, ratio: number): string {
  const match = text.match(/^\s*(\d+(?:\.\d+)?(?:\s+\d+\/\d+|\/\d+)?|\d+\/\d+)(?=\s|$)/);
  if (!match) return text;
  const value = parseNumber(match[1]);
  if (value === null) return text;
  return text.replace(match[1], formatNumber(value * ratio));
}

export default function IngredientScaler({
  sections,
  originalServings,
}: {
  sections: Section[];
  originalServings: number;
}) {
  const [servings, setServings] = useState(originalServings);
  const ratio = servings / originalServings;
  const scaledSections = useMemo(
    () => sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item, text: scaleText(item.text, ratio) })),
    })),
    [sections, ratio]
  );

  function change(delta: number) {
    setServings((current) => Math.max(1, Math.min(100, current + delta)));
  }

  return (
    <div className="mt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <div>
          <p className="font-semibold text-gray-900">Adjust servings</p>
          <p className="text-sm text-gray-500">Quantities update automatically.</p>
        </div>
        <div className="flex items-center gap-2" aria-label="Serving size">
          <button type="button" onClick={() => change(-1)} disabled={servings <= 1} aria-label="Decrease servings" className="h-10 w-10 rounded-full bg-white text-lg font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 disabled:cursor-not-allowed disabled:opacity-40">−</button>
          <span className="min-w-14 text-center text-lg font-bold text-gray-900">{servings}</span>
          <button type="button" onClick={() => change(1)} disabled={servings >= 100} aria-label="Increase servings" className="h-10 w-10 rounded-full bg-white text-lg font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 disabled:cursor-not-allowed disabled:opacity-40">+</button>
        </div>
      </div>
      <div className="space-y-8">
        {scaledSections.map((section) => (
          <div key={section.id} className="rounded-2xl bg-gray-50 p-6">
            <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item.id} className="flex gap-3 leading-7 text-gray-700">
                  <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
