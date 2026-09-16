"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  time: string | null;
  difficulty: string | null;
  description: string | null;
};

type Props = {
  recipes: Recipe[];
};

export default function FeaturedCarousel({ recipes }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const total = recipes.length;
  const currentRecipe = recipes[currentIndex];

  function updateCarousel(newIndex: number) {
    if (isAnimating || total === 0) return;

    setIsAnimating(true);
    setShowPopup(false);

    const nextIndex = (newIndex + total) % total;
    setCurrentIndex(nextIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  }

  useEffect(() => {
    if (total <= 1 || showPopup) return;

    const timer = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % total);
    }, 1500);

    return () => clearInterval(timer);
  }, [total, showPopup]);

  if (total === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto flex h-[420px] w-full max-w-[1100px] items-center justify-center overflow-hidden px-10">
        <button
          type="button"
          onClick={() => updateCarousel(currentIndex - 1)}
          aria-label="Previous recipe"
          className="absolute left-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#082a7b]/90 text-2xl text-white shadow-lg transition hover:bg-[#082a7b]"
        >
          ‹
        </button>

        <div className="relative h-full w-full">
          {recipes.map((recipe, index) => {
            const offset = (index - currentIndex + total) % total;

            let position = "hidden";

            if (offset === 0) {
              position = "center";
            } else if (offset === 1) {
              position = "right-1";
            } else if (offset === 2) {
              position = "right-2";
            } else if (offset === total - 1) {
              position = "left-1";
            } else if (offset === total - 2) {
              position = "left-2";
            }

            const positionStyles: Record<string, string> = {
              center:
                "translate-x-[-50%] translate-y-[-50%] scale-[1.15] opacity-100 z-20",
              "left-1":
                "translate-x-[calc(-50%-200px)] translate-y-[-50%] scale-90 opacity-90 z-10 grayscale",
              "left-2":
                "translate-x-[calc(-50%-400px)] translate-y-[-50%] scale-80 opacity-50 z-[5] grayscale",
              "right-1":
                "translate-x-[calc(-50%+200px)] translate-y-[-50%] scale-90 opacity-90 z-10 grayscale",
              "right-2":
                "translate-x-[calc(-50%+400px)] translate-y-[-50%] scale-80 opacity-50 z-[5] grayscale",
              hidden:
                "translate-x-[-50%] translate-y-[-50%] scale-75 opacity-0 pointer-events-none",
            };

            return (
              <div
                key={recipe.id}
                className={`absolute left-1/2 top-1/2 h-[360px] w-[260px] overflow-hidden rounded-[18px] shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all duration-700 ease-out ${positionStyles[position]}`}
              >
                {position === "center" ? (
                  <button
                    type="button"
                    onClick={() => setShowPopup(true)}
                    className="block h-full w-full"
                    aria-label={`Preview ${recipe.title}`}
                  >
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                        No image
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateCarousel(index)}
                    className="h-full w-full"
                    aria-label={`Show ${recipe.title}`}
                  >
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                        No image
                      </div>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => updateCarousel(currentIndex + 1)}
          aria-label="Next recipe"
          className="absolute right-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#082a7b]/90 text-2xl text-white shadow-lg transition hover:bg-[#082a7b]"
        >
          ›
        </button>
      </div>

      <div className="mt-5 text-center">
        <h2 className="text-2xl font-bold text-[#082a7b]">
          {currentRecipe.title}
        </h2>

        <p className="mt-1 text-base text-gray-500">
          {currentRecipe.time || "Time not specified"}
          {" • "}
          {currentRecipe.difficulty || "Difficulty not specified"}
        </p>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              aria-label="Close recipe preview"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-2xl text-white transition hover:bg-black/80"
            >
              ×
            </button>

            <div className="h-72 bg-gray-100">
              {currentRecipe.image ? (
                <img
                  src={currentRecipe.image}
                  alt={currentRecipe.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="p-7">
              <h3 className="text-3xl font-bold text-gray-900">
                {currentRecipe.title}
              </h3>

              <div className="mt-3 flex gap-3 text-sm text-gray-500">
                <span>
                  {currentRecipe.time || "Time not specified"}
                </span>

                <span>•</span>

                <span>
                  {currentRecipe.difficulty || "Difficulty not specified"}
                </span>
              </div>

              {currentRecipe.description && (
                <p className="mt-4 line-clamp-3 leading-6 text-gray-600">
                  {currentRecipe.description}
                </p>
              )}

              <Link
                href={`/recipes/${currentRecipe.slug}`}
                className="mt-6 inline-block rounded-full bg-[#082a7b] px-6 py-3 font-semibold text-white transition hover:bg-[#061f5c]"
              >
                View Full Recipe →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
