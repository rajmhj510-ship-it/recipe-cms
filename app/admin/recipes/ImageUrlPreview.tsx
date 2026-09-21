"use client";

import { useState } from "react";

type ImageUrlPreviewProps = {
  defaultValue: string;
};

export default function ImageUrlPreview({
  defaultValue,
}: ImageUrlPreviewProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);

  return (
    <div>
      <label
        htmlFor="image"
        className="mb-2 block text-sm font-medium text-gray-900"
      >
        Image URL
      </label>

      <input
        id="image"
        name="image"
        type="url"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder="https://example.com/recipe-image.jpg"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
      />

      {imageUrl.trim() && (
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <img
            src={imageUrl}
            alt="Recipe preview"
            className="aspect-video w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
