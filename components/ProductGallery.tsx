"use client";

import { useState } from "react";
import { UmbrellaMark } from "./icons";

// Product image gallery: a big main image + clickable thumbnails.
// Uses the product's REAL uploaded images (falls back to a placeholder).
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-mist">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={main}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-storm/50">
            <UmbrellaMark className="h-20 w-20" />
            <span className="text-xs text-muted">product photo</span>
          </div>
        )}
      </div>

      {/* thumbnails — only when there's more than one real image */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                i === active ? "border-storm" : "border-line hover:border-ink/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
