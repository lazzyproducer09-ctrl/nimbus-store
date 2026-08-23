"use client";

import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Floating "chat on WhatsApp" button.
//
// For an Indian D2C store this is the cheapest trust signal there is: a new
// brand nobody has heard of feels a lot safer when a real person is one tap
// away. It also catches the shoppers who would otherwise abandon at checkout
// with a question nobody answered.
//
// Hidden when no number is configured, and on admin/auth screens where a
// support bubble is just clutter.
// ---------------------------------------------------------------------------

const HIDDEN_PREFIXES = ["/admin", "/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email", "/checkout"];

export function whatsappHref(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function WhatsAppButton({ number, message }: { number: string; message: string }) {
  const pathname = usePathname();
  if (!number) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <a
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-30 flex h-12 items-center gap-2.5 rounded-full border border-edge bg-coal/90 pl-3.5 pr-4 text-sm font-medium text-chalk shadow-[0_10px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-volt/50 hover:text-volt"
    >
      <WhatsAppGlyph className="h-5 w-5 flex-shrink-0 text-[#25D366]" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}

/** Inline version for the product page — carries the product name into the chat. */
export function WhatsAppProductLink({
  number,
  message,
  productName,
}: {
  number: string;
  message: string;
  productName: string;
}) {
  if (!number) return null;
  return (
    <a
      href={whatsappHref(number, `${message} ${productName}`)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-edge px-5 text-sm font-medium text-chalk transition-colors hover:border-[#25D366]/60 hover:text-[#25D366]"
    >
      <WhatsAppGlyph className="h-4 w-4 text-[#25D366]" />
      Ask about this on WhatsApp
    </a>
  );
}
