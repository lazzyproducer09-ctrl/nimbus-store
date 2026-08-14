"use client";

import { useEffect, useRef } from "react";

// A living hero backdrop: slow-drifting aurora blobs + a spotlight that follows
// the cursor. Pure CSS transforms (GPU-friendly), disabled for reduced-motion.
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* drifting aurora blobs (the "alive" background) */}
      <span className="aurora aurora-1" />
      <span className="aurora aurora-2" />
      <span className="aurora aurora-3" />
      {/* cursor-following spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(480px circle at var(--mx, 70%) var(--my, 28%), rgba(204,255,46,0.10), transparent 62%)",
        }}
      />
    </div>
  );
}
