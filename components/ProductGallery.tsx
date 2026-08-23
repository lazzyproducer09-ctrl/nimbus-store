"use client";

import { useEffect, useState } from "react";
import { YoinkMark, SearchIcon, CloseIcon } from "./icons";

// Product image gallery: big main image + clickable thumbnails.
// Hovering a thumbnail previews it (temporary); clicking sets it (permanent).
// Clicking the main image opens a zoom lightbox (like Amazon).
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0); // the clicked / locked image
  const [hovered, setHovered] = useState<number | null>(null); // temporary preview
  const [zoomOpen, setZoomOpen] = useState(false);

  // While hovering a thumbnail show that one; otherwise show the locked one.
  const shownIndex = hovered ?? active;
  const main = images[shownIndex];

  return (
    <div>
      {/* main image */}
      <button
        type="button"
        onClick={() => main && setZoomOpen(true)}
        aria-label={main ? "Zoom image" : undefined}
        className="group relative block aspect-square w-full overflow-hidden rounded-3xl border border-edge bg-surface"
        style={{ cursor: main ? "zoom-in" : "default" }}
      >
        {main ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-void/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-chalk opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <SearchIcon className="h-3.5 w-3.5" />
              Click to zoom
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ash-dim">
            <YoinkMark className="h-20 w-20 text-volt" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-ash">product photo</span>
          </div>
        )}
      </button>

      {/* thumbnails — only when there's more than one real image */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                i === shownIndex ? "border-volt" : "border-edge hover:border-volt/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && main && (
        <ZoomModal src={main} alt={name} onClose={() => setZoomOpen(false)} />
      )}
    </div>
  );
}

// Fullscreen zoom viewer. On desktop, move the mouse to pan the zoomed image.
// Click the image to toggle zoom; Esc / backdrop / ✕ to close.
function ZoomModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function move(e: React.MouseEvent<HTMLImageElement>) {
    if (!zoomed) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-chalk transition-colors hover:bg-white/20"
      >
        <CloseIcon className="h-5 w-5" />
      </button>

      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          onMouseMove={move}
          onMouseLeave={() => setOrigin("50% 50%")}
          className="max-h-[90vh] max-w-[90vw] select-none rounded-lg object-contain transition-transform duration-200"
          style={{
            transform: zoomed ? "scale(2.2)" : "scale(1)",
            transformOrigin: origin,
            cursor: zoomed ? "zoom-out" : "zoom-in",
          }}
          draggable={false}
        />
      </div>

      <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/70">
        Click image to zoom · move mouse to pan · Esc to close
      </span>
    </div>
  );
}
